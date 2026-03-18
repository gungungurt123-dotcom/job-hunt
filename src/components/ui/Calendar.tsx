import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskIndicator {
  date: string; // YYYY-MM-DD
  type: string;
}

interface CalendarProps {
  tasks?: TaskIndicator[];
  onDateSelect?: (date: string | null) => void;
  selectedDate?: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ tasks = [], onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate grid cells (blanks + actual days)
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const getDayMarkerColor = (type: string) => {
    switch (type) {
      case '面接': return 'var(--accent-primary)';
      case '締切': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
          {year}年 {month + 1}月
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigateMonth(-1)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px', 
        marginBottom: '0.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-muted)'
      }}>
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} style={{ color: day === '日' ? 'var(--danger)' : day === '土' ? 'var(--accent-primary)' : undefined }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px',
        textAlign: 'center'
      }}>
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} style={{ padding: '0.5rem' }} />;

          // Format date string for logic
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Check if today
          const today = new Date();
          const isToday = 
            day === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear();
            
          const isSelected = selectedDate === dateString;

          // Find tasks for this day
          const dayTasks = tasks.filter(t => t.date.startsWith(dateString));

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(isSelected ? null : dateString)}
              style={{
                position: 'relative',
                padding: '0.5rem 0',
                background: isSelected ? 'var(--bg-hover)' : 'transparent',
                border: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                color: isToday ? '#fff' : 'inherit',
                fontWeight: isToday ? 700 : 500
              }}>
                {day}
              </span>
              
              {/* Task Indicators (Dots) */}
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', position: 'absolute', bottom: '2px', left: 0, right: 0 }}>
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: getDayMarkerColor(t.type) 
                      }} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
