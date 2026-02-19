import React, { createContext, useCallback, useContext, useState } from "react";

type ToastType = "info" | "success" | "error";
type Toast = { id: string; message: string; type?: ToastType };

const ToastContext = createContext<{ addToast: (opts: { message: string; type?: ToastType }) => void }>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext) as { addToast: (opts: { message: string; type?: ToastType }) => void };
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ message, type = "info" }: { message: string; type?: ToastType }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const t: Toast = { id, message, type };
    setToasts((s) => [...s, t]);
    // auto remove
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);

  const remove = useCallback((id: string) => setToasts((s) => s.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded shadow-lg text-sm text-white ${
              t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-gray-800"
            }`}
            role="status"
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
