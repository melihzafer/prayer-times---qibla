import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BellIcon } from './Icons';

interface NotificationToastProps {
  prayerName: string;
  time: string;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ prayerName, time, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const portalRoot = document.getElementById('notification-portal');
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-lg shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 text-blue-500">
          <BellIcon className="h-6 w-6" />
        </div>
        <div className="ml-3 rtl:mr-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            It's time for {prayerName} prayer!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Prayer time is at {time}.
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 rtl:mr-4 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
        </button>
      </div>
    </div>,
    portalRoot
  );
};

export default NotificationToast;