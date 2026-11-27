'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingCard, StateCard } from '../../../../../components/StateCard';
import { findAdminSimulation } from '../../../../../lib/api';
import { SimulationDataForm } from '../simulation-data-form';
import { SIM_STATUS } from '../simulations-view';
import { ContentEditor } from './content-editor';

/** Editor de una simulación: datos (y, desde 6.2, contenido). Solo lectura si no es borrador. */
export function SimulationAdminView({ simulationId }: { simulationId: string }) {
  const simulation = useQuery({
    queryKey: ['admin-simulation', simulationId],
    queryFn: ({ signal }) => findAdminSimulation(simulationId, signal),
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
        action={{ label: 'Ver simulaciones', href: '/admin/simulaciones' }}
      />
    );
  }

  const data = simulation.data;
  const editable = data.status === 'DRAFT';
  return (
    <div className="admin-page">
      <Link href="/admin/simulaciones" className="admin-back">
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
        aside={() => <SimulationDataForm key={data.id} simulation={data} readOnly={!editable} />}
      />
    </div>
  );
}
