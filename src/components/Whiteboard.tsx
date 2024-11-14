import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Box from './Box.tsx';
import Toolbar from './Toolbar.tsx';

interface BoxData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
}

interface BoxUpdate {
  id: number;
  x: number;
  y: number;
}

const socket: Socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

/**
 * Whiteboard component that manages boxes and their interactions
 * Supports box creation, selection, movement, and real-time collaboration
 */
const Whiteboard: React.FC = () => {
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [selectedBoxIds, setSelectedBoxIds] = useState<Set<number>>(new Set());
  const [selectionBox, setSelectionBox] = useState<BoxData | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Function to add a new box
  const addBox = (): void => {
    const newBox: BoxData = {
      id: Date.now(),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      selected: false,
    };
    setBoxes([...boxes, newBox]);
    socket.emit('add-box', newBox);
  };

  const updateBoxPosition = (id: number, x: number, y: number): void => {
    setBoxes(boxes.map(box => box.id === id ? { ...box, x, y } : box));
    socket.emit('move-box', { id, x, y });
  };

  const updateBoxSize = (id: number, width: number, height: number): void => {
    setBoxes(boxes.map(box => box.id === id ? { ...box, width, height } : box));
    socket.emit('resize-box', { id, width, height });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setSelectedBoxIds(new Set());
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const selectedBoxes = boxes.filter(box => selectedBoxIds.has(box.id));
        if (selectedBoxes.length > 0) {
          window.localStorage.setItem('copiedBoxes', JSON.stringify(selectedBoxes));
        }
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        const copiedBoxes: BoxData[] = JSON.parse(window.localStorage.getItem('copiedBoxes') || '[]');
        const newBoxes = copiedBoxes.map(box => ({
          ...box,
          id: Date.now() + Math.random(), // Ensure unique ID
          x: box.x + 10,
          y: box.y + 10
        }));
        setBoxes([...boxes, ...newBoxes]);
        newBoxes.forEach(box => socket.emit('add-box', box));
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const deletedIds = Array.from(selectedBoxIds);
        const newBoxes = boxes.filter(box => !selectedBoxIds.has(box.id));
        setBoxes(newBoxes);
        setSelectedBoxIds(new Set());
        socket.emit('delete-boxes', deletedIds);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [boxes, selectedBoxIds]);

  useEffect(() => {
    socket.on('box-added', (newBox: BoxData) => {
      setBoxes(boxes => [...boxes, newBox]);
    });

    socket.on('box-moved', ({ id, x, y }: BoxUpdate) => {
      setBoxes(boxes => boxes.map(box => 
        box.id === id ? { ...box, x, y } : box
      ));
    });

    socket.on('boxes-moved', (updates: BoxUpdate[]) => {
      setBoxes(boxes => boxes.map(box => {
        const update = updates.find(u => u.id === box.id);
        return update ? { ...box, x: update.x, y: update.y } : box;
      }));
    });

    socket.on('box-resized', ({ id, width, height }: { id: number; width: number; height: number }) => {
      setBoxes(boxes => boxes.map(box => 
        box.id === id ? { ...box, width, height } : box
      ));
    });

    socket.on('boxes-deleted', (deletedIds: Array<number>) => {
      setBoxes(boxes => boxes.filter(box => !deletedIds.includes(box.id)));
    });

    return () => {
      socket.off('box-added');
      socket.off('box-moved');
      socket.off('boxes-moved');
      socket.off('box-resized');
      socket.off('boxes-deleted');
    };
  }, []);

  return (
    <div className="bg-gray-100 flex flex-col h-screen p-5">
      <div className="flex-none">
        <Toolbar onAddBox={addBox} />
      </div>
      <div 
        className="bg-white flex-grow overflow-auto relative rounded-lg shadow whiteboard"
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          if ((e.target as HTMLElement).classList.contains('whiteboard')) {
            setIsDraggingSelection(true);
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setSelectionStart({ x, y });
            setSelectionBox({ id: -1, x, y, width: 0, height: 0, selected: false });
            setSelectedBoxIds(new Set());
          }
        }}
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          if (isDraggingSelection) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setSelectionBox({
              id: -1,
              x: Math.min(x, selectionStart.x),
              y: Math.min(y, selectionStart.y),
              width: Math.abs(x - selectionStart.x),
              height: Math.abs(y - selectionStart.y),
              selected: false
            });
          }
        }}
        onMouseUp={() => {
          if (isDraggingSelection && selectionBox) {
            const selected = boxes.filter(box => 
              box.x < (selectionBox.x + selectionBox.width) &&
              (box.x + box.width) > selectionBox.x &&
              box.y < (selectionBox.y + selectionBox.height) &&
              (box.y + box.height) > selectionBox.y
            );
            setSelectedBoxIds(new Set(selected.map(box => box.id)));
            setIsDraggingSelection(false);
            setSelectionBox(null);
          }
        }}
      >
        {selectionBox && (
          <div
            style={{
              position: 'absolute',
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height,
              border: '1px solid #4a90e2',
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              pointerEvents: 'none',
            }}
          />
        )}
        {boxes.map(box => (
          <Box
            key={box.id}
            {...box}
            isSelected={selectedBoxIds.has(box.id)}
            onSelect={(e: React.MouseEvent) => {
              if (!e.shiftKey) {
                setSelectedBoxIds(new Set([box.id]));
              } else {
                setSelectedBoxIds(prev => {
                  const next = new Set(prev);
                  next.add(box.id);
                  return next;
                });
              }
            }}
            onMove={(x: number, y: number) => {
              if (selectedBoxIds.has(box.id)) {
                const deltaX = x - box.x;
                const deltaY = y - box.y;
                const updates: BoxUpdate[] = [];
                boxes.forEach(b => {
                  if (selectedBoxIds.has(b.id)) {
                    const newX = b.x + deltaX;
                    const newY = b.y + deltaY;
                    updates.push({ id: b.id, x: newX, y: newY });
                    setBoxes(boxes => boxes.map(box => 
                      box.id === b.id ? { ...box, x: newX, y: newY } : box
                    ));
                  }
                });
                socket.emit('move-boxes', updates);
              } else {
                updateBoxPosition(box.id, x, y);
              }
            }}
            onResize={(width: number, height: number) => updateBoxSize(box.id, width, height)}
          />
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;