import React from 'react';

interface ToolbarProps {
  onAddBox: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddBox }) => {
  return (
    <div className="toolbar mb-4">
      <div className="flex items-center justify-between space-x-5">
        <h1 className="text-xl font-bold text-center uppercase">
          Beautiful Whiteboard
        </h1>

        <div>
          <button
            onClick={onAddBox} 
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded-full hover:bg-blue-600"
          >
            Add Box
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
