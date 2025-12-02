import { useSearchParams } from 'react-router-dom';
import DevicesDashboard from './DevicesDashboard';
import RoomsDashboard from './RoomsDashboard';
import AwayModeFooter from '../components/AwayModeFooter';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') || 'devices') as 'devices' | 'rooms';

  const setViewMode = (mode: 'devices' | 'rooms') => {
    setSearchParams({ view: mode });
  };

  return (
    <div className="px-4 py-4 pb-20">
      <h1 className="text-xl font-semibold text-center mb-4">My Home</h1>
      
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-gray-200 p-1">
          <button
            className={`px-4 py-1 text-sm rounded-full transition-all ${
              viewMode === 'devices' ? 'bg-white shadow font-medium text-gray-900' : 'text-gray-600'
            }`}
            onClick={() => setViewMode('devices')}
          >
            Devices
          </button>
          <button
            className={`px-4 py-1 text-sm rounded-full transition-all ${
              viewMode === 'rooms' ? 'bg-white shadow font-medium text-gray-900' : 'text-gray-600'
            }`}
            onClick={() => setViewMode('rooms')}
          >
            Rooms
          </button>
        </div>
      </div>

      {viewMode === 'devices' ? <DevicesDashboard /> : <RoomsDashboard />}
      <AwayModeFooter />
    </div>
  );
};

export default HomePage;

