import React, { type ReactNode, type CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: string;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, padding = '1.5rem', className = '', onClick, style }) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{ padding, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
