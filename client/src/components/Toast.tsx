import { useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      className: "bg-green-500 dark:bg-green-600"
    },
    error: {
      icon: XCircle,
      className: "bg-red-500 dark:bg-red-600"
    },
    warning: {
      icon: AlertCircle,
      className: "bg-yellow-500 dark:bg-yellow-600"
    },
    info: {
      icon: Info,
      className: "bg-blue-500 dark:bg-blue-600"
    }
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`${className} text-white px-6 py-4 rounded-lg shadow-2xl blur-backdrop-strong border border-white/20 transform transition-all duration-500 flex items-center space-x-3 animate-slide-in hover:scale-105`}>
      <Icon className="h-5 w-5 animate-bounce-in" />
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white transition-colors duration-200 hover:scale-110"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
