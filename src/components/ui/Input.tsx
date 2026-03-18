import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label?: string;
}

const Input: React.FC<InputProps> = ({ icon: Icon, label, className = '', ...props }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'border-color var(--transition-fast)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: Icon ? '0.75rem 1rem 0.75rem 2.5rem' : '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <div style={inputWrapperStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
        {Icon && <Icon size={18} style={iconStyle} />}
        <input style={inputStyle} {...props} />
      </div>
    </div>
  );
};

export default Input;
