import { useState, useEffect } from 'react';

export default function CalendarStrip({ accent = "var(--t)", onDateSelect, selectedDate: externalSelectedDate }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(externalSelectedDate || today);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  // Update internal state when external prop changes
  useEffect(() => {
    if (externalSelectedDate) {
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);
  
  // Get days of week (Monday first as per UK/Nigeria convention)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Calculate dates for current week view
  const getWeekDates = () => {
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + (currentWeekOffset * 7));
    
    // Get Monday of current week (0 = Sunday, so adjust)
    const currentDay = baseDate.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - daysToMonday);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };
  
  const weekDates = getWeekDates();
  const todayDateStr = today.toDateString();
  
  const isToday = (date) => date.toDateString() === todayDateStr;
  const isSelected = (date) => selectedDate?.toDateString() === date.toDateString();
  
  const handleDateSelect = (date, index) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };
  
  const goToPreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };
  
  const goToNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };
  
  const goToToday = () => {
    setCurrentWeekOffset(0);
    setSelectedDate(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  };
  
  // Get appointment indicator (mock data - replace with real appointments)
  const hasAppointment = (date) => {
    const appointmentDates = ['15', '22', '28'];
    return appointmentDates.includes(date.getDate().toString());
  };
  
  return (
    <div className="calendar-strip-container">
      {/* Week Navigation */}
      <div className="cal-nav">
        <button 
          onClick={goToPreviousWeek}
          className="cal-nav-btn"
          aria-label="Previous week"
        >
          ←
        </button>
        <button 
          onClick={goToToday}
          className="cal-today-btn"
          style={{ '--accent': accent }}
        >
          Today
        </button>
        <button 
          onClick={goToNextWeek}
          className="cal-nav-btn"
          aria-label="Next week"
        >
          →
        </button>
      </div>
      
      {/* Days Grid */}
      <div className="cal-strip">
        {weekDates.map((date, i) => {
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSelected(date);
          const hasAppt = hasAppointment(date);
          
          return (
            <button
              key={i}
              onClick={() => handleDateSelect(date, i)}
              className={`cal-day ${isSelectedDay ? 'active' : ''} ${isCurrentDay ? 'today' : ''}`}
              style={isSelectedDay ? { '--accent': accent } : {}}
              aria-label={`${days[i]} ${date.getDate()} ${date.toLocaleDateString('en-NG', { month: 'short' })}`}
              aria-current={isCurrentDay ? 'date' : undefined}
            >
              <span className="cal-day-name">{days[i]}</span>
              <span className="cal-day-num">{date.getDate()}</span>
              <span className="cal-month">{date.toLocaleDateString('en-NG', { month: 'short' })}</span>
              {hasAppt && <span className="cal-dot" style={{ background: accent }} />}
              {isCurrentDay && !isSelectedDay && (
                <span className="cal-today-marker" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selected Date Display */}
      {selectedDate && (
        <div className="cal-selected-date">
          <span className="cal-selected-label">Selected:</span>
          <span className="cal-selected-value">
            {selectedDate.toLocaleDateString('en-NG', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      )}
      
      {/* FIX: removed 'jsx' attribute from style tag */}
      <style>{`
        .calendar-strip-container {
          background: var(--card);
          border-radius: var(--r2);
          padding: var(--sp-3) var(--sp-2);
          box-shadow: var(--sh);
        }
        
        .cal-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--sp-3);
          padding: 0 var(--sp-2);
        }
        
        .cal-nav-btn {
          background: var(--warm);
          border: 1px solid var(--border);
          border-radius: var(--r);
          padding: var(--sp-2) var(--sp-3);
          font-size: var(--fs-sm);
          font-weight: 700;
          color: var(--dp);
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          transition: all 0.2s;
        }
        
        .cal-nav-btn:hover {
          background: var(--t);
          color: #fff;
          border-color: var(--t);
        }
        
        .cal-today-btn {
          background: var(--accent, var(--t));
          color: #fff;
          border: none;
          border-radius: var(--r);
          padding: var(--sp-2) var(--sp-4);
          font-size: var(--fs-sm);
          font-weight: 700;
          cursor: pointer;
          min-width: 70px;
          min-height: 44px;
          transition: all 0.2s;
        }
        
        .cal-today-btn:hover {
          opacity: 0.85;
          transform: scale(0.98);
        }
        
        .cal-strip {
          display: flex;
          gap: var(--gap-sm);
          justify-content: space-between;
          margin-bottom: var(--sp-3);
        }
        
        .cal-day {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-1);
          padding: var(--sp-2) var(--sp-1);
          background: transparent;
          border: 2px solid transparent;
          border-radius: var(--r);
          cursor: pointer;
          transition: all 0.2s;
          min-width: 50px;
          position: relative;
        }
        
        .cal-day:hover {
          background: var(--warm);
          border-color: var(--border);
        }
        
        .cal-day.active {
          background: var(--accent, var(--t));
          border-color: var(--accent, var(--t));
        }
        
        .cal-day.active .cal-day-name,
        .cal-day.active .cal-day-num,
        .cal-day.active .cal-month {
          color: #fff;
        }
        
        .cal-day.today {
          border-color: #d63a6e40;
          background: rgb(241 90 139 / 55%);
        }
        
        .cal-day-name {
          font-size: var(--fs-xs);
          font-weight: 600;
          color: var(--mt);
          text-transform: uppercase;
        }
        
        .cal-day.active .cal-day-name {
          color: #fff;
        }
        
        .cal-day-num {
          font-size: var(--fs-xl);
          font-weight: 800;
          color: var(--dp);
          line-height: 1;
        }
        
        .cal-day.active .cal-day-num {
          color: #fff;
        }
        
        .cal-month {
          font-size: var(--fs-2xs);
          color: var(--mt);
          font-weight: 500;
        }
        
        .cal-day.active .cal-month {
          color: #fff;
          opacity: 0.9;
        }
        
        .cal-dot {
          position: absolute;
          bottom: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent, var(--t));
        }
        
        .cal-today-marker {
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent, var(--t));
        }
        
        .cal-selected-date {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--gap-sm);
          padding-top: var(--sp-2);
          margin-top: var(--sp-2);
          border-top: 1px solid var(--border);
          font-size: var(--fs-sm);
        }
        
        .cal-selected-label {
          color: var(--mt);
          font-weight: 600;
        }
        
        .cal-selected-value {
          color: var(--dp);
          font-weight: 700;
        }
        
        @media (max-width: 480px) {
          .cal-strip {
            gap: var(--gap-xs);
          }
          
          .cal-day {
            min-width: 40px;
            padding: var(--sp-1) var(--sp-1);
          }
          
          .cal-day-num {
            font-size: var(--fs-md);
          }
          
          .cal-month {
            font-size: var(--fs-2xs);
          }
          
          .cal-nav-btn, .cal-today-btn {
            padding: var(--sp-1) var(--sp-2);
            font-size: var(--fs-xs);
          }
        }
      `}</style>
    </div>
  );
}