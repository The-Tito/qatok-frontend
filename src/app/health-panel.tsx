'use client';

import { NombreBase, type Salud } from '@qatok/shared';
import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api';

const databases = {
  relacional: 'PostgreSQL',
  documental: 'MongoDB',
  grafo: 'Neo4j',
} as const satisfies Record<NombreBase, string>;

type HealthResult =
  { state: 'loading' } | { state: 'ready'; value: Salud } | { state: 'unavailable' };

const statusLabels = {
  loading: 'Consultando la API…',
  unavailable: 'No se pudo conectar con la API.',
  OK: 'Las tres bases están disponibles.',
  DEGRADADO: 'Una o más bases están fuera de servicio.',
};

export function HealthPanel() {
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState<HealthResult>({ state: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]);

    getHealth(signal).then(
      (value) => {
        if (!controller.signal.aborted) setResult({ state: 'ready', value });
      },
      () => {
        if (!controller.signal.aborted) setResult({ state: 'unavailable' });
      },
    );

    return () => controller.abort();
  }, [request]);

  function refresh() {
    setResult({ state: 'loading' });
    setRequest((previous) => previous + 1);
  }

  return (
    <section className="health-panel" aria-labelledby="health-title">
      <div className="panel-heading">
        <h1 id="health-title">Estado de la API</h1>
        <p role="status">
          {statusLabels[result.state === 'ready' ? result.value.estado : result.state]}
        </p>
      </div>
      <ul className="database-list">
        {NombreBase.options.map((id) => {
          const database = result.state === 'ready' ? result.value.bases[id] : null;
          return (
            <li className="database-row" key={id}>
              <span className="database-name">{databases[id]}</span>
              {database && <span className="latency">{database.latencia_ms} ms</span>}
              <span
                className="status-chip"
                data-status={database ? (database.ok ? 'available' : 'failed') : 'unknown'}
              >
                {database ? (database.ok ? 'Disponible' : 'Sin conexión') : 'Sin verificar'}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="panel-actions">
        <button type="button" onClick={refresh} disabled={result.state === 'loading'}>
          Actualizar
        </button>
      </div>
    </section>
  );
}
