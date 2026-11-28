'use client';

import { forwardRef, useId, useState, type ComponentProps } from 'react';
import { PASSWORD_RULES, passwordTooLong } from '../lib/password';
import { Field } from './Field';

type PasswordFieldProps = Omit<ComponentProps<typeof Field>, 'type'> & {
  /** Muestra la lista de requisitos y la marca mientras se escribe (Crear cuenta). */
  checklist?: boolean;
};

/** Campo de contraseña con botón para ver u ocultar y, si se pide, lista de requisitos. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ checklist = false, onChange, ...fieldProps }, ref) {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState('');
    const listId = useId();
    const tooLong = passwordTooLong(value);

    return (
      <div className="password-field">
        <Field
          ref={ref}
          {...fieldProps}
          type={visible ? 'text' : 'password'}
          aria-describedby={checklist ? listId : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            onChange?.(event);
          }}
        />
        <button
          type="button"
          className="password-toggle"
          aria-pressed={visible}
          onClick={() => setVisible((shown) => !shown)}
        >
          <span className="password-toggle-box" aria-hidden="true">
            {visible ? '✓' : ''}
          </span>
          Mostrar contraseña
        </button>
        {checklist ? (
          <ul id={listId} className="password-rules" aria-label="Requisitos de la contraseña">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(value);
              return (
                <li key={rule.id} data-ok={ok || undefined}>
                  <span aria-hidden="true">{ok ? '✓' : '·'}</span>
                  {rule.label}
                  <span className="sr-only">{ok ? ' (cumplido)' : ' (pendiente)'}</span>
                </li>
              );
            })}
            {tooLong ? <li data-error="">Máximo 72 bytes (es demasiado larga)</li> : null}
          </ul>
        ) : null}
      </div>
    );
  },
);
