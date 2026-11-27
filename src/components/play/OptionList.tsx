'use client';

import { useRef, type KeyboardEvent } from 'react';

interface Option {
  id: string;
  description: string;
}

interface OptionListProps {
  options: Option[];
  selected: string | null;
  onSelect: (optionId: string) => void;
  label: string;
  disabled?: boolean;
}

/**
 * Opciones del paso (01 · OptionList): role="radiogroup" con un radio por opción, cursor ▶ y
 * flechas para moverse (foco itinerante). La seleccionada lleva el tinte del tipo y sombra.
 */
export function OptionList({ options, selected, onSelect, label, disabled }: OptionListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = Math.max(
    0,
    options.findIndex((option) => option.id === selected),
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onSelect(option.id);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="option-list" aria-disabled={disabled}>
      {options.map((option, index) => {
        const checked = option.id === selected;
        return (
          <button
            key={option.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={index === focusIndex ? 0 : -1}
            disabled={disabled}
            className="option"
            onClick={() => onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className="option-cursor" aria-hidden="true">
              ▶
            </span>
            <span className="option-text">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
