import React from 'react';
import Whiteboard from './components/Whiteboard.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <Whiteboard />
      </ErrorBoundary>
    </div>
  );
};

export default App;
