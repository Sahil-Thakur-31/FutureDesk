import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function Modal({ title, open, onClose, children, actions }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[22px] bg-white shadow-card" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <button className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-stone-100" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {actions ? <div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4">{actions}</div> : null}
      </div>
    </div>
  );
}
