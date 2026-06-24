type ToastType = "success" | "error" | "info" | "warning";

interface ToastPayload {
  id?: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

const listeners: ((payload: ToastPayload) => void)[] = [];

export function onToast(listener: (payload: ToastPayload) => void) {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);

    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
}

// overload 1
export function toast(
  title: string,
  message: string,
  type?: ToastType,
  duration?: number,
): void;

// overload 2
export function toast(payload: ToastPayload): void;

// implementation
export function toast(
  arg1: string | ToastPayload,
  arg2?: string,
  arg3: ToastType = "info",
  arg4?: number,
) {
  const data: ToastPayload =
    typeof arg1 === "string"
      ? {
          title: arg1,
          message: arg2 ?? "",
          type: arg3,
          duration: arg4,
        }
      : arg1;

  listeners.forEach((fn) => fn(data));
}
