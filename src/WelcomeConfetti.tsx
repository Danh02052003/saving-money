import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { loadAnimation } from './utils/loadAnimation';

export function WelcomeConfetti({ show, streak, achievement }: { show: boolean, streak: number, achievement: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (show) loadAnimation('welcome').then(setData);
  }, [show]);

  if (!show || !data) return null;
  return (
    <div className="welcome-modal">
      <Lottie animationData={data} loop={false} style={{ width: 300 }} />
      <h2>Chào mừng trở lại!</h2>
      <p>Chuỗi ngày liên tiếp: {streak}</p>
      <p>Thành tích: {achievement}</p>
    </div>
  );
} 