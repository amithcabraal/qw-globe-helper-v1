import React from 'react';
import { MapPin, ZoomIn, ZoomOut, Globe } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoom: (direction: 'in' | 'out') => void;
  selectedCountry: string | null;
  showAllCountries: boolean;
  onToggleCountries: () => void;
  onResetMap: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  zoom,
  onZoom,
  selectedCountry,
  showAllCountries,
  onToggleCountries,
  onResetMap
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={onResetMap}
        className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        title="Show Whole Map"
      >
        <Globe className="w-5 h-5" />
      </button>
      <button
        onClick={() => onZoom('in')}
        className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        disabled={zoom >= 16}
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        onClick={() => onZoom('out')}
        className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        disabled={zoom <= 1}
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      {selectedCountry && (
        <button
          onClick={onToggleCountries}
          className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <MapPin className="w-5 h-5" />
          {showAllCountries ? 'Hide' : 'Show'} Others
        </button>
      )}
    </div>
  );
};

export default MapControls;