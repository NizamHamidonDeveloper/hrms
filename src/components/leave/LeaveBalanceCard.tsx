import { LeaveBalanceCard as LeaveBalanceCardType } from '@/types/leave'

interface LeaveBalanceCardProps {
  data: LeaveBalanceCardType;
}

export default function LeaveBalanceCard({ data }: LeaveBalanceCardProps) {
  const {
    type,
    icon,
    iconBgColor,
    iconTextColor,
    entitled,
    taken,
    pending,
    available,
    isAvailable
  } = data;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${!isAvailable ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${isAvailable ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Leave
        </h3>
        <div className={`p-2 rounded-full ${iconBgColor} ${iconTextColor}`}>
          <i className={icon}></i>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={isAvailable ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}>Entitled:</span>
          <span className={`font-medium ${isAvailable ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
            {entitled} Days
          </span>
        </div>
        <div className="flex justify-between">
          <span className={isAvailable ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}>Taken:</span>
          <span className={`font-medium ${isAvailable ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
            {taken} Days
          </span>
        </div>
        <div className="flex justify-between">
          <span className={isAvailable ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}>Pending:</span>
          <span className={`font-medium ${isAvailable ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
            {pending} Days
          </span>
        </div>
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between text-lg font-semibold">
          <span className={isAvailable ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}>Available:</span>
          <span className={isAvailable ? `${iconTextColor}` : 'text-gray-400'}>
            {available} Days
          </span>
        </div>
      </div>
    </div>
  );
} 