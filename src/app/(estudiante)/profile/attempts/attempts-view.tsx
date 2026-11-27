'use client';

import type { SimulationSummary } from '@qatok/shared';
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '../../../../components/PageHeader';
import { PixelButton } from '../../../../components/PixelButton';
import { TypeStripe } from '../../../../components/SimulationCard';
import { Sparkle } from '../../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { listAttempts, listSimulations } from '../../../../lib/api';
import { ATTEMPT_STATUS, durationMinutes } from '../../../../lib/attempts';
import { formatDate, plural } from '../../../../lib/format';
import { typedSkills } from '../../../../lib/simulation';

type Status = keyof typeof ATTEMPT_STATUS;
const STATUSES = Object.keys(ATTEMPT_STATUS) as Status[];
const PAGE_SIZE = 20;
const EMPTY: Record<Status, string> = {
  IN_PROGRESS: 'No tienes partidas en curso.',
  COMPLETED: 'Aún no completas ninguna partida.',
  ABANDONED: 'No has abandonado ninguna partida.',
};
const formatScore = (n: number) => String(Math.round(n * 10) / 10);

/** P5 · Mis partidas: filtro por estado (?status) y «Cargar más». */
export function AttemptsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get('status');
  const status = STATUSES.includes(raw as Status) ? (raw as Status) : undefined;

  // Contadores de cada filtro: total con limit=1.
  const counts = useQueries({
    queries: [undefined, ...STATUSES].map((key) => ({
      queryKey: ['attempts', { status: key, limit: 1 }],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        listAttempts({ status: key, limit: 1 }, signal),
    })),
  });

  const attempts = useInfiniteQuery({
    queryKey: ['attempts', { status, list: true }],
    queryFn: ({ pageParam, signal }) =>
      listAttempts({ status, limit: PAGE_SIZE, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? loaded : undefined;
    },
  });

  // items solo trae simulation_id: el título y el color salen del catálogo.
  const catalog = useQuery({
    queryKey: ['simulations', { limit: 100 }],
    queryFn: ({ signal }) => listSimulations({ limit: 100 }, signal),
    staleTime: 5 * 60_000,
  });
  const simulations = new Map<string, SimulationSummary>(
    catalog.data?.items.map((item) => [item.id, item]),
  );

  const header = (
    <PageHeader
      title="Mis partidas"
      eyebrow="Historial"
      back={{ href: '/profile', label: 'Perfil' }}
    />
  );

  if (attempts.isError && !attempts.data) {
    return (
      <div className="recos">
        {header}
        <StateCard
          kind="error"
          title="No pudimos cargar esta pantalla"
          message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
          action={{ label: 'Reintentar', onClick: () => void attempts.refetch() }}
        />
      </div>
    );
  }

  const items = attempts.data?.pages.flatMap((page) => page.items) ?? [];
  const total = attempts.data?.pages[0]?.total;
  const filters: { key: Status | undefined; label: string }[] = [
    { key: undefined, label: 'Todas' },
    ...STATUSES.map((key) => ({ key, label: ATTEMPT_STATUS[key].filter })),
  ];

  return (
    <div className="recos">
      {header}
      <div className="recos-body">
        <div className="catalog-filters" role="group" aria-label="Estado">
          {filters.map((filter, index) => {
            const count = counts[index]?.data?.total;
            return (
              <button
                key={filter.label}
                type="button"
                className="filter-chip"
                aria-pressed={status === filter.key}
                onClick={() =>
                  router.replace(filter.key ? `${pathname}?status=${filter.key}` : pathname, {
                    scroll: false,
                  })
                }
              >
                {filter.label}
                {count === undefined ? '' : ` · ${count}`}
              </button>
            );
          })}
        </div>
        <span className="catalog-count" aria-live="polite">
          {total === undefined ? 'Buscando…' : plural(total, 'partida')}
        </span>

        {attempts.isPending ? (
          <LoadingCard />
        ) : items.length === 0 ? (
          <div className="recos-note">
            <Sparkle color="var(--color-stone)" size={28} />
            <p>
              {status ? EMPTY[status] : 'Aún no juegas ninguna partida.'}{' '}
              <Link href="/simulations">Ir al catálogo</Link>
            </p>
          </div>
        ) : (
          <>
            <ul className="attempt-list">
              {items.map((attempt) => {
                const simulation = simulations.get(attempt.simulation_id);
                const skills = simulation ? typedSkills(simulation.skills) : [];
                const minutes = durationMinutes(attempt);
                const inProgress = attempt.status === 'IN_PROGRESS';
                return (
                  <li
                    key={attempt.id}
                    className="attempt-card panel"
                    data-type={skills[0]?.type ?? 'STONE'}
                    data-status={attempt.status}
                  >
                    {skills.length > 0 ? (
                      <TypeStripe skills={skills} />
                    ) : (
                      <div className="type-stripe" aria-hidden="true">
                        <span style={{ flexGrow: 1 }} />
                      </div>
                    )}
                    <div className="attempt-card-body">
                      <span className="attempt-card-text">
                        <span className="attempt-card-title">
                          {simulation?.title ?? 'Simulación no disponible'}
                        </span>
                        <span className="attempt-card-dates">
                          {inProgress
                            ? `Iniciada el ${formatDate(attempt.started_at)}`
                            : `${formatDate(attempt.finished_at ?? attempt.started_at)}${minutes ? ` · ${minutes} min` : ''}`}
                        </span>
                        <span className="attempt-card-meta">
                          <span className="attempt-status">
                            {ATTEMPT_STATUS[attempt.status].badge}
                          </span>
                          <span className="attempt-score">
                            {attempt.score === null
                              ? 'Sin puntuación aún'
                              : `${formatScore(attempt.score)} / 100`}
                          </span>
                        </span>
                      </span>
                      <Link
                        href={
                          inProgress ? `/play/${attempt.id}` : `/profile/attempts/${attempt.id}`
                        }
                        className="attempt-action"
                        data-primary={inProgress || undefined}
                      >
                        {inProgress ? 'Seguir ▶' : 'Ver recorrido'}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
            {attempts.hasNextPage ? (
              <div className="catalog-more">
                <PixelButton
                  variant="secondary"
                  onClick={() => void attempts.fetchNextPage()}
                  disabled={attempts.isFetchingNextPage}
                >
                  {attempts.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
                </PixelButton>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
