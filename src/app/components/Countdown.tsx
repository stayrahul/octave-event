import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string;
  label?: string;
}

export default function Countdown({ targetDate, label = "Time Remaining" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isClient) return null;

  const isUrgent = timeLeft.days <= 3;
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
          <Clock className="w-4 h-4" />
          <span>Event is Live!</span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm">
          🎉 The event has started! See you there!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-white/60'}`}>
        <Clock className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
        <span>{label}</span>
        {isUrgent && (
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse">
            Only {timeLeft.days}d left!
          </span>
        )}
      </div>
      <div className="flex gap-3">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center rounded-xl p-3 min-w-[65px] border transition-colors ${
              isUrgent
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <motion.span
              key={item.value}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`text-2xl font-black tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`}
            >
              {String(item.value).padStart(2, '0')}
            </motion.span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
