import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type BackButtonProps = {
  accentBgClass: string; // e.g. "bg-yellow-400"
};

const BackButton: React.FC<BackButtonProps> = ({ accentBgClass }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleBack = () => {
    const view = searchParams.get('view');
    if (view) {
      navigate(`/?view=${view}`);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${accentBgClass}`}
    >
      <ChevronLeft className="w-5 h-5 text-white" />
    </button>
  );
};

export default BackButton;

