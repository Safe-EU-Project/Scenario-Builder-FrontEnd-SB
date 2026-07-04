import { useEffect, useState } from "react";
import { GiAlarmClock } from "react-icons/gi";

export default function ClockCountDown({handleTimeFinish}) {
  const [time, setTime] = useState({
    days: 0,
    hours: 1,
    minutes: 0,
    seconds: 0,
  });

  // useEffect(()=>{
  //   if (time.days===0 && time.hours===0 && time.minutes===0 && time.seconds===0){
  //       alert('time has been exceed .....')
  //       handleTimeFinish()
  //   }
  // },[time])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          alert('time has been exceed .....')
          handleTimeFinish()
          //return prev;
        }

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);
    // clean up the event:
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2">
      <GiAlarmClock className="clock-icon" />
      <TimeBlock label="days" value={time.days} />
      <TimeBlock label="hours" value={time.hours} />
      <TimeBlock label="min" value={time.minutes} />
      <TimeBlock label="sec" value={time.seconds} />
    </div>
  );
}

function TimeBlock({ label, value }) {
  return (
    <div>
      <span className="countdown font-mono text-1xl">
        <span
          style={{ "--value": value }}
          aria-live="polite"
        >
          {value}
        </span>
      </span>
      {label}
    </div>
  );
}
