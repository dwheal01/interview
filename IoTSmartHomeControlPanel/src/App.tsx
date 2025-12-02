import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DeviceContextProvider } from './context/DeviceContext';
import { SchedulerContextProvider } from './context/SchedulerContext';
import HomePage from './pages/HomePage';
import LightPage from './pages/LightPage';
import ThermostatPage from './pages/ThermostatPage';
import LockPage from './pages/LockPage';
import FanPage from './pages/FanPage';
import SpeakerPage from './pages/SpeakerPage';
import RoomDetailPage from './pages/RoomDetailPage';

function App() {
  return (
    <DeviceContextProvider>
      <SchedulerContextProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/light" element={<LightPage />} />
              <Route path="/speaker" element={<SpeakerPage />} />
              <Route path="/thermostat" element={<ThermostatPage />} />
              <Route path="/lock" element={<LockPage />} />
              <Route path="/fan" element={<FanPage />} />
              <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </SchedulerContextProvider>
    </DeviceContextProvider>
  );
}

export default App;
