import SliderDevicePage from '../components/SliderDevicePage';
import AwayModeFooter from '../components/AwayModeFooter';

const SpeakerPage: React.FC = () => {
  return (
    <>
      <SliderDevicePage deviceType="speaker" title="Speakers" />
      <AwayModeFooter />
    </>
  );
};

export default SpeakerPage;

