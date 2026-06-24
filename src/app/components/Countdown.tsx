import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string; // ISO string or parsable date
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

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
        <Clock className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="flex gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-3 min-w-[70px]">
            <span className="text-2xl font-black text-white">{String(item.value).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
