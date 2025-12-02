import { useNavigate, useSearchParams } from 'react-router-dom';
import { Fan, Power } from 'lucide-react';
import BackButton from '../components/BackButton';
import AwayModeFooter from '../components/AwayModeFooter';
import { useDevices } from '../hooks/useDevices';
import type { RoomId } from '../types/devices';

const FanPage: React.FC = () => {
  const { devices, setDevices } = useDevices();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomsArray = Object.values(devices.rooms).filter(r => r.fan !== undefined);
  
  const handleFullRoomClick = (roomId: RoomId) => {
    const view = searchParams.get('view') || 'devices';
    navigate(`/rooms/${roomId}?view=${view}`);
  };

  const setRoomSpeed = (roomId: RoomId, newSpeed: 0 | 1 | 2 | 3) => {
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId]: {
          ...prev.rooms[roomId],
          fan: { speed: newSpeed },
        },
      },
    }));
  };

  const handleTurnAllOff = () => {
    setDevices(prev => {
      const updatedRooms = { ...prev.rooms };
      Object.keys(updatedRooms).forEach(roomId => {
        const room = updatedRooms[roomId as RoomId];
        if (room.fan) {
          updatedRooms[roomId as RoomId] = {
            ...room,
            fan: { speed: 0 },
          };
        }
      });
      return {
        ...prev,
        rooms: updatedRooms,
      };
    });
  };

  const speeds: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

  return (
    <div className="relative flex flex-col min-h-screen px-4 py-4">
      <BackButton accentBgClass="bg-violet-400" />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">Fans</h1>
      
      <div className="mt-20 mb-6">
        <button
          onClick={handleTurnAllOff}
          className="w-full py-2 px-4 bg-violet-100 text-violet-700 rounded-lg font-medium hover:bg-violet-200 transition-colors"
        >
          Turn all off
        </button>
      </div>

      <ul className="space-y-4">
        {roomsArray.map(room => {
          const speedLabel = room.fan!.speed === 0 ? 'Off' : `Speed ${room.fan!.speed}`;
          
          return (
            <li key={room.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{speedLabel}</p>
                </div>
                <button
                  onClick={() => handleFullRoomClick(room.id)}
                  className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Full room
                </button>
              </div>
              <div className="flex gap-4">
                {speeds.map(s => {
                  const isActive = s === room.fan!.speed;
                  const Icon = s === 0 ? Power : Fan;

                  return (
                    <button
                      key={s}
                      onClick={() => setRoomSpeed(room.id, s)}
                      className="flex flex-col items-center"
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isActive ? 'text-violet-500' : 'text-gray-400'
                        }`}
                      />
                      <span className="mt-1 text-xs text-gray-600">
                        {s === 0 ? 'Off' : s}
                      </span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
      <AwayModeFooter />
    </div>
  );
};

export default FanPage;
