import { createContext, useContext } from "react";

type ToastType = "info" | "success" | "error";
type ToastAPI = { addToast: (opts: { message: string; type?: ToastType }) => void };

export const ToastContext = createContext<ToastAPI>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext) as ToastAPI;
}

export default ToastContext;
