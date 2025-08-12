import DialogUtils from "@/components/ui/dialog";
import { ToastType, ToastUtils } from "@/components/ui/toast";

export type NotificationOptions = {
  message?: string;
  duration?: number;
};

export type DialogOptions = NotificationOptions & {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

class NotificationService {
  private show(type: ToastType, title: string, options?: NotificationOptions) {
    ToastUtils.show(type, title, {
      text2: options?.message,
      duration: options?.duration,
    });
  }

  success(title: string, options?: NotificationOptions) {
    this.show("success", title, options);
  }

  error(title: string, options?: NotificationOptions) {
    this.show("error", title, options);
  }

  info(title: string, options?: NotificationOptions) {
    this.show("info", title, options);
  }

  dialog(title: string, options?: DialogOptions) {
    DialogUtils.show(title, {
      text2: options?.message,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      duration: options?.duration,
    });
  }

  confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) {
    this.dialog(title, {
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    });
  }

  hideAll() {
    ToastUtils.hideAll();
  }
}

export const notify = new NotificationService();
export default notify;
