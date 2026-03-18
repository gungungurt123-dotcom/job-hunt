import React from 'react';

// Wrapper component to manage responsive styling and smooth transitions
const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      transition: 'opacity 0.3s ease-in-out',
    }}>
      {children}
    </div>
  );
};

export default Container;
