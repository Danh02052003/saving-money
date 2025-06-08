import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { loadAnimation } from './utils/loadAnimation';

export function ProgressCircle({ percent, socket }: { percent: number, socket: any }) {
  const [data, setData] = useState<any>(null);
  const lottieRef = useRef<any>();

  useEffect(() => {
    loadAnimation('progress').then(setData);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('saving-update', (data: any) => {
      if (lottieRef.current) {
        lottieRef.current.goToAndStop(data.percent, true);
      }
    });
    return () => socket && socket.off('saving-update');
  }, [socket]);

  if (!data) return null;
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={false}
        style={{ width: 120, height: 120 }}
      />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 24, color: '#1565c0'
      }}>
        {percent}%
      </div>
    </div>
  );
} 