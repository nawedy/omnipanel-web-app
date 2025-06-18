// CountdownClock.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface CountdownClockProps {
  targetDate: Date;
  className?: string;
  finishedMessage?: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownClock({
  targetDate,
  className = '',
  finishedMessage = 'Time expired!',
  onExpire,
}: CountdownClockProps): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = (): TimeLeft => {
      const difference = +targetDate - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`}>
        <div className="bg-neon-blue/20 rounded-lg p-4 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">00</div>
          <div className="text-xs text-gray-300">DAYS</div>
        </div>
        <div className="text-neon-blue text-2xl">:</div>
        <div className="bg-neon-blue/20 rounded-lg p-4 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">00</div>
          <div className="text-xs text-gray-300">HRS</div>
        </div>
        <div className="text-neon-blue text-2xl">:</div>
        <div className="bg-neon-blue/20 rounded-lg p-4 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">00</div>
          <div className="text-xs text-gray-300">MIN</div>
        </div>
        <div className="text-neon-blue text-2xl">:</div>
        <div className="bg-neon-blue/20 rounded-lg p-4 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">00</div>
          <div className="text-xs text-gray-300">SEC</div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center ${className}`}
      >
        <div className="text-2xl font-bold text-red-400">{finishedMessage}</div>
      </motion.div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEC' },
  ];

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {timeUnits.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <motion.div
            key={`${unit.label}-${unit.value}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            className="bg-neon-blue/20 rounded-lg p-4 min-w-[60px] text-center border border-neon-blue/30"
          >
            <div className="text-2xl font-bold text-white">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-300">{unit.label}</div>
          </motion.div>
          {index < timeUnits.length - 1 && (
            <div className="text-neon-blue text-2xl animate-pulse">:</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
