import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import AwayModeFooter from '../components/AwayModeFooter';
import { useDevices } from '../hooks/useDevices';
import type { RoomId } from '../types/devices';

const LightPage: React.FC = () => {
  const { devices, setDevices } = useDevices();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomsArray = Object.values(devices.rooms).filter(r => r.light !== undefined);
  
  const handleFullRoomClick = (roomId: RoomId) => {
    const view = searchParams.get('view') || 'devices';
    navigate(`/rooms/${roomId}?view=${view}`);
  };

  const handleRoomBrightnessChange = (roomId: RoomId, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setDevices(prev => {
      const currentLight = prev.rooms[roomId]?.light;
      
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [roomId]: {
            ...prev.rooms[roomId],
            light: {
              ...currentLight!,
              // If light is off, keep brightness at 0 but update lastBrightness
              brightness: currentLight?.isOn ? clamped : currentLight?.brightness ?? 0,
              // Always update lastBrightness when slider moves
              lastBrightness: clamped,
            },
          },
        },
      };
    });
  };

  const handleTurnAllOff = () => {
    setDevices(prev => {
      const updatedRooms = { ...prev.rooms };
      Object.keys(updatedRooms).forEach(roomId => {
        const room = updatedRooms[roomId as RoomId];
        if (room.light) {
          const currentBrightness = room.light.brightness;
          // When turning off, save current brightness if > 0, otherwise keep existing lastBrightness
          const savedBrightness = currentBrightness > 0 
            ? currentBrightness 
            : (room.light.lastBrightness && room.light.lastBrightness > 0 ? room.light.lastBrightness : 100);
          updatedRooms[roomId as RoomId] = {
            ...room,
            light: {
              ...room.light,
              brightness: room.light.brightness, // Keep current brightness
              lastBrightness: savedBrightness,
              isOn: false,
            },
          };
        }
      });
      return {
        ...prev,
        rooms: updatedRooms,
      };
    });
  };

  const handleRoomLightOn = (roomId: RoomId) => {
    setDevices(prev => {
      const currentLight = prev.rooms[roomId]?.light;
      // Restore to lastBrightness if available, otherwise use current brightness
      const targetBrightness = currentLight?.lastBrightness && currentLight.lastBrightness > 0 
        ? currentLight.lastBrightness 
        : (currentLight?.brightness ?? 0);
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [roomId]: {
            ...prev.rooms[roomId],
            light: {
              ...currentLight!,
              brightness: targetBrightness,
              lastBrightness: targetBrightness,
              isOn: true,
            },
          },
        },
      };
    });
  };

  const handleRoomLightOff = (roomId: RoomId) => {
    setDevices(prev => {
      const currentLight = prev.rooms[roomId]?.light;
      const currentBrightness = currentLight?.brightness ?? 0;
      // When turning off, save current brightness if > 0, otherwise keep existing lastBrightness
      const savedBrightness = currentBrightness > 0 
        ? currentBrightness 
        : (currentLight?.lastBrightness && currentLight.lastBrightness > 0 ? currentLight.lastBrightness : 100);
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [roomId]: {
            ...prev.rooms[roomId],
            light: {
              ...currentLight!,
              brightness: currentLight?.brightness ?? 0, // Keep current brightness
              lastBrightness: savedBrightness,
              isOn: false,
            },
          },
        },
      };
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen px-4 py-4 pb-20">
      <BackButton accentBgClass="bg-yellow-400" />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">Lights</h1>
      
      <div className="mt-20 mb-6">
        <button
          onClick={handleTurnAllOff}
          className="w-full py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
        >
          Turn all off
        </button>
      </div>

      <ul className="space-y-4">
        {roomsArray.map(room => {
          const brightness = room.light!.brightness;
          const isOn = room.light!.isOn;
          const lastBrightness = room.light!.lastBrightness ?? 100;
          // Slider shows lastBrightness when off (so user can pre-set), otherwise shows current brightness
          const sliderValue = isOn ? brightness : lastBrightness;
          return (
            <li key={room.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{isOn ? `Brightness: ${brightness}%` : 'Off'}</p>
                </div>
                <button
                  onClick={() => handleFullRoomClick(room.id)}
                  className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Full room
                </button>
              </div>
              <div className={!isOn ? 'opacity-50' : ''}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={e => handleRoomBrightnessChange(room.id, Number(e.target.value))}
                  className="w-full mb-3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRoomLightOff(room.id)}
                  disabled={!isOn}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off
                </button>
                <button
                  onClick={() => handleRoomLightOn(room.id)}
                  className="flex-1 py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                >
                  On
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <AwayModeFooter />
    </div>
  );
};

export default LightPage;
