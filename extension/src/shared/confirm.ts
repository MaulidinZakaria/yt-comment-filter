type Type = "success" | "error" | "info" | "warning";

interface ConfirmPayload {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: Type;
}

let listener:
  | ((payload: ConfirmPayload, resolve: (value: boolean) => void) => void)
  | null = null;

export function onConfirm(
  callback: (
    payload: ConfirmPayload,
    resolve: (value: boolean) => void,
  ) => void,
) {
  listener = callback;
}

export function confirm(payload: ConfirmPayload): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(false);
      return;
    }

    listener(payload, resolve);
  });
}
