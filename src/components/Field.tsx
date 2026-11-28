import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Mensaje de error: borde y fondo de error, ✕ y aria-describedby. */
  error?: ReactNode;
  /** Ayuda bajo el campo (se oculta si hay error). */
  hint?: ReactNode;
}

/** `<label>` + control con borde 3 px y fondo relleno (01 · Field). */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, 'aria-describedby': describedBy, ...inputProps },
  ref,
) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className="field-input"
        aria-invalid={error ? true : undefined}
        {...inputProps}
        aria-describedby={
          [message ? messageId : '', describedBy ?? ''].join(' ').trim() || undefined
        }
      />
      {message ? (
        <p id={messageId} className="field-message" data-error={error ? '' : undefined}>
          {error ? (
            <span className="field-message-icon" aria-hidden="true">
              ✕
            </span>
          ) : null}
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
});
