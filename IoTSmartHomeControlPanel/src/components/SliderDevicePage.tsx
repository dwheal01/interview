import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from './BackButton';
import AwayModeFooter from './AwayModeFooter';
import { useDevices } from '../hooks/useDevices';
import type { RoomId } from '../types/devices';
import { getDeviceMetadata } from '../registry/deviceRegistry';

type SliderDevicePageProps = {
  deviceType: 'light' | 'speaker';
  title: string;
};

const SliderDevicePage: React.FC<SliderDevicePageProps> = ({ deviceType, title }) => {
  const { devices, setDevices } = useDevices();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const metadata = getDeviceMetadata(deviceType);
  
  // Get rooms that have this device
  const roomsArray = Object.values(devices.rooms).filter(r => {
    if (deviceType === 'light') return r.light !== undefined;
    if (deviceType === 'speaker') return r.speaker !== undefined;
    return false;
  });
  
  const handleFullRoomClick = (roomId: RoomId) => {
    const view = searchParams.get('view') || 'devices';
    navigate(`/rooms/${roomId}?view=${view}`);
  };

  const handleValueChange = (roomId: RoomId, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setDevices(prev => {
      const room = prev.rooms[roomId];
      if (deviceType === 'light' && room?.light) {
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              light: {
                ...room.light,
                brightness: room.light.isOn ? clamped : room.light.brightness,
                lastBrightness: clamped,
              },
            },
          },
        };
      } else if (deviceType === 'speaker' && room?.speaker) {
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              speaker: {
                ...room.speaker,
                volume: room.speaker.isOn ? clamped : room.speaker.volume,
                lastVolume: clamped,
              },
            },
          },
        };
      }
      return prev;
    });
  };

  const handleTurnAllOff = () => {
    setDevices(prev => {
      const updatedRooms = { ...prev.rooms };
      Object.keys(updatedRooms).forEach(roomId => {
        const room = updatedRooms[roomId as RoomId];
        if (deviceType === 'light' && room.light) {
          const currentBrightness = room.light.brightness;
          const savedBrightness = currentBrightness > 0 
            ? currentBrightness 
            : (room.light.lastBrightness && room.light.lastBrightness > 0 ? room.light.lastBrightness : 100);
          updatedRooms[roomId as RoomId] = {
            ...room,
            light: {
              ...room.light,
              brightness: room.light.brightness,
              lastBrightness: savedBrightness,
              isOn: false,
            },
          };
        } else if (deviceType === 'speaker' && room.speaker) {
          const currentVolume = room.speaker.volume;
          const savedVolume = currentVolume > 0 
            ? currentVolume 
            : (room.speaker.lastVolume && room.speaker.lastVolume > 0 ? room.speaker.lastVolume : 100);
          updatedRooms[roomId as RoomId] = {
            ...room,
            speaker: {
              ...room.speaker,
              volume: room.speaker.volume,
              lastVolume: savedVolume,
              isOn: false,
            },
          };
        }
      });
      return { ...prev, rooms: updatedRooms };
    });
  };

  const handleDeviceOn = (roomId: RoomId) => {
    setDevices(prev => {
      const room = prev.rooms[roomId];
      if (deviceType === 'light' && room?.light) {
        const targetBrightness = room.light.lastBrightness && room.light.lastBrightness > 0 
          ? room.light.lastBrightness 
          : (room.light.brightness ?? 0);
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              light: {
                ...room.light,
                brightness: targetBrightness,
                lastBrightness: targetBrightness,
                isOn: true,
              },
            },
          },
        };
      } else if (deviceType === 'speaker' && room?.speaker) {
        const targetVolume = room.speaker.lastVolume && room.speaker.lastVolume > 0 
          ? room.speaker.lastVolume 
          : (room.speaker.volume ?? 0);
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              speaker: {
                ...room.speaker,
                volume: targetVolume,
                lastVolume: targetVolume,
                isOn: true,
              },
            },
          },
        };
      }
      return prev;
    });
  };

  const handleDeviceOff = (roomId: RoomId) => {
    setDevices(prev => {
      const room = prev.rooms[roomId];
      if (deviceType === 'light' && room?.light) {
        const currentBrightness = room.light.brightness;
        const savedBrightness = currentBrightness > 0 
          ? currentBrightness 
          : (room.light.lastBrightness && room.light.lastBrightness > 0 ? room.light.lastBrightness : 100);
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              light: {
                ...room.light,
                brightness: room.light.brightness,
                lastBrightness: savedBrightness,
                isOn: false,
              },
            },
          },
        };
      } else if (deviceType === 'speaker' && room?.speaker) {
        const currentVolume = room.speaker.volume;
        const savedVolume = currentVolume > 0 
          ? currentVolume 
          : (room.speaker.lastVolume && room.speaker.lastVolume > 0 ? room.speaker.lastVolume : 100);
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [roomId]: {
              ...prev.rooms[roomId],
              speaker: {
                ...room.speaker,
                volume: room.speaker.volume,
                lastVolume: savedVolume,
                isOn: false,
              },
            },
          },
        };
      }
      return prev;
    });
  };

  const getDeviceValue = (room: any) => {
    if (deviceType === 'light') return room.light?.brightness ?? 0;
    if (deviceType === 'speaker') return room.speaker?.volume ?? 0;
    return 0;
  };

  // Map color names to Tailwind classes (Tailwind needs full class names, not dynamic strings)
  const colorClasses = {
    yellow: {
      accent: 'bg-yellow-400',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
    blue: {
      accent: 'bg-blue-400',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
  } as const;

  const colors = colorClasses[metadata.color as keyof typeof colorClasses] || colorClasses.yellow;
  const accentColor = colors.accent;
  const bgColor = colors.bg;
  const textColor = colors.text;

  return (
    <div className="relative flex flex-col min-h-screen px-4 py-4 pb-20">
      <BackButton accentBgClass={accentColor} />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">{title}</h1>
      
      <div className="mt-20 mb-6">
        <button
          onClick={handleTurnAllOff}
          className={`w-full py-2 px-4 ${bgColor} ${textColor} rounded-lg font-medium hover:opacity-80 transition-colors`}
        >
          Turn all off
        </button>
      </div>

      <ul className="space-y-4">
        {roomsArray.map(room => {
          const currentValue = getDeviceValue(room);
          let isOn: boolean;
          let lastValue: number;
          if (deviceType === 'light') {
            isOn = room.light?.isOn ?? false;
            lastValue = room.light?.lastBrightness ?? 100;
          } else {
            isOn = room.speaker?.isOn ?? false;
            lastValue = room.speaker?.lastVolume ?? 100;
          }
          // Slider shows lastBrightness/lastVolume when off (so user can pre-set), otherwise shows current value
          const sliderValue = isOn ? currentValue : lastValue;
          
          return (
            <li key={room.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isOn 
                      ? (deviceType === 'light' 
                          ? `Brightness: ${currentValue}%`
                          : `Volume: ${currentValue}%`)
                      : 'Off'
                    }
                  </p>
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
                  onChange={e => handleValueChange(room.id, Number(e.target.value))}
                  className="w-full mb-3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeviceOff(room.id)}
                  disabled={!isOn}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off
                </button>
                <button
                  onClick={() => handleDeviceOn(room.id)}
                  className={`flex-1 py-2 px-4 ${bgColor} ${textColor} rounded-lg font-medium hover:opacity-80 transition-colors`}
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

export default SliderDevicePage;

