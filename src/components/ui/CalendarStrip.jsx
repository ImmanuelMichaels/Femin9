import { useState, useEffect, useCallback, useMemo } from 'react';
import {CalendarDays} from "lucide-react";
// import "./CalendarStrip.css";

const DAYS_IN_WEEK = 7;
const SUNDAY_INDEX = 0;
const MONDAY_INDEX = 1;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarStrip({ 
  accent = "var(--t)", 
  onDateSelect, 
  selectedDate: externalSelectedDate,
  appointments = [],
  maxWeeksOffset = 52
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  
  const [selectedDate, setSelectedDate] = useState(externalSelectedDate || today);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  // Sync external selected date
  useEffect(() => {
    if (externalSelectedDate) {
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);
  
  // Check if within bounds
  useEffect(() => {
    if (Math.abs(currentWeekOffset) > maxWeeksOffset) {
      setCurrentWeekOffset(0);
    }
  }, [currentWeekOffset, maxWeeksOffset]);
  
  const getWeekDates = useCallback(() => {
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + (currentWeekOffset * DAYS_IN_WEEK));
    
    const currentDay = baseDate.getDay();
    const daysToMonday = currentDay === SUNDAY_INDEX ? DAYS_IN_WEEK - 1 : currentDay - MONDAY_INDEX;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - daysToMonday);
    
    return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, [currentWeekOffset, today]);
  
  const weekDates = useMemo(() => getWeekDates(), [getWeekDates]);
  const todayDateStr = useMemo(() => today.toDateString(), [today]);
  
  const isToday = useCallback((date) => date.toDateString() === todayDateStr, [todayDateStr]);
  const isSelected = useCallback((date) => selectedDate?.toDateString() === date.toDateString(), [selectedDate]);
  
  const hasAppointment = useCallback((date) => {
    return appointments.some(apt => 
      new Date(apt.date).toDateString() === date.toDateString()
    );
  }, [appointments]);
  
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);
  
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekOffset(prev => prev - 1);
  }, []);
  
  const goToNextWeek = useCallback(() => {
    setCurrentWeekOffset(prev => prev + 1);
  }, []);
  
  const goToToday = useCallback(() => {
    setCurrentWeekOffset(0);
    setSelectedDate(today);
    onDateSelect?.(today);
  }, [today, onDateSelect]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPreviousWeek();
      if (e.key === 'ArrowRight') goToNextWeek();
      if (e.key === 't' || e.key === 'T') goToToday();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPreviousWeek, goToNextWeek, goToToday]);
  
  return (
    <div className="calendar-strip-container">
      {/* Week Navigation */}
      <div className="cal-nav">
        <button 
          onClick={goToPreviousWeek}
          className="cal-nav-btn"
          aria-label="Previous week"
        >
          {'<'}
        </button>
        <button 
          onClick={goToToday}
          className="cal-today-btn"
        >
          Today
        </button>
        <button 
          onClick={goToNextWeek}
          className="cal-nav-btn"
          aria-label="Next week"
        >
          {'>'}
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
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`cal-day ${isSelectedDay ? 'active' : ''} ${isCurrentDay ? 'today' : ''}`}
              style={isSelectedDay ? { } : {}}
              aria-label={`${WEEKDAYS[i]} ${date.getDate()} ${date.toLocaleDateString('en-NG', { month: 'short' })}`}
              aria-current={isCurrentDay ? 'date' : undefined}
            >
              <span className="cal-day-name">{WEEKDAYS[i]}</span>
              <span className="cal-day-num">{date.getDate()}</span>
              <span className="cal-month">{date.toLocaleDateString('en-NG', { month: 'short' })}</span>
              {hasAppt && <span className="cal-dot" style={{ backgroundColor: accent }} />}
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
        <CalendarDays
          size={18}
          className="cal-selected-icon"
      />

          <span className="cal-selected-value">
            {selectedDate.toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      )}
      
      {/* COMPLETE STYLES - ALL ORIGINAL CSS PRESERVED */}
      <style>{`
        .calendar-strip-container {
          background: #fff;
          border-radius: 28px;
          padding: 20px;
          box-shadow: 0 10px 30px rgb(15 23 42 / 2%), 
          0 4px 12px rgb(15 23 42 / 0%);
          border: 1px solid #f5f5f7;
          margin: 20px;
        }

        /* HEADER */

        .cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .cal-nav-btn {
          width: 46px;
          height: 46px;
          border: 1px solid rgb(15 23 42 / 8%);
          border-radius: 16px;
          background: #fff;
          color: #7c3aed;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all .25s ease;
          box-shadow:
            0 1px 5px rgb(15 23 42 / 10%);
        }

        .cal-nav-btn:hover {
          background: #7c3aed70;
          transform: translateY(-2px);
        }

        .cal-today-btn {
          color: #7C3AED;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          background: none;
        }

        /* DAYS */

        .cal-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .cal-strip::-webkit-scrollbar {
          display: none;
        }

        .cal-day {
          flex: 1;
          min-width: 30px;
          background: #fff;
          border: 1px solid transparent;
          border-radius: 22px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all .25s ease;
          position: relative;
        }

        .cal-day:hover {
          transform: translateY(-4px);
          background: #fff;
          box-shadow:
            0 10px 24px rgba(15,23,42,.08);
        }

        /* ACTIVE */

        .cal-day.active {
          background: #fff;
          border: 1px solid #d63384;
          box-shadow:
            0 2px 20px rgba(214,51,132,.25);
          transform: translateY(-3px);
        }
          );

          box-shadow:
            0 12px 30px rgba(214,51,132,.25);

          transform: translateY(-3px);
        }

        .cal-day.active .cal-day-name,
        .cal-day.active .cal-day-num,
        .cal-day.active .cal-month {
          color: white;
        }

        /* TODAY */

        .cal-day.today:not(.active) {
          background: #fff0f6;
          border: 1px solid #f9c2d9;
        }

        /* TEXT */

        .cal-day-name {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #9ca3af;
        }

        .cal-day-num {
          margin: 6px 0;

          font-size: 24px;
          font-weight: 800;
          color: #111827;
        }

        .cal-month {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
        }

        .cal-selected-icon {
          background: #7c3aed1c;
          color: #7C3AED;
          border-radius: 5px;
          width: 24px;
          height: 24px;
        }

        /* APPOINTMENT DOT */

        .cal-dot {
          position: absolute;
          top: 8px;
          right: 8px;

          width: 8px;
          height: 8px;

          border-radius: 50%;
          background: #10b981;
        }

        .cal-day.active .cal-dot {
          background: white;
        }

        /* TODAY INDICATOR */

        .cal-today-marker {
          position: absolute;
          bottom: 8px;

          width: 6px;
          height: 6px;

          border-radius: 50%;
          background: #d63384;
        }

        /* SELECTED DATE */

        .cal-selected-date {
          margin-top: 24px;
          padding: 16px;
          display: flex;
          border-top: 1px solid rgba(15,23,42,.05);
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          align-item: center;
        }

        .cal-selected-label {
          color: #6b7280;
          font-weight: 600;
        }

        .cal-selected-value {
          color: #111827;
          font-weight: 700;
          color: #7C3AED;
          font-family: 'poppins', sans-serif;
        }

        /* MOBILE */

        @media (max-width: 768px) {
          .cal-day {
            min-width: 64px;
          }

          .cal-day-num {
            font-size: 20px;
          }

          .cal-nav-btn {
            width: 42px;
            height: 42px;
          }
        }
              
      `}</style>
    </div>
  );
}