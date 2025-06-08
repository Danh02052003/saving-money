// Danh sách các ngày có thể chọn
const availableDays = [];

// Thêm các số đơn lẻ
const singleDays = [
  36, 40, 41, 42, 43, 44, 45, 46, 61, 62, 65, 66, 67, 68, 69, 70, 71, 83, 84,
  85, 86, 90, 91, 92, 93, 94, 95, 96, 106, 107, 108, 109, 110, 111, 112, 115,
  136, 137, 291, 292, 293, 294, 295, 296, 298, 299,
];
availableDays.push(...singleDays);

// Thêm các dải số
const ranges = [
  [124, 124],
  [130, 134],
  [140, 149],
  [151, 161],
  [166, 175],
  [177, 186],
  [191, 199],
  [201, 211],
  [216, 224],
  [226, 236],
  [241, 250],
  [276, 286],
  [301, 311],
  [316, 323],
  [326, 335],
  [341, 359],
];

ranges.forEach(([start, end]) => {
  for (let i = start; i <= end; i++) {
    availableDays.push(i);
  }
});

availableDays.sort((a, b) => a - b);

// Dữ liệu cho từng tháng
let monthsData = {
  6: { target: 2116724, selected: [], paid: [], startDay: 9, totalDays: 22 },
  7: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 31 },
  8: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 31 },
  9: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 30 },
  10: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 31 },
  11: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 30 },
  12: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 31 },
  1: { target: 2200000, selected: [], paid: [], startDay: 1, totalDays: 31 },
};

let currentMonth = 6;

function switchMonth(month) {
  currentMonth = month;

  // Cập nhật tab active
  document.querySelectorAll(".month-tab").forEach((tab) => {
    tab.classList.remove("active");
    if (parseInt(tab.dataset.month) === month) {
      tab.classList.add("active");
    }
  });

  // Cập nhật thông tin tháng
  updateMonthInfo();
  updateDisplay();
}

function updateMonthInfo() {
  const data = monthsData[currentMonth];
  const monthName = currentMonth === 1 ? "1/2026" : `${currentMonth}/2025`;

  document.getElementById("targetInput").value = data.target;

  let dayInfo;
  if (currentMonth === 6) {
    dayInfo = `Thời gian: ${data.startDay}/6 - 30/6 (${data.totalDays} ngày)`;
  } else {
    const daysInMonth = data.totalDays;
    dayInfo = `Thời gian: ${data.startDay}/${
      currentMonth === 1 ? "1" : currentMonth
    } - ${daysInMonth}/${
      currentMonth === 1 ? "1" : currentMonth
    } (${daysInMonth} ngày)`;
  }

  document.getElementById("monthInfo").textContent = dayInfo;
  document.getElementById(
    "calendarTitle"
  ).textContent = `Lịch tháng ${monthName} (hiển thị ngày đóng tiền):`;

  // Cập nhật trạng thái tháng
  updateMonthStatus();
}

function updateMonthStatus() {
  const data = monthsData[currentMonth];
  const monthName = currentMonth === 1 ? "1/2026" : `${currentMonth}/2025`;
  const statusBar = document.getElementById("statusBar");

  const requiredDays = data.totalDays;
  const selectedCount = data.selected.length;
  const paidCount = data.paid.length;
  const total = data.selected.reduce((sum, day) => sum + day * 1000, 0);
  const isComplete =
    selectedCount === requiredDays &&
    total >= data.target &&
    paidCount === selectedCount;

  if (isComplete) {
    statusBar.textContent = `Tháng ${monthName}: ✅ Hoàn thành (${paidCount}/${selectedCount} ngày đã đóng)`;
    statusBar.style.background = "#e8f5e8";
  } else if (paidCount > 0) {
    statusBar.textContent = `Tháng ${monthName}: 🔄 Đang thực hiện (${paidCount}/${selectedCount} ngày đã đóng)`;
    statusBar.style.background = "#fff3e0";
  } else {
    statusBar.textContent = `Tháng ${monthName}: ⏳ Chưa hoàn thành`;
    statusBar.style.background = "#ffebee";
  }

  // Cập nhật tab completed
  const tab = document.querySelector(`[data-month="${currentMonth}"]`);
  if (isComplete) {
    tab.classList.add("completed");
  } else {
    tab.classList.remove("completed");
  }
}

function updateTarget() {
  const newTarget = parseInt(document.getElementById("targetInput").value);
  if (newTarget && newTarget > 0) {
    monthsData[currentMonth].target = newTarget;
    updateDisplay();
  }
}

const findPaidDays = () => {
  const paidDays = [];
  for (let i = 1; i <= 365; i++) {
    if (!availableDays.includes(i)) {
      paidDays.push(i);
    }
  }
  return paidDays;
};

// Sửa lại hàm createDaysGrid để hiển thị và khóa các ngày đã đóng
function createDaysGrid() {
  const grid = document.getElementById("daysGrid");
  grid.innerHTML = "";
  const paidDays = findPaidDays();

  // Hiển thị tất cả các ngày từ 1-365
  for (let i = 1; i <= 365; i++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day-item";
    dayElement.textContent = i;

    if (paidDays.includes(i)) {
      dayElement.classList.add("already-paid");
      dayElement.title = "Đã đóng quỹ trước đó";
      // Vô hiệu hóa click event cho ngày đã đóng
      dayElement.style.cursor = "not-allowed";
    } else {
      dayElement.onclick = () => toggleDay(i);
    }

    grid.appendChild(dayElement);
  }
}

function toggleDay(day) {
  const data = monthsData[currentMonth];
  const selectedIndex = data.selected.indexOf(day);
  const paidIndex = data.paid.indexOf(day);

  if (paidIndex > -1) {
    // Nếu đã đóng, bỏ đánh dấu đã đóng
    data.paid.splice(paidIndex, 1);
  } else if (selectedIndex > -1) {
    // Nếu đã chọn nhưng chưa đóng, đánh dấu đã đóng
    data.paid.push(day);
  } else {
    // Nếu chưa chọn, thêm vào danh sách chọn
    data.selected.push(day);
  }

  updateDisplay();
}

function updateDisplay() {
  const data = monthsData[currentMonth];

  // Cập nhật hiển thị các ngày được chọn
  const dayElements = document.querySelectorAll(".day-item");
  dayElements.forEach((element) => {
    const day = parseInt(element.textContent);
    element.classList.remove("selected", "paid");

    if (data.paid.includes(day)) {
      element.classList.add("paid");
    } else if (data.selected.includes(day)) {
      element.classList.add("selected");
    }
  });

  // Tính tổng
  const total = data.selected.reduce((sum, day) => sum + day * 1000, 0);
  document.getElementById("currentTotal").textContent =
    total.toLocaleString("vi-VN");

  // Hiển thị chênh lệch
  const difference = total - data.target;
  const diffElement = document.getElementById("difference");

  if (difference === 0) {
    diffElement.innerHTML = '<span class="exact">✓ Chính xác!</span>';
  } else if (difference < 0) {
    diffElement.innerHTML = `<span class="remaining">⚠️ Còn thiếu: ${Math.abs(
      difference
    ).toLocaleString("vi-VN")} đồng</span>`;
  } else {
    diffElement.innerHTML = `<span class="exact">✓ Thừa: ${difference.toLocaleString(
      "vi-VN"
    )} đồng (OK)</span>`;
  }

  // Cập nhật số ngày
  const requiredDays = data.totalDays;
  let dayCountElement = document.getElementById("dayCount");

  if (data.selected.length === requiredDays) {
    dayCountElement.innerHTML = `<span class="exact">✓ Đủ ${requiredDays} ngày (${data.paid.length} đã đóng)</span>`;
  } else if (data.selected.length < requiredDays) {
    dayCountElement.innerHTML = `<span class="remaining">⚠️ Đã chọn ${data.selected.length}/${requiredDays} ngày (${data.paid.length} đã đóng)</span>`;
  } else {
    dayCountElement.innerHTML = `<span class="over">Thừa ${
      data.selected.length - requiredDays
    } ngày (${data.paid.length} đã đóng)</span>`;
  }

  updateMonthCalendar();
  updateMonthStatus();
}

function updateMonthCalendar() {
  const data = monthsData[currentMonth];
  const calendar = document.getElementById("monthCalendar");
  calendar.innerHTML = "";

  // Tạo header cho các ngày trong tuần
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  weekDays.forEach((day) => {
    const header = document.createElement("div");
    header.style.fontWeight = "bold";
    header.style.background = "#e0e0e0";
    header.textContent = day;
    calendar.appendChild(header);
  });

  // Tính ngày đầu tiên của tháng (0 = Chủ nhật)
  let firstDay;
  if (currentMonth === 6) firstDay = 0; // Tháng 6/2025
  else if (currentMonth === 7) firstDay = 2; // Tháng 7/2025
  else if (currentMonth === 8) firstDay = 5; // Tháng 8/2025
  else if (currentMonth === 9) firstDay = 1; // Tháng 9/2025
  else if (currentMonth === 10) firstDay = 3; // Tháng 10/2025
  else if (currentMonth === 11) firstDay = 6; // Tháng 11/2025
  else if (currentMonth === 12) firstDay = 1; // Tháng 12/2025
  else if (currentMonth === 1) firstDay = 3; // Tháng 1/2026

  // Thêm các ô trống cho những ngày trước ngày 1
  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  // Thêm các ngày trong tháng
  const sortedSelected = [...data.selected].sort((a, b) => a - b);

  for (let day = 1; day <= data.totalDays; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "month-day";

    if (day >= data.startDay) {
      const dayIndex = day - data.startDay;

      if (dayIndex < sortedSelected.length) {
        const paymentAmount = sortedSelected[dayIndex];
        dayElement.classList.add("has-payment");

        if (data.paid.includes(paymentAmount)) {
          dayElement.classList.add("paid");
        }

        dayElement.innerHTML = `${day}<br><small>${paymentAmount}k</small>`;
      } else {
        dayElement.textContent = day;
      }
    } else {
      dayElement.textContent = day;
      dayElement.style.opacity = "0.3";
    }

    calendar.appendChild(dayElement);
  }
}

function clearAll() {
  const data = monthsData[currentMonth];
  data.selected = [];
  data.paid = [];
  updateDisplay();
}

function autoSelect() {
  const data = monthsData[currentMonth];
  data.selected = [];
  data.paid = [];

  const requiredDays = data.totalDays;
  const sortedDays = [...availableDays].sort((a, b) => a - b);

  // Chọn các số nhỏ nhất trước
  const smallestDays = sortedDays.slice(0, requiredDays);
  let currentSum = smallestDays.reduce((sum, day) => sum + day * 1000, 0);

  data.selected = [...smallestDays];

  // Nếu tổng < target, thay thế các số nhỏ bằng số lớn hơn
  if (currentSum < data.target) {
    const remainingDays = sortedDays.slice(requiredDays).sort((a, b) => b - a);

    for (let i = 0; i < data.selected.length && currentSum < data.target; i++) {
      const currentDay = data.selected[i];

      for (const biggerDay of remainingDays) {
        if (biggerDay > currentDay) {
          const newSum = currentSum - currentDay * 1000 + biggerDay * 1000;
          if (
            newSum >= data.target ||
            biggerDay === remainingDays[remainingDays.length - 1]
          ) {
            currentSum = newSum;
            data.selected[i] = biggerDay;
            remainingDays.splice(remainingDays.indexOf(biggerDay), 1);
            break;
          }
        }
      }
    }
  }

  updateDisplay();
}

function markAllPaid() {
  const data = monthsData[currentMonth];
  data.paid = [...data.selected];
  updateDisplay();
}

function exportSchedule() {
  let result = "=== LỊCH ĐÓNG TIỀN ===\n\n";

  Object.keys(monthsData).forEach((month) => {
    const data = monthsData[month];
    const monthName = month == 1 ? "1/2026" : `${month}/2025`;

    result += `THÁNG ${monthName}:\n`;
    result += `- Số tiền cần đóng: ${data.target.toLocaleString(
      "vi-VN"
    )} đồng\n`;

    if (data.selected.length > 0) {
      const sortedSelected = [...data.selected].sort((a, b) => a - b);
      const total = sortedSelected.reduce((sum, day) => sum + day * 1000, 0);

      result += `- Tổng tiền đã chọn: ${total.toLocaleString("vi-VN")} đồng\n`;
      result += `- Các ngày được chọn (${sortedSelected.length} ngày):\n`;

      sortedSelected.forEach((day, index) => {
        const dayInMonth = data.startDay + index;
        const status = data.paid.includes(day) ? " ✓" : "";
        result += `  + Ngày ${dayInMonth}/${
          month == 1 ? "1" : month
        }: ${day}k${status}\n`;
      });

      const paidCount = data.paid.length;
      result += `- Trạng thái: ${paidCount}/${sortedSelected.length} ngày đã đóng\n`;
    } else {
      result += "- Chưa chọn ngày nào\n";
    }

    result += "\n";
  });

  const exportDiv = document.getElementById("exportResult");
  exportDiv.textContent = result;
  exportDiv.style.display = "block";
}

// Event listeners
document.querySelectorAll(".month-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchMonth(parseInt(tab.dataset.month));
  });
});

// Khởi tạo
createDaysGrid();
updateMonthInfo();
updateDisplay();
