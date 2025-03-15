import React, { useEffect, useState } from 'react';
import './CustomCursor.css';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseEnter = () => {
      setHidden(false);
    };

    const handleMouseDown = () => {
      setClicked(true);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    window.addEventListener('mousemove', updatePosition);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div 
        className={`cursor-dot ${clicked ? 'cursor-dot--clicked' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          opacity: hidden ? 0 : 1
        }}
      />
      <div 
        className={`cursor-outline ${clicked ? 'cursor-outline--clicked' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          opacity: hidden ? 0 : 1
        }}
      />
    </>
  );
};