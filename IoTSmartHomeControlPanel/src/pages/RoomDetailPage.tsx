import { useParams, useNavigate } from 'react-router-dom';
import { Lightbulb, Fan, Power, Thermometer, Lock, Unlock, Volume2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import AwayModeFooter from '../components/AwayModeFooter';
import { useDevices } from '../hooks/useDevices';
import type { RoomId } from '../types/devices';

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: RoomId }>();
  const { devices, setDevices } = useDevices();
  const navigate = useNavigate();

  const room = roomId ? devices.rooms[roomId] : undefined;

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-lg text-gray-600">Room not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleLightChange = (value: number) => {
    if (!room.light) return;
    const clamped = Math.max(0, Math.min(100, value));
    const currentLight = room.light;
    
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          light: {
            ...currentLight,
            // If light is off, keep brightness at current value but update lastBrightness
            brightness: currentLight.isOn ? clamped : currentLight.brightness,
            // Always update lastBrightness when slider moves
            lastBrightness: clamped,
          },
        },
      },
    }));
  };

  const handleLightOn = () => {
    if (!room.light) return;
    const targetBrightness = room.light.lastBrightness && room.light.lastBrightness > 0 
      ? room.light.lastBrightness 
      : (room.light.brightness ?? 0);
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          light: {
            ...room.light!,
            brightness: targetBrightness,
            lastBrightness: targetBrightness,
            isOn: true,
          },
        },
      },
    }));
  };

  const handleLightOff = () => {
    if (!room.light) return;
    const currentLight = room.light;
    const currentBrightness = currentLight.brightness;
    const savedBrightness = currentBrightness > 0 
      ? currentBrightness 
      : (currentLight.lastBrightness && currentLight.lastBrightness > 0 ? currentLight.lastBrightness : 100);
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          light: {
            ...currentLight,
            brightness: currentLight.brightness,
            lastBrightness: savedBrightness,
            isOn: false,
          },
        },
      },
    }));
  };

  const handleSpeakerChange = (value: number) => {
    if (!room.speaker) return;
    const clamped = Math.max(0, Math.min(100, value));
    const currentSpeaker = room.speaker;
    
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          speaker: {
            ...currentSpeaker,
            // If speaker is off, keep volume at current value but update lastVolume
            volume: currentSpeaker.isOn ? clamped : currentSpeaker.volume,
            // Always update lastVolume when slider moves
            lastVolume: clamped,
          },
        },
      },
    }));
  };

  const handleSpeakerOn = () => {
    if (!room.speaker) return;
    const targetVolume = room.speaker.lastVolume && room.speaker.lastVolume > 0 
      ? room.speaker.lastVolume 
      : (room.speaker.volume ?? 0);
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          speaker: {
            ...room.speaker!,
            volume: targetVolume,
            lastVolume: targetVolume,
            isOn: true,
          },
        },
      },
    }));
  };

  const handleSpeakerOff = () => {
    if (!room.speaker) return;
    const currentSpeaker = room.speaker;
    const currentVolume = currentSpeaker.volume;
    const savedVolume = currentVolume > 0 
      ? currentVolume 
      : (currentSpeaker.lastVolume && currentSpeaker.lastVolume > 0 ? currentSpeaker.lastVolume : 100);
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          speaker: {
            ...currentSpeaker,
            volume: currentSpeaker.volume,
            lastVolume: savedVolume,
            isOn: false,
          },
        },
      },
    }));
  };

  const setFanSpeed = (newSpeed: 0 | 1 | 2 | 3) => {
    if (!room.fan) return;
    setDevices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId!]: {
          ...prev.rooms[roomId!],
          fan: { speed: newSpeed },
        },
      },
    }));
  };

  const handleLockToggle = () => {
    setDevices(prev => ({
      ...prev,
      lock: { locked: !prev.lock.locked },
    }));
  };

  const speeds: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];
  const speedLabel = room.fan ? (room.fan.speed === 0 ? 'Off' : `Speed ${room.fan.speed}`) : 'N/A';
  const LockIcon = devices.lock.locked ? Lock : Unlock;

  return (
    <div className="relative flex flex-col min-h-screen px-4 py-4 pb-20">
      <BackButton accentBgClass="bg-gray-400" />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">
        {room.name}
      </h1>

      <div className="mt-20 space-y-6">
        {/* Light Control */}
        {room.light && (() => {
          const brightness = room.light.brightness;
          const isOn = room.light.isOn;
          const lastBrightness = room.light.lastBrightness ?? 100;
          // Slider shows lastBrightness when off (so user can pre-set), otherwise shows current brightness
          const sliderValue = isOn ? brightness : lastBrightness;
          return (
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <p className="text-base font-medium text-gray-800">Light</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{isOn ? `Brightness: ${brightness}%` : 'Off'}</p>
              <div className={!isOn ? 'opacity-50' : ''}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={e => handleLightChange(Number(e.target.value))}
                  className="w-full mb-3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLightOff}
                  disabled={!isOn}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off
                </button>
                <button
                  onClick={handleLightOn}
                  className="flex-1 py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                >
                  On
                </button>
              </div>
            </section>
          );
        })()}

        {/* Speaker Control */}
        {room.speaker && (() => {
          const volume = room.speaker.volume;
          const isOn = room.speaker.isOn;
          const lastVolume = room.speaker.lastVolume ?? 100;
          // Slider shows lastVolume when off (so user can pre-set), otherwise shows current volume
          const sliderValue = isOn ? volume : lastVolume;
          return (
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <p className="text-base font-medium text-gray-800">Speaker</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{isOn ? `Volume: ${volume}%` : 'Off'}</p>
              <div className={!isOn ? 'opacity-50' : ''}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={e => handleSpeakerChange(Number(e.target.value))}
                  className="w-full mb-3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSpeakerOff}
                  disabled={!isOn}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off
                </button>
                <button
                  onClick={handleSpeakerOn}
                  className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  On
                </button>
              </div>
            </section>
          );
        })()}

        {/* Fan Control */}
        {room.fan && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <Fan className="w-5 h-5 text-violet-500" />
                <p className="text-base font-medium text-gray-800">Fan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{speedLabel}</p>
            <div className="flex gap-4">
              {speeds.map(s => {
                const isActive = s === room.fan!.speed;
                const Icon = s === 0 ? Power : Fan;

                return (
                  <button
                    key={s}
                    onClick={() => setFanSpeed(s)}
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
          </section>
        )}

        {!room.light && !room.speaker && !room.fan && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-center text-gray-500 italic">No devices in this room</p>
          </section>
        )}

        {/* Global Controls */}
        <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Global</h2>
          
          {/* Thermostat */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-sky-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">Thermostat</p>
                <p className="text-xs text-gray-600">
                  {devices.thermostat.isOn
                    ? `${devices.thermostat.temp}°${devices.thermostat.unit} • On`
                    : 'Off'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/thermostat')}
              className="px-3 py-1 text-sm bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Lock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LockIcon className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">Lock</p>
                <p className="text-xs text-gray-600">
                  {devices.lock.locked ? 'Locked' : 'Unlocked'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLockToggle}
              className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              Toggle
            </button>
          </div>
        </section>
      </div>
      <AwayModeFooter />
    </div>
  );
};

export default RoomDetailPage;

