import { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Notification({
  message,
  type,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {type === "success" ? (
          <CheckCircleIcon className="notification-icon" />
        ) : (
          <XCircleIcon className="notification-icon" />
        )}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="notification-close">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
