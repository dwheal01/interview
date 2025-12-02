import { useDevices } from '../hooks/useDevices';
import { useState, useEffect } from 'react';

type AwayDefaults = {
  light?: { isOn?: boolean };
  speaker?: { isOn?: boolean };
  fan?: { speed?: 0 | 1 | 2 | 3 };
  thermostat?: { temp?: number; unit?: 'F' | 'C'; isOn?: boolean };
  lock?: { locked?: boolean };
};

const AwayModeFooter: React.FC = () => {
  const { setDevices } = useDevices();
  const [awayDefaults, setAwayDefaults] = useState<AwayDefaults | null>(null);

  // Load away defaults from JSON
  useEffect(() => {
    const loadAwayDefaults = async () => {
      try {
        const response = await fetch('/rooms.json');
        if (!response.ok) {
          throw new Error('Failed to load rooms data');
        }
        const data = await response.json();
        setAwayDefaults(data.away || null);
      } catch (error) {
        console.error('Error loading away defaults:', error);
      }
    };
    loadAwayDefaults();
  }, []);

  const handleAwayMode = () => {
    if (!awayDefaults) {
      console.warn('Away defaults not loaded yet');
      return;
    }

    setDevices(prev => {
      const updatedRooms: typeof prev.rooms = {};
      
      // Turn off all room devices (lights, speakers, fans) using away defaults
      Object.keys(prev.rooms).forEach(roomId => {
        const room = prev.rooms[roomId];
        const updatedRoom = { ...room };
        
        if (room.light) {
          // If device is on, save current brightness to lastBrightness
          // If device is off, preserve the existing lastBrightness (user may have adjusted slider)
          const savedBrightness = room.light.isOn && room.light.brightness > 0
            ? room.light.brightness
            : (room.light.lastBrightness ?? 100);
          
          updatedRoom.light = {
            ...room.light,
            brightness: room.light.brightness, // Keep current brightness
            lastBrightness: savedBrightness,
            isOn: awayDefaults.light?.isOn ?? false, // Use away default from rooms.json
          };
        }
        
        if (room.speaker) {
          // If device is on, save current volume to lastVolume
          // If device is off, preserve the existing lastVolume (user may have adjusted slider)
          const savedVolume = room.speaker.isOn && room.speaker.volume > 0
            ? room.speaker.volume
            : (room.speaker.lastVolume ?? 100);
          
          updatedRoom.speaker = {
            ...room.speaker,
            volume: room.speaker.volume, // Keep current volume
            lastVolume: savedVolume,
            isOn: awayDefaults.speaker?.isOn ?? false, // Use away default from rooms.json
          };
        }
        
        if (room.fan) {
          updatedRoom.fan = {
            speed: awayDefaults.fan?.speed ?? 0,
          };
        }
        
        updatedRooms[roomId] = updatedRoom;
      });

      return {
        ...prev,
        rooms: updatedRooms,
        thermostat: {
          temp: awayDefaults.thermostat?.temp ?? prev.thermostat.temp,
          unit: awayDefaults.thermostat?.unit ?? prev.thermostat.unit,
          isOn: awayDefaults.thermostat?.isOn ?? false,
        },
        lock: {
          locked: awayDefaults.lock?.locked ?? true,
        },
      };
    });
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-10">
      <button
        onClick={handleAwayMode}
        className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
      >
        Away Mode
      </button>
    </footer>
  );
};

export default AwayModeFooter;

