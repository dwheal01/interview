import { Link } from 'react-router-dom';

type DeviceCardProps = {
  to: string;
  title: string;
  status: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName: string; // e.g. "text-yellow-500"
  bgClassName: string;   // e.g. "bg-yellow-100"
};

const DeviceCard: React.FC<DeviceCardProps> = ({
  to,
  title,
  status,
  Icon,
  iconClassName,
  bgClassName,
}) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center rounded-xl ${bgClassName} p-6 active:scale-95 transition shadow-sm`}
    >
      <Icon className={`w-10 h-10 ${iconClassName}`} />
      <p className="mt-2 text-lg font-medium text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-700 whitespace-pre-line text-center">{status}</p>
    </Link>
  );
};

export default DeviceCard;

