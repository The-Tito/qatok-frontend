'use client';

import type { AdminSimulation } from '@qatok/shared';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PixelButton } from '../../../../components/PixelButton';
import { Sheet } from '../../../../components/Sheet';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import {
  deactivateSimulation,
  deleteAdminSimulation,
  isApiError,
  listAdminSimulations,
} from '../../../../lib/api';
import { plural } from '../../../../lib/format';
import { DIFFICULTIES, durationText } from '../../../../lib/simulation';
import { skillType } from '../../../../lib/skill-types';

type Status = AdminSimulation['status'];
export const SIM_STATUS: Record<Status, { badge: string; tab: string }> = {
  PUBLISHED: { badge: '● Publicada', tab: 'Publicadas' },
  DRAFT: { badge: '○ Borrador', tab: 'Borradores' },
  INACTIVE: { badge: '✕ Inactiva', tab: 'Inactivas' },
};
const STATUSES = Object.keys(SIM_STATUS) as Status[];

type Pending = { kind: 'deactivate' | 'delete'; simulation: AdminSimulation };

/** A1 · Simulaciones (AdminSimulacionesV2): lista por estado, desactivar y eliminar borrador. */
export function SimulationsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const raw = params.get('status');
  const status = STATUSES.includes(raw as Status) ? (raw as Status) : undefined;
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const counts = useQueries({
    queries: [undefined, ...STATUSES].map((key) => ({
      queryKey: ['admin-simulations', { status: key, limit: 1 }],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        listAdminSimulations({ status: key, limit: 1 }, signal),
    })),
  });
  const list = useQuery({
    queryKey: ['admin-simulations', { status, limit: 100 }],
    queryFn: ({ signal }) => listAdminSimulations({ status, limit: 100 }, signal),
  });

  const action = useMutation({
    mutationFn: ({ kind, simulation }: Pending) =>
      kind === 'deactivate'
        ? deactivateSimulation(simulation.id)
        : deleteAdminSimulation(simulation.id),
    onSuccess: (_, { kind, simulation }) => {
      setNotice(
        kind === 'deactivate'
          ? `«${simulation.title}» quedó inactiva: ya no aparece en el catálogo.`
          : `Se eliminó el borrador «${simulation.title}».`,
      );
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-simulations'] });
      void queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
    onError: (error) => {
      setNotice(
        isApiError(error, 'SIMULATION_NOT_EDITABLE', 'SIMULATION_NOT_PUBLISHED')
          ? 'La simulación cambió de estado. Revisa la lista.'
          : 'No pudimos completar la acción. Intenta de nuevo.',
      );
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-simulations'] });
    },
  });

  const items = [...(list.data?.items ?? [])].sort((a, b) => a.title.localeCompare(b.title, 'es'));
  const tabs: { key: Status | undefined; label: string }[] = [
    { key: undefined, label: 'Todas' },
    ...STATUSES.map((key) => ({ key, label: SIM_STATUS[key].tab })),
  ];

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head-text">
          <h1 className="admin-title">Simulaciones</h1>
          <span className="admin-sub">
            Solo las publicadas aparecen en el catálogo de estudiantes.
          </span>
        </div>
        <PixelButton href="/admin/simulations/new">+ Nueva simulación</PixelButton>
      </div>

      <div className="catalog-filters" role="group" aria-label="Estado">
        {tabs.map((tab, index) => {
          const count = counts[index]?.data?.total;
          return (
            <button
              key={tab.label}
              type="button"
              className="filter-chip"
              aria-pressed={status === tab.key}
              onClick={() =>
                router.replace(tab.key ? `${pathname}?status=${tab.key}` : pathname, {
                  scroll: false,
                })
              }
            >
              {tab.label}
              {count === undefined ? '' : ` · ${count}`}
            </button>
          );
        })}
      </div>

      <p className="sr-status admin-notice" role="status">
        {notice}
      </p>

      {list.isError ? (
        <StateCard
          kind="error"
          title="No pudimos cargar esta pantalla"
          message="Intenta de nuevo en unos segundos."
          action={{ label: 'Reintentar', onClick: () => void list.refetch() }}
        />
      ) : list.isPending ? (
        <LoadingCard />
      ) : items.length === 0 ? (
        <StateCard
          kind="empty"
          title="Nada por aquí"
          message="No hay simulaciones con este estado."
          action={{ label: 'Crear simulación', href: '/admin/simulations/new' }}
        />
      ) : (
        <div className="admin-table-wrap panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Estado</th>
                <th scope="col">Dificultad</th>
                <th scope="col">Duración</th>
                <th scope="col">Habilidades</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((simulation) => (
                <tr key={simulation.id}>
                  <td className="admin-cell-title">{simulation.title}</td>
                  <td>
                    <span className="admin-status" data-status={simulation.status}>
                      {SIM_STATUS[simulation.status].badge}
                    </span>
                  </td>
                  <td>
                    {DIFFICULTIES.find((d) => d.value === simulation.difficulty)?.label ??
                      simulation.difficulty}
                  </td>
                  <td>{durationText(simulation.estimated_duration) ?? '—'}</td>
                  <td>
                    <span className="admin-chips">
                      {simulation.skills.map((skill) => (
                        <span key={skill.id} className="chip chip-sm" data-type={skillType(skill)}>
                          {skill.name} {skill.weight}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td>
                    <span className="admin-actions">
                      <Link href={`/admin/simulations/${simulation.id}`} className="admin-link">
                        {simulation.status === 'DRAFT' ? 'Editar' : 'Ver contenido'}
                      </Link>
                      {simulation.status === 'PUBLISHED' ? (
                        <button
                          type="button"
                          className="admin-link"
                          data-danger=""
                          onClick={() => setPending({ kind: 'deactivate', simulation })}
                        >
                          Desactivar
                        </button>
                      ) : null}
                      {simulation.status === 'DRAFT' ? (
                        <button
                          type="button"
                          className="admin-link"
                          data-danger=""
                          onClick={() => setPending({ kind: 'delete', simulation })}
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <span className="admin-sub">
        {plural(items.length, 'simulación', 'simulaciones')} · ordenadas por título
      </span>

      <Sheet
        open={pending !== null}
        onClose={() => !action.isPending && setPending(null)}
        title={pending?.kind === 'delete' ? '¿Eliminar el borrador?' : '¿Desactivar la simulación?'}
        role="alertdialog"
      >
        <div className="danger-box">
          <span className="danger-box-tag">
            {pending?.kind === 'delete' ? '✕ No se puede deshacer' : '◆ Deja el catálogo'}
          </span>
          <p className="pause-text-danger">
            {pending?.kind === 'delete'
              ? `Se borran los datos y el contenido de «${pending?.simulation.title}».`
              : `«${pending?.simulation.title}» deja de aparecer en el catálogo. Quien ya la está jugando puede terminarla.`}
          </p>
        </div>
        <PixelButton
          variant="danger"
          className="danger-confirm"
          size="lg"
          block
          disabled={action.isPending}
          onClick={() => pending && action.mutate(pending)}
        >
          {action.isPending
            ? 'Procesando…'
            : pending?.kind === 'delete'
              ? 'Sí, eliminar'
              : 'Sí, desactivar'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          block
          disabled={action.isPending}
          onClick={() => setPending(null)}
        >
          Cancelar
        </PixelButton>
      </Sheet>
    </div>
  );
}
