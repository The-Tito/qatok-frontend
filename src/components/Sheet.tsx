'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Texto del botón ✕ para lectores de pantalla. */
  closeLabel?: string;
  /** `alertdialog` para confirmaciones destructivas. */
  role?: 'dialog' | 'alertdialog';
}

/**
 * Hoja inferior en móvil que pasa a diálogo centrado de 520 px desde 1024 px (v2 · Web).
 * Usa <dialog> modal: foco atrapado, Escape cierra y el foco vuelve al control que la abrió.
 */
export function Sheet({ open, onClose, title, children, closeLabel = 'Cerrar', role }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Un clic en el fondo (fuera del panel) cierra.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-panel">
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id={titleId} className="sheet-title">
            {title}
          </h2>
          <button type="button" className="sheet-close" aria-label={closeLabel} onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
