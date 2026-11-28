'use client';

import type { AdminSimulation } from '@qatok/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingCard, StateCard } from '../../../../../components/StateCard';
import { findAdminSimulation } from '../../../../../lib/api';
import { SimulationDataForm } from '../simulation-data-form';
import { SIM_STATUS } from '../simulations-view';

type AdminSimulationList = { items: AdminSimulation[]; total: number };
import { ContentEditor } from './content-editor';
import { PublishPanel } from './publish-panel';

/** Editor de una simulación: datos (y, desde 6.2, contenido). Solo lectura si no es borrador. */
export function SimulationAdminView({ simulationId }: { simulationId: string }) {
  const queryClient = useQueryClient();
  const simulation = useQuery({
    queryKey: ['admin-simulation', simulationId],
    queryFn: ({ signal }) => findAdminSimulation(simulationId, signal),
    // Si se llega desde la lista, se usan sus datos (sin pedir nada); con enlace directo, se busca.
    initialData: () => {
      for (const [, page] of queryClient.getQueriesData<AdminSimulationList>({
        queryKey: ['admin-simulations'],
      })) {
        const found = page?.items.find((item) => item.id === simulationId);
        if (found) return found;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(['admin-simulations'])?.dataUpdatedAt,
  });

  if (simulation.isError) {
    return (
      <StateCard
        kind="error"
        title="No pudimos cargar la simulación"
        message="Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void simulation.refetch() }}
      />
    );
  }
  if (simulation.isPending) return <LoadingCard />;
  if (!simulation.data) {
    return (
      <StateCard
        kind="not-found"
        title="No encontramos esta simulación"
        message="Puede que la hayan eliminado."
        action={{ label: 'Ver simulaciones', href: '/admin/simulations' }}
      />
    );
  }

  const data = simulation.data;
  const editable = data.status === 'DRAFT';
  return (
    <div className="admin-page">
      <Link href="/admin/simulations" className="admin-back">
        ◀ Simulaciones
      </Link>
      <div className="admin-head-text">
        <span className="admin-status" data-status={data.status}>
          {SIM_STATUS[data.status].badge}
        </span>
        <h1 className="admin-title">{data.title}</h1>
      </div>
      <ContentEditor
        simulationId={data.id}
        readOnly={!editable}
        aside={(content, dirty) => (
          <>
            {editable ? (
              <PublishPanel
                simulation={data}
                version={content.version}
                steps={content.steps}
                dirty={dirty}
              />
            ) : (
              <p className="admin-readonly" role="status">
                {data.status === 'PUBLISHED'
                  ? '● Publicada: solo lectura. El contenido publicado no se edita; se puede desactivar.'
                  : '✕ Inactiva: solo lectura. Ya no aparece en el catálogo.'}
              </p>
            )}
            <SimulationDataForm key={data.id} simulation={data} readOnly={!editable} />
          </>
        )}
      />
    </div>
  );
}
