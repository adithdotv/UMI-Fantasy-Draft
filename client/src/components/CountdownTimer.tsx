import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: bigint;
  className?: string;
}

export function CountdownTimer({ deadline, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadlineSeconds = Number(deadline);
      const diff = deadlineSeconds - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
      
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span className={`${isExpired ? 'text-red-500' : 'text-yellow-500'} ${className}`}>
      {timeLeft}
    </span>
  );
}
