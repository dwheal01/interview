import { Lock, Unlock } from 'lucide-react';
import BackButton from '../components/BackButton';
import AwayModeFooter from '../components/AwayModeFooter';
import { useDevices } from '../hooks/useDevices';

const LockPage: React.FC = () => {
  const { devices, setDevices } = useDevices();
  const { locked } = devices.lock;

  const Icon = locked ? Lock : Unlock;

  const toggleLock = () => {
    setDevices(prev => ({
      ...prev,
      lock: { locked: !prev.lock.locked },
    }));
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 pb-20">
      <BackButton accentBgClass="bg-emerald-500" />
      <h1 className="absolute top-16 left-0 right-0 text-center text-2xl font-semibold text-gray-800 mb-4">Lock</h1>
      <button onClick={toggleLock} className="flex flex-col items-center">
        <Icon className="w-20 h-20 text-emerald-500" />
        <p className="mt-3 text-xl font-semibold">
          {locked ? 'Locked' : 'Unlocked'}
        </p>
      </button>
      <AwayModeFooter />
    </div>
  );
};

export default LockPage;

