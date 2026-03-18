import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '8px',
    fontWeight: 500,
    transition: 'all var(--transition-normal)',
    cursor: 'pointer',
    border: 'none',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--accent-gradient)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--danger)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    }
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '0.4rem 0.8rem', fontSize: '0.875rem' },
    md: { padding: '0.6rem 1.2rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
  };

  const style = { ...baseStyle, ...variants[variant], ...sizes[size] };

  // Note: Using inline styles for quick primitives, but ideally these would be CSS classes
  // We'll manage hover states via a small trick or just let the user rely on generic button styling.
  
  return (
    <button 
      style={style} 
      className={`btn-${variant} ${className}`}
      onMouseEnter={(e) => {
        if(variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)';
        else if (variant === 'secondary') e.currentTarget.style.background = 'var(--bg-secondary)';
      }}
      onMouseLeave={(e) => {
        if(variant === 'primary') e.currentTarget.style.transform = 'translateY(0)';
        else if (variant === 'secondary') e.currentTarget.style.background = 'var(--bg-tertiary)';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
