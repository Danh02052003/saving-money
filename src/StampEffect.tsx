import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { loadAnimation } from './utils/loadAnimation';

export function StampEffect({ trigger }: { trigger: boolean }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (trigger) {
      loadAnimation('stamp').then(setData);
    }
  }, [trigger]);

  if (!trigger || !data) return null;
  return (
    <Lottie
      animationData={data}
      loop={false}
      style={{ width: 120, height: 120 }}
    />
  );
} 