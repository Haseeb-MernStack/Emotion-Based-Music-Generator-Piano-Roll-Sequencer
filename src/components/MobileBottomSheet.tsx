import { useEffect } from "react";

export default function MobileBottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: any }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full bg-white rounded-t-lg p-4 shadow-lg">
        <div className="w-12 h-1 bg-gray-300 rounded mx-auto mb-3" />
        {children}
        <div className="mt-3 text-right">
          <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
