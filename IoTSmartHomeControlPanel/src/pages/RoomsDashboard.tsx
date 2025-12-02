import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDevices } from '../hooks/useDevices';
import DeviceCard from '../components/DeviceCard';
import {
  Thermometer,
  Lock,
  Unlock,
} from 'lucide-react';

const RoomsDashboard: React.FC = () => {
  const { devices } = useDevices();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomsArray = Object.values(devices.rooms);
  
  const handleRoomClick = (roomId: string) => {
    const view = searchParams.get('view') || 'rooms';
    navigate(`/rooms/${roomId}?view=${view}`);
  };

  const thermostatStatus = devices.thermostat.isOn
    ? `${devices.thermostat.temp}°${devices.thermostat.unit} • On`
    : 'Off';

  const lockIcon = devices.lock.locked ? Lock : Unlock;
  const lockStatus = devices.lock.locked ? 'Locked' : 'Unlocked';

  return (
    <>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Rooms</h2>
        <div className="space-y-3">
          {roomsArray.map(room => (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room.id)}
              className="w-full rounded-xl bg-white p-4 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-base font-medium text-gray-800">{room.name}</p>
              {room.light && (
                <p className="mt-1 text-sm text-gray-700">
                  Light: {!room.light.isOn ? 'Off' : `${room.light.brightness}%`}
                </p>
              )}
              {room.speaker && (
                <p className={`text-sm text-gray-700 ${room.light ? '' : 'mt-1'}`}>
                  Speaker: {!room.speaker.isOn ? 'Off' : `${room.speaker.volume}%`}
                </p>
              )}
              {room.fan && (
                <p className={`text-sm text-gray-700 ${room.light || room.speaker ? '' : 'mt-1'}`}>
                  Fan: {room.fan.speed === 0 ? 'Off' : `Speed ${room.fan.speed}`}
                </p>
              )}
              {!room.light && !room.speaker && !room.fan && (
                <p className="mt-1 text-sm text-gray-500 italic">No devices</p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Global</h2>
        <div className="grid grid-cols-2 gap-4">
          <DeviceCard
            to="/thermostat"
            title="Thermostat"
            status={thermostatStatus}
            Icon={Thermometer}
            iconClassName="text-sky-500"
            bgClassName="bg-sky-100"
          />
          <DeviceCard
            to="/lock"
            title="Lock"
            status={lockStatus}
            Icon={lockIcon}
            iconClassName="text-emerald-500"
            bgClassName="bg-emerald-100"
          />
        </div>
      </section>
    </>
  );
};

export default RoomsDashboard;

