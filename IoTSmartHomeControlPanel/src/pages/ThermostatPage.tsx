import { useState, useEffect } from 'react';
import {
  Thermometer,
  Power,
} from 'lucide-react';
import BackButton from '../components/BackButton';
import AwayModeFooter from '../components/AwayModeFooter';
import { useDevices } from '../hooks/useDevices';

const clampTemp = (temp: number, unit: 'F' | 'C'): number => {
  if (unit === 'F') return Math.min(85, Math.max(60, temp));
  return Math.min(29, Math.max(15, temp));
};

const convertFtoC = (f: number) => Math.round((f - 32) * 5 / 9);
const convertCtoF = (c: number) => Math.round(c * 9 / 5 + 32);

const ThermostatPage: React.FC = () => {
  const { devices, setDevices } = useDevices();
  const { temp, unit, isOn } = devices.thermostat;
  const [inputValue, setInputValue] = useState<string>(temp.toString());

  // Update local input value when device temp changes (e.g., from +/- buttons or unit toggle)
  useEffect(() => {
    setInputValue(temp.toString());
  }, [temp]);

  const setTemp = (newTemp: number) => {
    setDevices(prev => ({
      ...prev,
      thermostat: {
        ...prev.thermostat,
        temp: clampTemp(newTemp, prev.thermostat.unit),
      },
    }));
  };

  const handleIncrement = () => {
    if (!isOn) return;
    setTemp(temp + 1);
  };

  const handleDecrement = () => {
    if (!isOn) return;
    setTemp(temp - 1);
  };

  const handleUnitToggle = () => {
    if (!isOn) return;
    setDevices(prev => {
      const { temp, unit } = prev.thermostat;
      if (unit === 'F') {
        const newTemp = clampTemp(convertFtoC(temp), 'C');
        return {
          ...prev,
          thermostat: { ...prev.thermostat, unit: 'C', temp: newTemp },
        };
      } else {
        const newTemp = clampTemp(convertCtoF(temp), 'F');
        return {
          ...prev,
          thermostat: { ...prev.thermostat, unit: 'F', temp: newTemp },
        };
      }
    });
  };

  const handlePowerToggle = () => {
    setDevices(prev => ({
      ...prev,
      thermostat: {
        ...prev.thermostat,
        isOn: !prev.thermostat.isOn,
      },
    }));
  };

  const handleInputChange = (value: string) => {
    if (!isOn) return;
    // Allow typing freely - store as string
    setInputValue(value);
  };

  const handleInputBlur = () => {
    if (!isOn) return;
    // When user finishes editing, validate and set the actual temperature
    const num = Number(inputValue);
    if (!Number.isNaN(num)) {
      setTemp(num);
    } else {
      // If invalid, reset to current temp
      setInputValue(temp.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur which will validate and set the temp
    }
  };

  const controlsDisabled = !isOn;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 pb-20">
      <BackButton accentBgClass="bg-sky-400" />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">Thermostat</h1>
      <Thermometer className="w-16 h-16 text-sky-400 mb-4" />
      <div className={`flex items-center gap-4 mb-4 ${controlsDisabled ? 'opacity-50' : ''}`}>
        <button
          onClick={handleDecrement}
          disabled={controlsDisabled}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl"
        >
          -
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={controlsDisabled}
          className="w-20 text-3xl font-semibold text-center bg-transparent border-b border-gray-300 focus:outline-none"
        />
        <button
          onClick={handleIncrement}
          disabled={controlsDisabled}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl"
        >
          +
        </button>
      </div>
      <div className={`flex items-center gap-4 mb-4 ${controlsDisabled ? 'opacity-50' : ''}`}>
        <button
          onClick={handleUnitToggle}
          disabled={controlsDisabled}
          className="px-4 py-2 rounded-lg bg-sky-100 text-sky-700 font-medium"
        >
          °{unit}
        </button>
      </div>
      <button
        onClick={handlePowerToggle}
        className={`mt-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
          isOn ? 'bg-sky-400 text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        <Power className="w-6 h-6" />
      </button>
      <p className="mt-2 text-sm text-gray-600">
        {isOn ? 'On' : 'Off'}
      </p>
      <AwayModeFooter />
    </div>
  );
};

export default ThermostatPage;

