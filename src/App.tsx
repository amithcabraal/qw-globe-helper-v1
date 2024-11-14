import React from 'react';
import WorldMap from './components/WorldMap';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 aspect-[16/9] relative">
          <WorldMap />
        </div>
      </div>
    </div>
  );
}

export default App;