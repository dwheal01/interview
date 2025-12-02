import { useDevices } from '../hooks/useDevices';
import DeviceCard from '../components/DeviceCard';
import {
  Lightbulb,
  Thermometer,
  Lock,
  Unlock,
  Fan,
  Volume2,
} from 'lucide-react';

const DevicesDashboard: React.FC = () => {
  const { devices } = useDevices();

  const roomsArray = Object.values(devices.rooms);
  const lightRooms = roomsArray.filter(r => r.light !== undefined);
  const lightsAllOff = lightRooms.length > 0 && lightRooms.every(r => !r.light!.isOn);
  const lightsAllOn = lightRooms.length > 0 && lightRooms.every(r => r.light!.isOn);
  const lightsRoomCount = lightRooms.length;

  const speakerRooms = roomsArray.filter(r => r.speaker !== undefined);
  const speakersAllOff = speakerRooms.length > 0 && speakerRooms.every(r => !r.speaker!.isOn);
  const speakersAllOn = speakerRooms.length > 0 && speakerRooms.every(r => r.speaker!.isOn);
  const speakerRoomCount = speakerRooms.length;

  const fanRooms = roomsArray.filter(r => r.fan !== undefined);
  const fansAllOff = fanRooms.length > 0 && fanRooms.every(r => r.fan!.speed === 0);
  const fansAllOn = fanRooms.length > 0 && fanRooms.every(r => r.fan!.speed > 0);
  const fanRoomCount = fanRooms.length;

  const lightStatusLine1 = `Rooms: ${lightsRoomCount}`;
  const lightStatusLine2 = lightsRoomCount === 0
    ? 'No lights'
    : lightsAllOff 
      ? 'All lights off' 
      : lightsAllOn 
        ? 'All lights on' 
        : 'Some lights on';

  const speakerStatusLine1 = `Rooms: ${speakerRoomCount}`;
  const speakerStatusLine2 = speakerRoomCount === 0
    ? 'No speakers'
    : speakersAllOff 
      ? 'All speakers off' 
      : speakersAllOn 
        ? 'All speakers on' 
        : 'Some speakers on';

  const fanStatusLine1 = `Rooms: ${fanRoomCount}`;
  const fanStatusLine2 = fanRoomCount === 0
    ? 'No fans'
    : fansAllOff 
      ? 'All fans off' 
      : fansAllOn 
        ? 'All fans on' 
        : 'Some fans on';

  const thermostatStatus = devices.thermostat.isOn
    ? `${devices.thermostat.temp}°${devices.thermostat.unit} • On`
    : 'Off';

  const lockIcon = devices.lock.locked ? Lock : Unlock;
  const lockStatus = devices.lock.locked ? 'Locked' : 'Unlocked';

  return (
    <div className="grid grid-cols-2 gap-4">
      <DeviceCard
        to="/light"
        title="Lights"
        status={`${lightStatusLine1}\n${lightStatusLine2}`}
        Icon={Lightbulb}
        iconClassName="text-yellow-500"
        bgClassName="bg-yellow-100"
      />
      <DeviceCard
        to="/speaker"
        title="Speakers"
        status={`${speakerStatusLine1}\n${speakerStatusLine2}`}
        Icon={Volume2}
        iconClassName="text-blue-500"
        bgClassName="bg-blue-100"
      />
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
      <DeviceCard
        to="/fan"
        title="Fans"
        status={`${fanStatusLine1}\n${fanStatusLine2}`}
        Icon={Fan}
        iconClassName="text-violet-500"
        bgClassName="bg-violet-100"
      />
    </div>
  );
};

export default DevicesDashboard;

