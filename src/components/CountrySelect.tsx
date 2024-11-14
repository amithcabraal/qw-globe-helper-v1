import React, { memo } from 'react';
import { MapPin } from 'lucide-react';
import { countries } from '../data/countries';

interface CountrySelectProps {
  selectedCountry: string | null;
  onSelectCountry: (countryName: string) => void;
}

const CountrySelect = ({ selectedCountry, onSelectCountry }: CountrySelectProps) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-72">
      <div className="flex items-center gap-2 text-gray-700 mb-3">
        <MapPin className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Country Border Viewer</h2>
      </div>
      <select
        value={selectedCountry || ''}
        onChange={(e) => onSelectCountry(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
};

export default memo(CountrySelect);