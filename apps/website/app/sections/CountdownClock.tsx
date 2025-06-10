// CountdownClock.tsx
'use client';

import React, { useEffect, useState } from 'react';

export type CountdownClockProps = {
  targetDate: Date | string;
  className?: string;
  onExpire?: () => void;
  finishedMessage?: string;
};

const getTimeRemaining = (target: Date) => {
  const total = target.getTime() - new Date().getTime();
  const seconds = Math.max(Math.floor((total / 1000) % 60), 0);
  const minutes = Math.max(Math.floor((total / 1000 / 60) % 60), 0);
  const hours = Math.max(Math.floor((total / (1000 * 60 * 60)) % 24), 0);
  const days = Math.max(Math.floor(total / (1000 * 60 * 60 * 24)), 0);
  return { total, days, hours, minutes, seconds };
};

const pad = (n: number) => n.toString().padStart(2, '0');

const CountdownClock: React.FC<CountdownClockProps> = ({
  targetDate,
  className = '',
  onExpire,
  finishedMessage = 'Time is up!',
}) => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client-side only to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const initialTime = getTimeRemaining(target);
    setTimeLeft(initialTime);
    if (initialTime.total <= 0) {
      setExpired(true);
      if (onExpire) onExpire();
      return;
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    if (timeLeft.total <= 0 && !expired) {
      setExpired(true);
      if (onExpire) onExpire();
      return;
    }
    if (expired) return;
    
    const timer = setInterval(() => {
      const updated = getTimeRemaining(target);
      setTimeLeft(updated);
      if (updated.total <= 0) {
        setExpired(true);
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, targetDate, timeLeft.total, expired, onExpire]);

  // Show placeholder during server render to prevent hydration mismatch
  if (!isClient) {
    return <div className={`${className}`}></div>;
  }
  
  if (expired) {
    return (
      <div
        className={`text-center text-lg font-semibold text-red-400 dark:text-red-300 ${className}`}
        role="status"
        aria-live="polite"
      >
        {finishedMessage}
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center items-center gap-4 text-2xl font-mono text-white dark:text-gray-100 ${className}`}
      role="timer"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold">{pad(timeLeft.days)}</span>
        <span className="text-xs uppercase text-gray-400">Days</span>
      </div>
      <span className="text-3xl font-bold text-neon-purple">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold">{pad(timeLeft.hours)}</span>
        <span className="text-xs uppercase text-gray-400">Hours</span>
      </div>
      <span className="text-3xl font-bold text-neon-purple">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold">{pad(timeLeft.minutes)}</span>
        <span className="text-xs uppercase text-gray-400">Minutes</span>
      </div>
      <span className="text-3xl font-bold text-neon-purple">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold">{pad(timeLeft.seconds)}</span>
        <span className="text-xs uppercase text-gray-400">Seconds</span>
      </div>
    </div>
  );
};

export default CountdownClock;
