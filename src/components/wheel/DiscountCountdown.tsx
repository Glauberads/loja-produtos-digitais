import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface DiscountCountdownProps {
  expiresAt: number;
  onExpire?: () => void;
  className?: string;
}

export const DiscountCountdown: React.FC<DiscountCountdownProps> = ({ expiresAt, onExpire, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      return diff;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const isDanger = timeLeft < 60; // Less than 1 minute

  if (timeLeft <= 0) return null;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-[10px] font-black ${isDanger ? 'text-red-500 animate-pulse' : 'text-emerald-500'} ${className}`}>
      <Timer size={12} />
      <span>Expira em: {formattedTime}</span>
    </div>
  );
};
