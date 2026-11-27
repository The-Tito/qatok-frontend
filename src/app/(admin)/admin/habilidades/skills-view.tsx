'use client';

import { SkillInput, type Skill } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type FormEvent } from 'react';
import { Field } from '../../../../components/Field';
import { PixelButton } from '../../../../components/PixelButton';
import { Sheet } from '../../../../components/Sheet';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import {
  createSkill,
  deleteSkill,
  fieldErrors,
  isApiError,
  listAdminSimulations,
  listSkills,
  updateSkill,
} from '../../../../lib/api';
import { SKILL_TYPES, skillType } from '../../../../lib/skill-types';

type Errors = Partial<Record<'name' | 'description' | 'category' | 'target_level', string>>;

/** A3 · Habilidades (AdminHabilidadesV2): crear, editar y eliminar (409 SKILL_IN_USE). */
export function SkillsView() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Skill | null>(null);

  const skills = useQuery({ queryKey: ['skills'], queryFn: ({ signal }) => listSkills(signal) });
  // Qué habilidades están en uso: aparecen en alguna simulación (de cualquier estado).
  const simulations = useQuery({
    queryKey: ['admin-simulations', { limit: 100 }],
    queryFn: ({ signal }) => listAdminSimulations({ limit: 100 }, signal),
  });
  const inUse = new Set(simulations.data?.items.flatMap((sim) => sim.skills.map((s) => s.id)));

  const remove = useMutation({
    mutationFn: (skill: Skill) => deleteSkill(skill.id),
    onSuccess: (_, skill) => {
      setConfirming(null);
      setNotice(`Se eliminó «${skill.name}».`);
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error, skill) => {
      setConfirming(null);
      setNotice(
        isApiError(error, 'SKILL_IN_USE')
          ? `«${skill.name}» está asignada a una simulación: no se puede eliminar.`
          : 'No pudimos eliminar la habilidad. Intenta de nuevo.',
      );
    },
  });

  return (
    <div className="admin-page">
      <div className="admin-head-text">
        <h1 className="admin-title">Habilidades</h1>
        <span className="admin-sub">
          Una habilidad asignada a una simulación no se puede eliminar.
        </span>
      </div>
      <p className="sr-status admin-notice" role="status">
        {notice}
      </p>
      <div className="admin-split">
        {skills.isError ? (
          <StateCard
            kind="error"
            title="No pudimos cargar las habilidades"
            message="Intenta de nuevo en unos segundos."
            action={{ label: 'Reintentar', onClick: () => void skills.refetch() }}
          />
        ) : !skills.data ? (
          <LoadingCard />
        ) : (
          <div className="admin-table-wrap panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Objetivo</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {skills.data.items.map((skill) => {
                  const type = skillType(skill.id);
                  return (
                    <tr key={skill.id}>
                      <td>
                        <span className="chip chip-sm" data-type={type}>
                          {SKILL_TYPES[type].label}
                        </span>
                      </td>
                      <td className="admin-cell-title">{skill.name}</td>
                      <td>{skill.category || '—'}</td>
                      <td>{skill.target_level ?? '—'}</td>
                      <td>
                        <span className="admin-actions">
                          <button
                            type="button"
                            className="admin-link"
                            onClick={() => {
                              setNotice(null);
                              setEditing(skill);
                            }}
                          >
                            Editar
                          </button>
                          {inUse.has(skill.id) ? (
                            <span className="admin-muted">En uso</span>
                          ) : (
                            <button
                              type="button"
                              className="admin-link"
                              data-danger=""
                              disabled={remove.isPending}
                              onClick={() => {
                                setNotice(null);
                                setConfirming(skill);
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <SkillForm
          key={editing?.id ?? 'nueva'}
          skill={editing}
          onDone={(message) => {
            setNotice(message);
            setEditing(null);
          }}
        />
      </div>
      <Sheet
        open={confirming !== null}
        onClose={() => !remove.isPending && setConfirming(null)}
        title="¿Eliminar la habilidad?"
        role="alertdialog"
      >
        <div className="danger-box">
          <span className="danger-box-tag">✕ No se puede deshacer</span>
          <p className="pause-text-danger">
            Se elimina «{confirming?.name}» del catálogo de habilidades.
          </p>
        </div>
        <PixelButton
          variant="danger"
          className="danger-confirm"
          size="lg"
          block
          disabled={remove.isPending}
          onClick={() => confirming && remove.mutate(confirming)}
        >
          {remove.isPending ? 'Eliminando…' : 'Sí, eliminar'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          block
          disabled={remove.isPending}
          onClick={() => setConfirming(null)}
        >
          Cancelar
        </PixelButton>
      </Sheet>
    </div>
  );
}

function SkillForm({ skill, onDone }: { skill: Skill | null; onDone: (message: string) => void }) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (input: Parameters<typeof createSkill>[0]) =>
      skill ? updateSkill(skill.id, input) : createSkill(input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
      formRef.current?.reset();
      onDone(skill ? `Se guardó «${result.skill.name}».` : `Se creó «${result.skill.name}».`);
    },
    onError: (error) => {
      if (isApiError(error, 'SKILL_ALREADY_EXISTS')) {
        setErrors({ name: 'Ya existe una habilidad con ese nombre.' });
      } else if (Object.keys(fieldErrors(error)).length > 0) {
        setErrors(
          Object.fromEntries(
            Object.keys(fieldErrors(error)).map((key) => [key, 'Revisa este campo.']),
          ),
        );
      } else {
        setFailed('No pudimos guardar la habilidad. Intenta de nuevo.');
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const target = String(data.get('target_level') ?? '').trim();
    const parsed = SkillInput.safeParse({
      name: String(data.get('name') ?? ''),
      description: String(data.get('description') ?? ''),
      category: String(data.get('category') ?? ''),
      target_level: target === '' ? null : Number(target),
    });
    setFailed(null);
    if (!parsed.success) {
      const found: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        found[key] =
          key === 'name'
            ? 'Escribe un nombre de 1 a 100 caracteres.'
            : key === 'category'
              ? 'Hasta 50 caracteres.'
              : key === 'target_level'
                ? 'Un entero de 0 a 100, o vacío.'
                : 'Revisa este campo.';
      }
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate(parsed.data);
  }

  return (
    <form ref={formRef} className="admin-form panel" onSubmit={handleSubmit} noValidate>
      <h2 className="profile-heading">{skill ? `Editar «${skill.name}»` : 'Nueva habilidad'}</h2>
      <Field
        label="Nombre"
        name="name"
        maxLength={100}
        defaultValue={skill?.name}
        placeholder="Ej.: Trabajo en equipo"
        error={errors.name}
      />
      <div className="field">
        <label className="field-label" htmlFor="skill-description">
          Descripción
        </label>
        <textarea
          id="skill-description"
          name="description"
          rows={2}
          className="field-input admin-textarea"
          defaultValue={skill?.description}
          placeholder="Qué significa dominarla"
        />
      </div>
      <div className="admin-form-row">
        <Field
          label="Categoría"
          name="category"
          maxLength={50}
          defaultValue={skill?.category}
          placeholder="Interpersonal"
          error={errors.category}
        />
        <Field
          label="Objetivo (0–100)"
          name="target_level"
          type="number"
          min={0}
          max={100}
          defaultValue={skill?.target_level ?? ''}
          placeholder="Opcional"
          error={errors.target_level}
        />
      </div>
      <p className="account-note">
        Tipo visual: lo decide el backend (D1, pendiente). Mientras tanto, las habilidades nuevas
        usan Piedra.
      </p>
      {failed ? (
        <p className="form-alert" role="alert">
          {failed}
        </p>
      ) : null}
      <PixelButton type="submit" block disabled={save.isPending}>
        {save.isPending ? 'Guardando…' : 'Guardar habilidad'}
      </PixelButton>
      {skill ? (
        <PixelButton variant="secondary" block onClick={() => onDone('')}>
          Cancelar
        </PixelButton>
      ) : null}
    </form>
  );
}
