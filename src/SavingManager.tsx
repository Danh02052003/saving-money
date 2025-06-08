import React, { useEffect, useState, useRef } from 'react';
import './assets/savingManager.css';
import savingQuotes from './assets/savingQuotes.js';
import { StampEffect } from './StampEffect';
import { Player } from '@lottiefiles/react-lottie-player';
import progressBar from './assets/animations/circular-progress.json';
import clearedImg from './assets/animations/image-removebg-preview.png';

// Available days logic
const getAvailableDays = () => {
  const availableDays: number[] = [];
  const singleDays = [
    36, 40, 41, 42, 43, 44, 45, 46, 61, 62, 65, 66, 67, 68, 69, 70, 71, 83, 84,
    85, 86, 90, 91, 92, 93, 94, 95, 96, 106, 107, 108, 109, 110, 111, 112, 115,
    136, 137, 291, 292, 293, 294, 295, 296, 298, 299,
  ];
  availableDays.push(...singleDays);
  const ranges = [
    [115, 124], [130, 134], [140, 149], [151, 161], [166, 175], [177, 186],
    [191, 199], [201, 211], [216, 224], [226, 236], [241, 250], [251, 261],
    [266, 275], [276, 286], [301, 311], [316, 323], [326, 335], [341, 359]
  ];
  ranges.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) availableDays.push(i);
  });
  availableDays.sort((a, b) => a - b);
  return availableDays;
};

const defaultMonthsData: Record<number, any> = {
  6: { target: 2116724, selected: [], paid: [], startDay: 9, totalDays: 22 },
  7: { target: 3289724, selected: [], paid: [], startDay: 1, totalDays: 31 },
  8: { target: 6748153, selected: [], paid: [], startDay: 1, totalDays: 31 },
  9: { target: 6748153, selected: [], paid: [], startDay: 1, totalDays: 30 },
  10: { target: 6748153, selected: [], paid: [], startDay: 1, totalDays: 31 },
  11: { target: 8097783, selected: [], paid: [], startDay: 1, totalDays: 30 },
  12: { target: 8097783, selected: [], paid: [], startDay: 1, totalDays: 31 },
  1: { target: 8097783, selected: [], paid: [], startDay: 1, totalDays: 31 },
};

const monthTabs = [6, 7, 8, 9, 10, 11, 12, 1];

function getRandomQuotes(quotesArray: any[], n: number) {
  const shuffled = quotesArray.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function allocatePayments(n_days: number, total_amount: number, availableDays: number[]) {
  if (n_days <= 0 || n_days > availableDays.length) return { payments: null, excess: 0 };
  const base = availableDays.slice(0, n_days);
  const T_min = base.reduce((a, b) => a + b, 0);
  const T_max = availableDays.slice(-n_days).reduce((a, b) => a + b, 0);
  if (total_amount < T_min * 1000) {
    return { payments: base.map(x => x * 1000), excess: T_min * 1000 - total_amount };
  }
  if (total_amount > T_max * 1000) {
    return { payments: null, excess: 0 };
  }
  let payments = [...base];
  let remaining = Math.round((total_amount - T_min * 1000) / 1000);
  let used = new Set(payments);
  let idx = availableDays.length - 1;
  for (let i = n_days - 1; i >= 0 && remaining > 0; i--) {
    while (idx >= 0 && (used.has(availableDays[idx]) || availableDays[idx] <= payments[i])) {
      idx--;
    }
    if (idx < 0) break;
    const max_val = availableDays[idx];
    const current_val = payments[i];
    const max_increase = max_val - current_val;
    const increase = Math.min(remaining, max_increase);
    payments[i] += increase;
    remaining -= increase;
    used.delete(current_val);
    used.add(payments[i]);
  }
  return { payments: payments.map(x => x * 1000), excess: remaining * 1000 };
}

// Ví dụ tích hợp hiệu ứng đóng mộc khi xác nhận thành công
function PaymentStamp({ show, onComplete }: { show: boolean, onComplete?: () => void }) {
  if (!show) return null;
  return (
    <Player
      src={approvedStamp}
      style={{ width: 150, height: 150 }}
      autoplay
      keepLastFrame
      onEvent={e => {
        if (e === 'complete' && onComplete) onComplete();
      }}
    />
  );
}

// Ví dụ tích hợp progress bar động
function ProgressBar({ percent }: { percent: number }) {
  const progressRef = useRef<any>(null);
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.goToAndStop(percent, true);
    }
  }, [percent]);
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <Player
        ref={progressRef}
        src={progressBar}
        style={{ width: 120, height: 120 }}
        autoplay
        keepLastFrame
      />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 24, color: '#1565c0'
      }}>{percent}%</div>
    </div>
  );
}

// Hiệu ứng đóng mộc bằng video mp4
function PaymentStampVideo({ show, onEnd }: { show: boolean, onEnd?: () => void }) {
  if (!show) return null;
  return (
    <video
      src="/approved-stamp.mp4"
      width={80}
      height={80}
      autoPlay
      onEnded={onEnd}
      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2, borderRadius: 12, pointerEvents: 'none', background: 'transparent' }}
    />
  );
}

const SavingManager: React.FC = () => {
  const [monthsData, setMonthsData] = useState(() => {
    const saved = localStorage.getItem('monthsData');
    return saved ? JSON.parse(saved) : defaultMonthsData;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const saved = localStorage.getItem('currentMonth');
    return saved ? parseInt(saved) : 6;
  });
  const [permanentlyPaidDays, setPermanentlyPaidDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('permanentlyPaidDays');
    return saved ? JSON.parse(saved) : [];
  });
  const [availableDays, setAvailableDays] = useState<number[]>(getAvailableDays());
  const [showQuotes, setShowQuotes] = useState<{show: boolean, quotes: any[]}>({show: false, quotes: []});
  const [exportResult, setExportResult] = useState<string>('');
  const [clearedDays, setClearedDays] = useState<{ [day: number]: boolean }>({});
  const [stampingDay, setStampingDay] = useState<number | null>(61);

  useEffect(() => {
    // Remove paid days from availableDays
    setAvailableDays(getAvailableDays().filter(day => !permanentlyPaidDays.includes(day)));
    // Save to localStorage
    localStorage.setItem('monthsData', JSON.stringify(monthsData));
    localStorage.setItem('currentMonth', currentMonth.toString());
    localStorage.setItem('permanentlyPaidDays', JSON.stringify(permanentlyPaidDays));
  }, [monthsData, currentMonth, permanentlyPaidDays]);

  const data = monthsData[currentMonth];
  const requiredDays = data.totalDays;
  const selectedCount = data.selected.length;
  const paidCount = data.paid.length;
  const total = data.selected.reduce((sum: number, day: number) => sum + day * 1000, 0);
  const difference = total - data.target;
  const isComplete = selectedCount === requiredDays && total >= data.target && paidCount === selectedCount;

  const handleMonthTab = (month: number) => {
    setCurrentMonth(month);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthsData((prev: any) => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        target: parseInt(e.target.value) || 0
      }
    }));
  };

  const updateTarget = () => {
    localStorage.setItem('monthsData', JSON.stringify(monthsData));
  };

  const clearAll = () => {
    setMonthsData((prev: any) => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        selected: [],
        paid: []
      }
    }));
  };

  const autoSelect = () => {
    const { payments } = allocatePayments(data.totalDays, data.target, availableDays);
    setMonthsData((prev: any) => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        selected: payments ? payments.map((x: number) => x / 1000) : [],
      }
    }));
  };

  const markAllPaid = () => {
    setMonthsData((prev: any) => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        paid: [...prev[currentMonth].selected]
      }
    }));
    setPermanentlyPaidDays(prev => Array.from(new Set([...prev, ...data.selected])));
    setShowQuotes({show: true, quotes: getRandomQuotes(savingQuotes, 1)});
  };

  const handlePayDay = (day: number) => {
    if (permanentlyPaidDays.includes(day) || data.paid.includes(day) || !availableDays.includes(day)) return;
    const selectedIndex = data.selected.indexOf(day);
    if (selectedIndex > -1) {
      if (window.confirm(`Bạn có muốn đánh dấu ngày ${day} đã đóng không?`)) {
        setMonthsData((prev: any) => ({
          ...prev,
          [currentMonth]: {
            ...prev[currentMonth],
            paid: [...prev[currentMonth].paid, day]
          }
        }));
        setPermanentlyPaidDays(prev => [...prev, day]);
        setShowQuotes({show: true, quotes: getRandomQuotes(savingQuotes, 1)});
        setStampingDay(day);
      }
    } else {
      setMonthsData((prev: any) => ({
        ...prev,
        [currentMonth]: {
          ...prev[currentMonth],
          selected: [...prev[currentMonth].selected, day]
        }
      }));
    }
  };

  const exportSchedule = () => {
    let result = '=== LỊCH ĐÓNG TIỀN ===\n\n';
    Object.keys(monthsData).forEach((month) => {
      const d = monthsData[month];
      const monthName = month === '1' ? '1/2026' : `${month}/2025`;
      result += `THÁNG ${monthName}:\n`;
      result += `- Số tiền cần đóng: ${d.target.toLocaleString('vi-VN')} đồng\n`;
      if (d.selected.length > 0) {
        const sortedSelected = [...d.selected].sort((a, b) => a - b);
        const total = sortedSelected.reduce((sum, day) => sum + day * 1000, 0);
        result += `- Tổng tiền đã chọn: ${total.toLocaleString('vi-VN')} đồng\n`;
        result += `- Các ngày được chọn (${sortedSelected.length} ngày):\n`;
        sortedSelected.forEach((day, index) => {
          const dayInMonth = d.startDay + index;
          const status = d.paid.includes(day) ? ' ✓' : '';
          result += `  + Ngày ${dayInMonth}/${month === '1' ? '1' : month}: ${day}k${status}\n`;
        });
        const paidCount = d.paid.length;
        result += `- Trạng thái: ${paidCount}/${sortedSelected.length} ngày đã đóng\n`;
      } else {
        result += '- Chưa chọn ngày nào\n';
      }
      result += '\n';
    });
    setExportResult(result);
  };

  // Calendar rendering
  const renderMonthCalendar = () => {
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let firstDay = 0;
    if (currentMonth === 6) firstDay = 0;
    const actualDaysInMonth = currentMonth === 6 ? 30 : currentMonth === 1 ? 31 : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][currentMonth - 1];
    const days: any[] = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`}></div>);
    for (let day = 1; day <= actualDaysInMonth; day++) {
      let content = day;
      let className = 'month-day';
      if (day >= data.startDay && day - data.startDay < data.totalDays) {
        const dayIndex = day - data.startDay;
        if (dayIndex < data.selected.length) {
          const selectedDay = data.selected[dayIndex];
          className += ' has-payment';
          content = <>{day}<br/><small>{selectedDay}k</small></>;
          if (data.paid.includes(selectedDay)) className += ' paid';
        }
      } else if (day < data.startDay) {
        className += ' faded';
      }
      days.push(<div className={className} key={day}>{content}</div>);
    }
    return <div className="days-for-month">{weekDays.map(d => <div key={d} style={{fontWeight:'bold',background:'#e0e0e0'}}>{d}</div>)}{days}</div>;
  };

  return (
    <div className="container">
      <h1>Quản lý đóng tiền hàng tháng</h1>
      <div className="month-selector">
        <div><strong>Chọn tháng để quản lý:</strong></div>
        <div className="month-tabs">
          {monthTabs.map(month => (
            <div
              key={month}
              className={`month-tab${currentMonth === month ? ' active' : ''}${isComplete ? ' completed' : ''}`}
              data-month={month}
              onClick={() => handleMonthTab(month)}
            >
              {month === 1 ? 'Tháng 1/2026' : `Tháng ${month}/2025`}
            </div>
          ))}
        </div>
      </div>
      <div className="status-bar" id="statusBar">
        {currentMonth === 1 ? 'Tháng 1/2026' : `Tháng ${currentMonth}/2025`}: {isComplete ? `✅ Hoàn thành (${paidCount}/${selectedCount} ngày đã đóng)` : paidCount > 0 ? `🔄 Đang thực hiện (${paidCount}/${selectedCount} ngày đã đóng)` : '⏳ Chưa hoàn thành'}
      </div>
      <div className="target-amount">
        <div className="target-input">
          <label>Số tiền cần đóng tháng này: </label>
          <input type="number" value={data.target} onChange={handleTargetChange} />
          <span> đồng</span>
          <button onClick={updateTarget} style={{marginLeft:10,padding:'5px 10px'}}>Cập nhật</button>
        </div>
        <div id="monthInfo">
          {currentMonth === 6 ? `Thời gian: ${data.startDay}/6 - 30/6 (${data.totalDays} ngày)` : `Thời gian: ${data.startDay}/${currentMonth === 1 ? '1' : currentMonth} - ${(currentMonth === 1 ? 31 : [31,28,31,30,31,30,31,31,30,31,30,31][currentMonth-1])}/${currentMonth === 1 ? '1' : currentMonth} (${data.totalDays} ngày)`}
        </div>
      </div>
      <div className="controls">
        <button onClick={clearAll}>Xóa tất cả</button>
        <button onClick={autoSelect} className="auto-select">Tự động chọn tối ưu</button>
        <button onClick={markAllPaid} className="mark-paid">Đánh dấu tất cả đã đóng</button>
        <button onClick={exportSchedule} className="export-btn">Xuất lịch đóng tiền</button>
      </div>
      <div className="current-total" id="totalDisplay">
        Tổng hiện tại: <span id="currentTotal">{total.toLocaleString('vi-VN')}</span> đồng <br />
        <span id="difference">{difference === 0 ? <span className="exact">✓ Chính xác!</span> : difference < 0 ? <span className="remaining">⚠️ Còn thiếu: {Math.abs(difference).toLocaleString('vi-VN')} đồng</span> : <span className="exact">✓ Thừa: {difference.toLocaleString('vi-VN')} đồng (OK)</span>}</span>
        <br />
        <span id="dayCount">{data.selected.length === requiredDays ? <span className="exact">✓ Đủ {requiredDays} ngày ({data.paid.length} đã đóng)</span> : data.selected.length < requiredDays ? <span className="remaining">⚠️ Đã chọn {data.selected.length}/{requiredDays} ngày ({data.paid.length} đã đóng)</span> : <span className="over">Thừa {data.selected.length - requiredDays} ngày ({data.paid.length} đã đóng)</span>}</span>
      </div>
      <h3 style={{color:'#1565c0',marginTop:30}}>Chọn các ngày từ danh sách: <small>(Xanh dương: đã chọn, Cam: đã đóng)</small></h3>
      <div className="days-grid">
        {Array.from({length:365},(_,i)=>i+1).map((day: number): React.ReactNode => {
          const isAvailable = availableDays.includes(day);
          let className = 'day-item';
          if (!isAvailable) className += ' paid';
          else if (permanentlyPaidDays.includes(day)) className += ' already-paid';
          else if (data.paid.includes(day)) className += ' paid';
          else if (data.selected.includes(day)) className += ' selected';

          // Nếu đang stamping thì phát video, sau đó mới chuyển sang cleared
          if (stampingDay === day) {
            return (
              <div key={day} className={className} style={{ position: 'relative', cursor: 'default' }}>
                <video
                  src="/approved-stamp.mp4"
                  width={110}
                  height={110}
                  autoPlay
                  onLoadedMetadata={e => {
                    const video = e.currentTarget;
                    if (video.duration > 2) video.currentTime = 0;
                    setTimeout(() => {
                      setMonthsData((prev: any) => ({
                        ...prev,
                        [currentMonth]: {
                          ...prev[currentMonth],
                          paid: [...prev[currentMonth].paid, day]
                        }
                      }));
                      setPermanentlyPaidDays(prev => prev.includes(day) ? prev : [...prev, day]);
                      setStampingDay(null);
                    }, 2000);
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 100,
                    height: 100,
                    transform: 'translate(-50%,-50%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    background: 'transparent',
                    borderRadius: '50%',
                    border: 'none',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
            );
          }

          if (!isAvailable) {
            return (
              <div key={day} className={className} style={{ position: 'relative', cursor: 'default' }}>
                <img src={clearedImg} alt="cleared" style={{ position: 'absolute', top: '50%', left: '50%', width: 48, height: 48, transform: 'translate(-50%,-50%)', zIndex: 2, pointerEvents: 'none' }} />
              </div>
            );
          }
          const isPaid = data.paid.includes(day) || permanentlyPaidDays.includes(day);
          return (
            <div key={day} className={className} style={{ position: 'relative', cursor: isAvailable ? 'pointer' : 'default' }} onClick={() => isAvailable && !isPaid && !stampingDay && handlePayDay(day)}>
              {isPaid ? (
                <img src={clearedImg} alt="cleared" style={{ position: 'absolute', top: '50%', left: '50%', width: 48, height: 48, transform: 'translate(-50%,-50%)', zIndex: 2, pointerEvents: 'none' }} />
              ) : (
                <span>{day}</span>
              )}
            </div>
          );
        })}
      </div>
      <h3 id="calendarTitle">Lịch tháng {currentMonth === 1 ? '1/2026' : `${currentMonth}/2025`} (hiển thị ngày đóng tiền):</h3>
      {renderMonthCalendar()}
      <div className="export-result" id="exportResult" style={{display: exportResult ? 'block' : 'none'}}>{exportResult}</div>
      {showQuotes.show && <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowQuotes({show:false,quotes:[]})}>
        <div style={{background:'white',padding:30,borderRadius:10,maxWidth:400}} onClick={e=>e.stopPropagation()}>
          <h3>💡 Động lực tiết kiệm cho bạn!</h3>
          {showQuotes.quotes.map((q,i)=>(<div key={i} style={{marginBottom:10}}><b>"{q.quote}"</b><br/><span style={{fontStyle:'italic'}}>— {q.author}</span></div>))}
          <button onClick={()=>setShowQuotes({show:false,quotes:[]})}>Đóng</button>
        </div>
      </div>}
    </div>
  );
};

export default SavingManager; 