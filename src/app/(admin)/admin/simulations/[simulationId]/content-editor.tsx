'use client';

import { SimulationContentInput, type SimulationStep } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { PixelButton } from '../../../../../components/PixelButton';
import { LoadingCard, StateCard } from '../../../../../components/StateCard';
import { getSimulationContent, isApiError, saveSimulationContent } from '../../../../../lib/api';
import {
  OPTION_LETTERS,
  STEP_TYPE_LABELS,
  changeType,
  describePath,
  emptyOption,
  emptyStep,
  moveStep,
  normalizeSteps,
  removeStep,
  routeMap,
  unreachableSteps,
  type Option,
  type StepType,
} from '../../../../../lib/content';

type Content = { version: number | null; steps: SimulationStep[] };

/** Carga el contenido (sin contenido aún → borrador vacío, versión nula). */
export function useContent(simulationId: string) {
  return useQuery({
    queryKey: ['admin-content', simulationId],
    queryFn: async ({ signal }): Promise<Content> => {
      try {
        return await getSimulationContent(simulationId, signal);
      } catch (error) {
        if (isApiError(error, 'MISSING_CONTENT')) return { version: null, steps: [] };
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });
}

/** A2 · Editor de contenido (AdminEditorV2): pasos, opciones, consecuencias y contextos. */
export function ContentEditor({
  simulationId,
  readOnly,
  aside,
}: {
  simulationId: string;
  readOnly: boolean;
  /** Bloques de la columna derecha (datos de la simulación, publicar). */
  aside: (content: Content, dirty: boolean) => ReactNode;
}) {
  const queryClient = useQueryClient();
  const content = useContent(simulationId);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [version, setVersion] = useState<number | null>(null);
  const [open, setOpen] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [conflict, setConflict] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // Al cargar (o recargar la versión) se reemplaza el borrador local.
  useEffect(() => {
    if (!content.data) return;
    setSteps(content.data.steps);
    setVersion(content.data.version);
    setDirty(false);
    setConflict(false);
  }, [content.data]);

  const save = useMutation({
    mutationFn: (payload: Content) => saveSimulationContent(simulationId, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(['admin-content', simulationId], result);
      setSaved(`Versión ${result.version} guardada.`);
    },
    onError: (error) => {
      if (isApiError(error, 'STALE_CONTENT_VERSION')) setConflict(true);
      else if (isApiError(error, 'SIMULATION_NOT_EDITABLE')) {
        setProblems(['La simulación ya no es un borrador: recarga la página.']);
      } else if (isApiError(error, 'VALIDATION_ERROR')) {
        setProblems(['La API rechazó el contenido. Revisa los campos obligatorios.']);
      } else if (isApiError(error, 'PAYLOAD_TOO_LARGE')) {
        setProblems(['El escenario es demasiado grande.']);
      } else setProblems(['No pudimos guardar. Intenta de nuevo.']);
    },
  });

  if (content.isError) {
    return (
      <StateCard
        kind="error"
        title="No pudimos cargar el contenido"
        message="Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void content.refetch() }}
      />
    );
  }
  if (!content.data) return <LoadingCard />;

  function update(next: SimulationStep[]) {
    setSteps(next);
    setDirty(true);
    setSaved(null);
  }
  const updateStep = (index: number, change: (step: SimulationStep) => SimulationStep) =>
    update(steps.map((step, i) => (i === index ? change(step) : step)));

  function handleSave() {
    const normalized = normalizeSteps(steps);
    const parsed = SimulationContentInput.safeParse({ version, steps: normalized });
    setSaved(null);
    if (!parsed.success) {
      const list = [
        ...new Set(
          parsed.error.issues.map((issue) => `${describePath(issue.path)}: falta o no es válido`),
        ),
      ];
      setProblems(list.slice(0, 12));
      return;
    }
    setProblems([]);
    save.mutate({ version, steps: normalized });
  }

  const routes = routeMap(steps);
  const unreachable = unreachableSteps(steps);

  return (
    <div className="editor">
      <section className="editor-main" aria-labelledby="pasos">
        <div className="editor-head">
          <h2 id="pasos" className="profile-heading">
            Pasos del escenario
          </h2>
          <span className="admin-sub">
            {version === null ? 'Sin guardar aún' : `Versión ${version}`}
            {dirty ? ' · cambios sin guardar' : ''}
          </span>
        </div>

        {conflict ? (
          <div className="editor-conflict" role="alert">
            <span className="danger-box-tag">◆ Alguien guardó otra versión del borrador</span>
            <p>Tus cambios no se guardaron. Recarga la versión actual y vuelve a aplicarlos.</p>
            <PixelButton
              variant="secondary"
              onClick={() =>
                void queryClient.invalidateQueries({ queryKey: ['admin-content', simulationId] })
              }
            >
              Recargar versión
            </PixelButton>
          </div>
        ) : null}

        <fieldset className="admin-fieldset" disabled={readOnly || save.isPending}>
          {steps.length === 0 ? (
            <p className="profile-empty">Todavía no hay pasos. Agrega el primero abajo.</p>
          ) : null}
          {steps.map((step, index) => (
            <article
              key={step.id}
              className="editor-step panel"
              data-open={open === index || undefined}
            >
              <div className="editor-step-head">
                <span className="editor-step-num">{String(index + 1).padStart(2, '0')}</span>
                <button
                  type="button"
                  className="editor-step-toggle"
                  aria-expanded={open === index}
                  onClick={() => setOpen(open === index ? -1 : index)}
                >
                  <span className="path-item-type">{STEP_TYPE_LABELS[step.type]}</span>
                  <span className="editor-step-title">{step.title || 'Paso sin título'}</span>
                </button>
                {readOnly ? null : (
                  <span className="admin-actions">
                    <button
                      type="button"
                      className="admin-link"
                      aria-label={`Subir paso ${index + 1}`}
                      disabled={index === 0}
                      onClick={() => {
                        update(moveStep(steps, index, -1));
                        setOpen(index - 1);
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="admin-link"
                      aria-label={`Bajar paso ${index + 1}`}
                      disabled={index === steps.length - 1}
                      onClick={() => {
                        update(moveStep(steps, index, 1));
                        setOpen(index + 1);
                      }}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="admin-link"
                      data-danger=""
                      aria-label={`Eliminar paso ${index + 1}`}
                      onClick={() => update(removeStep(steps, index))}
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
              {open === index ? (
                <StepFields
                  step={step}
                  steps={steps}
                  index={index}
                  onChange={(change) => updateStep(index, change)}
                />
              ) : null}
            </article>
          ))}
          {readOnly ? null : (
            <div className="editor-add">
              <span className="field-label">Agregar paso</span>
              <div className="admin-actions">
                {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="admin-link"
                    onClick={() => {
                      update([...steps, emptyStep(type, steps.length + 1)]);
                      setOpen(steps.length);
                    }}
                  >
                    + {STEP_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {problems.length > 0 ? (
          <div className="form-alert" role="alert">
            <p>Antes de guardar, revisa:</p>
            <ul className="editor-problems">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {saved ? (
          <p className="account-status" role="status">
            {saved}
          </p>
        ) : null}
        {readOnly ? null : (
          <PixelButton
            size="lg"
            disabled={save.isPending || (!dirty && version !== null)}
            onClick={handleSave}
          >
            {save.isPending ? 'Guardando…' : 'Guardar versión'}
          </PixelButton>
        )}
      </section>

      <aside className="editor-side">
        {aside({ version, steps }, dirty)}
        <section className="admin-form panel" aria-labelledby="mapa">
          <h2 id="mapa" className="profile-heading">
            Mapa de rutas
          </h2>
          {routes.length === 0 ? (
            <p className="profile-empty">Sin pasos todavía.</p>
          ) : (
            <ul className="editor-routes">
              {routes.map((route) => (
                <li key={`${route.step}${route.option}`}>
                  <span>
                    Paso {route.step} · {route.option}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span data-end={route.target === 'Fin' || undefined}>{route.target}</span>
                </li>
              ))}
            </ul>
          )}
          {unreachable.length > 0 ? (
            <p className="field-message" data-error="">
              Desde el inicio no se llega a {unreachable.map((n) => `paso ${n}`).join(', ')}.
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          className="field-input admin-textarea"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="field-input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

const lines = (items: string[]) => items.join('\n');
const split = (text: string) => text.split('\n');

function StepFields({
  step,
  steps,
  index,
  onChange,
}: {
  step: SimulationStep;
  steps: SimulationStep[];
  index: number;
  onChange: (change: (step: SimulationStep) => SimulationStep) => void;
}) {
  const set = (patch: Partial<SimulationStep>) =>
    onChange((s) => ({ ...s, ...patch }) as SimulationStep);
  const setContext = (patch: Record<string, unknown>) =>
    onChange((s) => ({ ...s, context: { ...s.context, ...patch } }) as SimulationStep);
  const setOption = (optionIndex: number, change: (option: Option) => Option) =>
    onChange(
      (s) =>
        ({
          ...s,
          options: s.options.map((o, i) => (i === optionIndex ? change(o) : o)),
        }) as SimulationStep,
    );

  return (
    <div className="editor-step-body">
      <label className="field">
        <span className="field-label">Tipo</span>
        <select
          className="field-input"
          value={step.type}
          onChange={(event) => onChange((s) => changeType(s, event.target.value as StepType))}
        >
          {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
            <option key={type} value={type}>
              {STEP_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <TextField label="Título del paso" value={step.title} onChange={(v) => set({ title: v })} />
      <TextField
        label="Descripción"
        value={step.description}
        onChange={(v) => set({ description: v })}
        placeholder="Qué está pasando, en una línea"
      />

      <fieldset className="editor-context">
        <legend className="field-label">Contexto · {STEP_TYPE_LABELS[step.type]}</legend>
        {step.type === 'EMAIL' ? (
          <>
            <TextField
              label="Remitente"
              value={step.context.sender}
              onChange={(v) => setContext({ sender: v })}
              placeholder="Nombre <correo>"
            />
            <TextField
              label="Asunto"
              value={step.context.subject}
              onChange={(v) => setContext({ subject: v })}
            />
            <TextField
              label="Cuerpo"
              multiline
              value={step.context.body}
              onChange={(v) => setContext({ body: v })}
            />
          </>
        ) : null}
        {step.type === 'MEETING' ? (
          <>
            <TextField
              label="Participantes (uno por renglón)"
              multiline
              value={lines(step.context.participants)}
              onChange={(v) => setContext({ participants: split(v) })}
            />
            <TextField
              label="Agenda (un punto por renglón)"
              multiline
              value={lines(step.context.agenda)}
              onChange={(v) => setContext({ agenda: split(v) })}
            />
          </>
        ) : null}
        {step.type === 'TASK' ? (
          <>
            <TextField
              label="Entregables (uno por renglón)"
              multiline
              value={lines(step.context.deliverables)}
              onChange={(v) => setContext({ deliverables: split(v) })}
            />
            <TextField
              label="Plazo (horas)"
              type="number"
              value={step.context.deadline_hours}
              onChange={(v) => setContext({ deadline_hours: Number(v) })}
            />
          </>
        ) : null}
        {step.type === 'CONVERSATION' ? (
          <>
            <TextField
              label="Interlocutor"
              value={step.context.interlocutor}
              onChange={(v) => setContext({ interlocutor: v })}
            />
            {step.context.lines.map((line, i) => (
              <div key={i} className="editor-pair">
                <TextField
                  label={`Hablante ${i + 1}`}
                  value={line.speaker}
                  onChange={(v) =>
                    setContext({
                      lines: step.context.lines.map((l, j) => (j === i ? { ...l, speaker: v } : l)),
                    })
                  }
                />
                <TextField
                  label={`Texto ${i + 1}`}
                  value={line.text}
                  onChange={(v) =>
                    setContext({
                      lines: step.context.lines.map((l, j) => (j === i ? { ...l, text: v } : l)),
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className="admin-link"
              onClick={() =>
                setContext({ lines: [...step.context.lines, { speaker: '', text: '' }] })
              }
            >
              + Renglón de diálogo
            </button>
          </>
        ) : null}
        {step.type === 'INCIDENT' ? (
          <>
            <label className="field">
              <span className="field-label">Severidad</span>
              <select
                className="field-input"
                value={step.context.severity}
                onChange={(event) => setContext({ severity: event.target.value })}
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
            </label>
            {step.context.timeline.map((entry, i) => (
              <div key={i} className="editor-pair">
                <TextField
                  label={`Hora ${i + 1}`}
                  value={entry.time}
                  onChange={(v) =>
                    setContext({
                      timeline: step.context.timeline.map((t, j) =>
                        j === i ? { ...t, time: v } : t,
                      ),
                    })
                  }
                  placeholder="09:10"
                />
                <TextField
                  label={`Evento ${i + 1}`}
                  value={entry.event}
                  onChange={(v) =>
                    setContext({
                      timeline: step.context.timeline.map((t, j) =>
                        j === i ? { ...t, event: v } : t,
                      ),
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className="admin-link"
              onClick={() =>
                setContext({ timeline: [...step.context.timeline, { time: '', event: '' }] })
              }
            >
              + Evento
            </button>
          </>
        ) : null}
      </fieldset>

      <div className="editor-options">
        <span className="field-label">Opciones ({step.options.length}/6)</span>
        {step.options.map((option, optionIndex) => (
          <fieldset key={option.id} className="editor-option">
            <legend className="editor-option-legend">
              Opción {OPTION_LETTERS[optionIndex]}
              <button
                type="button"
                className="admin-link"
                data-danger=""
                aria-label={`Eliminar opción ${OPTION_LETTERS[optionIndex]}`}
                disabled={step.options.length === 1}
                onClick={() => set({ options: step.options.filter((_, i) => i !== optionIndex) })}
              >
                ✕
              </button>
            </legend>
            <TextField
              label="Lo que elige el estudiante"
              value={option.description}
              onChange={(v) => setOption(optionIndex, (o) => ({ ...o, description: v }))}
            />
            <div className="admin-form-row">
              <TextField
                label="Valoración (0–100)"
                type="number"
                value={option.score}
                onChange={(v) => setOption(optionIndex, (o) => ({ ...o, score: Number(v) }))}
              />
              <label className="field">
                <span className="field-label">Siguiente paso</span>
                <select
                  className="field-input"
                  value={option.next_step_id ?? ''}
                  onChange={(event) =>
                    setOption(optionIndex, (o) => ({
                      ...o,
                      next_step_id: event.target.value || null,
                    }))
                  }
                >
                  <option value="">Termina la simulación</option>
                  {steps.map((target, targetIndex) =>
                    targetIndex === index ? null : (
                      <option key={target.id} value={target.id}>
                        {String(targetIndex + 1).padStart(2, '0')} · {STEP_TYPE_LABELS[target.type]}
                        {target.title ? ` · ${target.title}` : ''}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Retroalimentación</span>
                <select
                  className="field-input"
                  value={option.feedback.type}
                  onChange={(event) =>
                    setOption(optionIndex, (o) => ({
                      ...o,
                      feedback: {
                        ...o.feedback,
                        type: event.target.value as Option['feedback']['type'],
                      },
                    }))
                  }
                >
                  <option value="CORRECT">★ Acierto</option>
                  <option value="PARTIAL">◆ Parcial</option>
                  <option value="INCORRECT">✕ Error</option>
                </select>
              </label>
            </div>
            <TextField
              label="Comentario"
              value={option.feedback.comment}
              onChange={(v) =>
                setOption(optionIndex, (o) => ({ ...o, feedback: { ...o.feedback, comment: v } }))
              }
              placeholder="Por qué funciona o no esta decisión"
            />
            <TextField
              label="Recomendación"
              value={option.feedback.recommendation}
              onChange={(v) =>
                setOption(optionIndex, (o) => ({
                  ...o,
                  feedback: { ...o.feedback, recommendation: v },
                }))
              }
              placeholder="Qué practicar después"
            />
            {option.consequences.map((consequence, ci) => (
              <div key={ci} className="editor-consequence">
                <TextField
                  label={`Consecuencia ${ci + 1}`}
                  value={consequence.description}
                  onChange={(v) =>
                    setOption(optionIndex, (o) => ({
                      ...o,
                      consequences: o.consequences.map((c, j) =>
                        j === ci ? { ...c, description: v } : c,
                      ),
                    }))
                  }
                  placeholder="Qué pasa después"
                />
                <label className="field">
                  <span className="field-label">Impacto</span>
                  <select
                    className="field-input"
                    value={consequence.impact}
                    onChange={(event) =>
                      setOption(optionIndex, (o) => ({
                        ...o,
                        consequences: o.consequences.map((c, j) =>
                          j === ci ? { ...c, impact: event.target.value as typeof c.impact } : c,
                        ),
                      }))
                    }
                  >
                    <option value="POSITIVE">▲ Positivo</option>
                    <option value="NEUTRAL">■ Neutro</option>
                    <option value="NEGATIVE">▼ Negativo</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Tipo</span>
                  <select
                    className="field-input"
                    value={consequence.type}
                    onChange={(event) =>
                      setOption(optionIndex, (o) => ({
                        ...o,
                        consequences: o.consequences.map((c, j) =>
                          j === ci ? { ...c, type: event.target.value as typeof c.type } : c,
                        ),
                      }))
                    }
                  >
                    <option value="RELATIONSHIP">Relacional</option>
                    <option value="TIME">Tiempo</option>
                    <option value="QUALITY">Calidad</option>
                    <option value="REPUTATION">Reputación</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="admin-link"
                  data-danger=""
                  aria-label={`Quitar consecuencia ${ci + 1}`}
                  onClick={() =>
                    setOption(optionIndex, (o) => ({
                      ...o,
                      consequences: o.consequences.filter((_, j) => j !== ci),
                    }))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            {option.consequences.length < 3 ? (
              <button
                type="button"
                className="admin-link"
                onClick={() =>
                  setOption(optionIndex, (o) => ({
                    ...o,
                    consequences: [
                      ...o.consequences,
                      { description: '', impact: 'NEUTRAL', type: 'RELATIONSHIP' },
                    ],
                  }))
                }
              >
                + Consecuencia
              </button>
            ) : null}
          </fieldset>
        ))}
        {step.options.length < 6 ? (
          <button
            type="button"
            className="admin-link"
            onClick={() => set({ options: [...step.options, emptyOption()] })}
          >
            + Agregar opción
          </button>
        ) : null}
      </div>
    </div>
  );
}
