'use client';

import { SimulationInput, type AdminSimulation } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field } from '../../../../components/Field';
import { PixelButton } from '../../../../components/PixelButton';
import {
  createAdminSimulation,
  fieldErrors,
  isApiError,
  listSkills,
  updateAdminSimulation,
} from '../../../../lib/api';
import { DIFFICULTIES, type Difficulty } from '../../../../lib/simulation';

interface SkillRow {
  key: number;
  skill_id: string;
  weight: string;
  expected_level: string;
}

let rowKey = 0;
const toRows = (simulation?: AdminSimulation): SkillRow[] =>
  simulation?.skills.length
    ? simulation.skills.map((s) => ({
        key: rowKey++,
        skill_id: s.id,
        weight: String(s.weight),
        expected_level: String(s.expected_level),
      }))
    : [{ key: rowKey++, skill_id: '', weight: '1', expected_level: '60' }];

/** Datos de una simulación (título, descripción, dificultad, duración y habilidades). */
export function SimulationDataForm({
  simulation,
  readOnly = false,
}: {
  simulation?: AdminSimulation;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const skills = useQuery({ queryKey: ['skills'], queryFn: ({ signal }) => listSkills(signal) });
  const [rows, setRows] = useState<SkillRow[]>(() => toRows(simulation));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useMutation({
    mutationFn: (input: Parameters<typeof createAdminSimulation>[0]) =>
      simulation ? updateAdminSimulation(simulation.id, input) : createAdminSimulation(input),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-simulations'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-simulation', saved.id] });
      if (simulation) setMessage({ ok: true, text: 'Datos guardados.' });
      else router.replace(`/admin/simulaciones/${saved.id}`);
    },
    onError: (error) => {
      if (isApiError(error, 'SIMULATION_NOT_EDITABLE')) {
        setMessage({ ok: false, text: 'La simulación cambió de estado: ya no es un borrador.' });
      } else if (isApiError(error, 'SKILL_NOT_FOUND')) {
        setMessage({ ok: false, text: 'Una habilidad ya no existe. Recarga la lista.' });
        void queryClient.invalidateQueries({ queryKey: ['skills'] });
      } else if (Object.keys(fieldErrors(error)).length > 0) {
        setMessage({ ok: false, text: 'Revisa los campos marcados.' });
      } else {
        setMessage({ ok: false, text: 'No pudimos guardar. Intenta de nuevo.' });
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const duration = String(data.get('estimated_duration') ?? '').trim();
    const parsed = SimulationInput.safeParse({
      title: String(data.get('title') ?? '').trim(),
      description: String(data.get('description') ?? ''),
      difficulty: data.get('difficulty') as Difficulty,
      estimated_duration: duration === '' ? null : Number(duration),
      skills: rows
        .filter((row) => row.skill_id)
        .map((row) => ({
          skill_id: row.skill_id,
          weight: Number(row.weight),
          expected_level: Number(row.expected_level),
        })),
    });
    setMessage(null);
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        found[key] =
          key === 'title'
            ? 'Escribe un título (hasta 150 caracteres).'
            : key === 'estimated_duration'
              ? 'Minutos enteros, o vacío.'
              : key === 'skills'
                ? 'Elige al menos una habilidad, sin repetir; peso de 0.01 a 1 y nivel de 0 a 100.'
                : 'Revisa este campo.';
      }
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate(parsed.data);
  }

  const weightSum = rows.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);

  return (
    <form className="admin-form panel" onSubmit={handleSubmit} noValidate aria-disabled={readOnly}>
      <h2 className="profile-heading">Datos de la simulación</h2>
      <fieldset className="admin-fieldset" disabled={readOnly || save.isPending}>
        <Field
          label="Título"
          name="title"
          maxLength={150}
          defaultValue={simulation?.title}
          error={errors.title}
        />
        <div className="field">
          <label className="field-label" htmlFor="sim-description">
            Descripción
          </label>
          <textarea
            id="sim-description"
            name="description"
            rows={3}
            className="field-input admin-textarea"
            defaultValue={simulation?.description}
          />
        </div>
        <div className="admin-form-row">
          <div className="field">
            <label className="field-label" htmlFor="sim-difficulty">
              Dificultad
            </label>
            <select
              id="sim-difficulty"
              name="difficulty"
              className="field-input"
              defaultValue={simulation?.difficulty ?? 'BASIC'}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Duración (min)"
            name="estimated_duration"
            type="number"
            min={1}
            defaultValue={simulation?.estimated_duration ?? ''}
            placeholder="Opcional"
            error={errors.estimated_duration}
          />
        </div>
        <fieldset className="admin-skill-rows">
          <legend className="field-label">Habilidades que entrena</legend>
          {rows.map((row, index) => (
            <div key={row.key} className="admin-skill-row">
              <select
                aria-label={`Habilidad ${index + 1}`}
                className="field-input"
                value={row.skill_id}
                onChange={(event) =>
                  setRows(
                    rows.map((r) =>
                      r.key === row.key ? { ...r, skill_id: event.target.value } : r,
                    ),
                  )
                }
              >
                <option value="">Elige una habilidad</option>
                {skills.data?.items.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Peso de la habilidad ${index + 1}`}
                className="field-input admin-number"
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={row.weight}
                onChange={(event) =>
                  setRows(
                    rows.map((r) => (r.key === row.key ? { ...r, weight: event.target.value } : r)),
                  )
                }
              />
              <input
                aria-label={`Nivel esperado de la habilidad ${index + 1}`}
                className="field-input admin-number"
                type="number"
                min={0}
                max={100}
                value={row.expected_level}
                onChange={(event) =>
                  setRows(
                    rows.map((r) =>
                      r.key === row.key ? { ...r, expected_level: event.target.value } : r,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="admin-link"
                data-danger=""
                aria-label={`Quitar habilidad ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() => setRows(rows.filter((r) => r.key !== row.key))}
              >
                ✕
              </button>
            </div>
          ))}
          <p className="field-message" data-error={errors.skills ? '' : undefined}>
            {errors.skills ??
              `Peso de 0.01 a 1 y nivel esperado de 0 a 100. Suma de pesos: ${Math.round(weightSum * 100) / 100}.`}
          </p>
          <button
            type="button"
            className="admin-link"
            onClick={() =>
              setRows([
                ...rows,
                { key: rowKey++, skill_id: '', weight: '0.5', expected_level: '60' },
              ])
            }
          >
            + Agregar habilidad
          </button>
        </fieldset>
      </fieldset>
      {message ? (
        <p
          className={message.ok ? 'account-status' : 'form-alert'}
          role={message.ok ? 'status' : 'alert'}
        >
          {message.text}
        </p>
      ) : null}
      {readOnly ? (
        <p className="account-note">Solo lectura: solo los borradores se pueden editar.</p>
      ) : (
        <PixelButton type="submit" block disabled={save.isPending}>
          {save.isPending ? 'Guardando…' : simulation ? 'Guardar datos' : 'Crear borrador'}
        </PixelButton>
      )}
    </form>
  );
}
