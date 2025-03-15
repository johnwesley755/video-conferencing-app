import { toast } from 'sonner';

// Define our own interface based on the parameters sonner accepts
interface ToastOptions {
  description?: string | React.ReactNode;
  duration?: number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  custom: (message: string, options: ToastOptions) => {
    toast(message, options);
  }
};