import { useState } from 'react';

export default function CalendarStrip() {
  const today = new Date();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (today.getDay() + 6) % 7;
  const nums = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx + i);
    return d.getDate();
  });
  const [active, setActive] = useState(todayIdx);

  return (
    <div className="cal-strip">
      {days.map((day, i) => (
        <button key={i} onClick={() => setActive(i)}
          className={`cal-day${active === i ? " active" : ""}`}>
          <span className="cal-day-name">{day}</span>
          <span className="cal-day-num">{nums[i]}</span>
          {i === todayIdx && active !== i && (
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--t)" }} />
          )}
        </button>
      ))}
    </div>
  );
}
