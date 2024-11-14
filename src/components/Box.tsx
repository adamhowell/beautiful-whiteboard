import React, { useState, useEffect, useCallback } from 'react';

interface BoxProps {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

const Box: React.FC<BoxProps> = ({ x, y, width, height, isSelected, onSelect, onMove, onResize }) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(true);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onMove(newX, newY);
    }
  }, [dragging, dragOffset, onMove]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setResizing(false);
  }, []);

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    setResizeOffset({
      width: e.clientX - (x + width),
      height: e.clientY - (y + height),
    });
  };

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (resizing) {
      const minSize = 50; // Minimum size to prevent boxes from becoming too small
      const newWidth = Math.max(minSize, e.clientX - x - resizeOffset.width);
      const newHeight = Math.max(minSize, e.clientY - y - resizeOffset.height);
      onResize(newWidth, newHeight);
    }
  }, [resizing, resizeOffset, x, y, onResize]);

  const handleResizeMouseUp = useCallback(() => {
    setResizing(false);
  }, []);

  // Attach and remove window event listeners for dragging and resizing
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    if (resizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
    } else {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    }

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [dragging, resizing, handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        zIndex: 10,
      }}
      className={`bg-yellow-100 border ${isSelected ? 'border-blue-500 border-2' : 'border-yellow-200'} rounded-sm shadow-sm`}
      onMouseDown={(e) => {
        onSelect(e);
        handleMouseDown(e);
      }}
    >
      {/* Resize Handle */}
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          cursor: 'nwse-resize',
          width: '20px',
          height: '20px',
          borderLeft: '20px solid transparent',
          borderBottom: '20px solid #4a5568',
          opacity: 0.5,
          zIndex: 1,
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};

export default Box;
