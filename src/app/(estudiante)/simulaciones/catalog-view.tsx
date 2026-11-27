'use client';

import type { SimulationSummary } from '@qatok/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { PixelButton } from '../../../components/PixelButton';
import { SimulationCard } from '../../../components/SimulationCard';
import { StudentSprite } from '../../../components/Sprites';
import { StateCard } from '../../../components/StateCard';
import { getSimulation, listAttempts, listSimulations, listSkills } from '../../../lib/api';
import { plural } from '../../../lib/format';
import { DIFFICULTIES, typedSkills, type Difficulty } from '../../../lib/simulation';
import { SKILL_TYPES, skillType } from '../../../lib/skill-types';
import { useSession } from '../../../lib/use-session';

const PAGE_SIZE = 20;
const SEARCH_DELAY_MS = 300;

/** Filtros en la URL (?q, ?dificultad, ?habilidad) para que «Atrás» y recargar los conserven. */
function useCatalogFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const difficulty = params.get('dificultad');
  const filters = {
    search: params.get('q')?.trim() || undefined,
    difficulty: DIFFICULTIES.some((d) => d.value === difficulty)
      ? (difficulty as Difficulty)
      : undefined,
    skill_id: params.get('habilidad') || undefined,
  };

  function update(changes: Record<'q' | 'dificultad' | 'habilidad', string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { filters, update };
}

export function CatalogView() {
  const session = useSession();
  const { filters, update } = useCatalogFilters();
  const [searchText, setSearchText] = useState(filters.search ?? '');
  const countId = useId();

  // Búsqueda con espera: la URL (y la consulta) cambian 300 ms después de dejar de escribir.
  useEffect(() => {
    const value = searchText.trim();
    if (value === (filters.search ?? '')) return;
    const timer = setTimeout(
      () =>
        update({
          q: value || undefined,
          dificultad: filters.difficulty,
          habilidad: filters.skill_id,
        }),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  const skills = useQuery({
    queryKey: ['skills'],
    queryFn: ({ signal }) => listSkills(signal),
    staleTime: 5 * 60_000,
  });

  const catalog = useInfiniteQuery({
    queryKey: ['simulations', filters],
    queryFn: ({ pageParam, signal }) =>
      listSimulations({ ...filters, limit: PAGE_SIZE, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? loaded : undefined;
    },
  });

  const skillFilters = filterLabels(skills.data?.items ?? []);
  const items = catalog.data?.pages.flatMap((page) => page.items) ?? [];
  const total = catalog.data?.pages[0]?.total;
  const hasFilters = Boolean(filters.search || filters.difficulty || filters.skill_id);
  const firstName = session?.user.name.split(' ')[0] ?? '';

  function clearFilters() {
    setSearchText('');
    update({ q: undefined, dificultad: undefined, habilidad: undefined });
  }

  return (
    <div className="catalog">
      <div className="catalog-top">
        <header className="catalog-header">
          <span className="catalog-avatar">
            <StudentSprite
              size={36}
              shirt="var(--type-clock-base)"
              className="catalog-avatar-sprite"
            />
          </span>
          <div className="catalog-heading">
            <span className="catalog-hello">Hola, {firstName}</span>
            <h1 className="catalog-title">Simulaciones</h1>
          </div>
        </header>
        <ActiveAttemptBanner catalog={items} />
      </div>

      <div className="catalog-controls">
        <label className="catalog-search">
          <svg className="pixel-icon" width="18" height="18" viewBox="0 0 9 9" aria-hidden="true">
            <path
              fill="currentColor"
              d="M2 0h3v1h-3z M1 1h1v1h-1z M5 1h1v1h-1z M0 2h1v3h-1z M6 2h1v3h-1z M1 5h1v1h-1z M5 5h1v1h-1z M2 6h3v1h-3z M6 6h1v1h-1z M7 7h1v1h-1z M8 8h1v1h-1z"
            />
          </svg>
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar por título o descripción"
            aria-label="Buscar simulaciones"
            aria-describedby={countId}
            maxLength={150}
          />
        </label>
        <div className="catalog-filters" role="group" aria-label="Filtros">
          <button
            type="button"
            className="filter-chip"
            aria-pressed={!filters.difficulty && !filters.skill_id}
            onClick={() =>
              update({ q: filters.search, dificultad: undefined, habilidad: undefined })
            }
          >
            Todas
          </button>
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.value}
              type="button"
              className="filter-chip"
              aria-pressed={filters.difficulty === difficulty.value}
              onClick={() =>
                update({
                  q: filters.search,
                  dificultad:
                    filters.difficulty === difficulty.value ? undefined : difficulty.value,
                  habilidad: filters.skill_id,
                })
              }
            >
              {difficulty.stars} {difficulty.short}
            </button>
          ))}
          {skillFilters.map((skill) => (
            <button
              key={skill.id}
              type="button"
              className="filter-chip"
              data-type={skill.type}
              title={skill.name}
              aria-label={skill.label === skill.name ? undefined : `${skill.label} · ${skill.name}`}
              aria-pressed={filters.skill_id === skill.id}
              onClick={() =>
                update({
                  q: filters.search,
                  dificultad: filters.difficulty,
                  habilidad: filters.skill_id === skill.id ? undefined : skill.id,
                })
              }
            >
              {skill.label}
            </button>
          ))}
        </div>
      </div>

      <p id={countId} className="catalog-count" aria-live="polite">
        {total === undefined ? 'Buscando…' : plural(total, 'simulación', 'simulaciones')}
      </p>

      {catalog.isError && items.length === 0 ? (
        <StateCard
          kind="error"
          title="No pudimos cargar esta pantalla"
          message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
          action={{ label: 'Reintentar', onClick: () => void catalog.refetch() }}
        />
      ) : catalog.isPending ? (
        <div className="catalog-grid" aria-busy="true">
          {[0, 1].map((key) => (
            <div key={key} className="sim-card-skeleton panel" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <StateCard
          kind="empty"
          title="Nada por aquí"
          message={
            hasFilters
              ? 'Ninguna simulación coincide con tu búsqueda.'
              : 'Todavía no hay simulaciones publicadas.'
          }
          action={hasFilters ? { label: 'Quitar filtros', onClick: clearFilters } : undefined}
        />
      ) : (
        <>
          <ul className="catalog-grid">
            {items.map((simulation) => (
              <li key={simulation.id}>
                <SimulationCard simulation={simulation} href={`/simulaciones/${simulation.id}`} />
              </li>
            ))}
          </ul>
          {catalog.hasNextPage ? (
            <div className="catalog-more">
              <PixelButton
                variant="secondary"
                onClick={() => void catalog.fetchNextPage()}
                disabled={catalog.isFetchingNextPage}
              >
                {catalog.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
              </PixelButton>
            </div>
          ) : null}
          {catalog.isError ? (
            <p className="form-alert" role="alert">
              No pudimos cargar más simulaciones. Intenta de nuevo.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Chips de habilidad como en el diseño: el nombre corto del tipo («Voz»). Si el tipo es el de
 * respaldo o lo comparten dos habilidades, se usa el nombre de la habilidad.
 */
function filterLabels(skills: { id: string; name: string }[]) {
  const typed = skills.map((skill) => ({ ...skill, type: skillType(skill.id) }));
  return typed.map((skill) => {
    const shared = typed.filter((other) => other.type === skill.type).length > 1;
    const label = skill.type === 'STONE' || shared ? skill.name : SKILL_TYPES[skill.type].label;
    return { ...skill, label };
  });
}

/** «Partida en curso»: el intento IN_PROGRESS más reciente, con «Seguir ▶». */
function ActiveAttemptBanner({ catalog }: { catalog: SimulationSummary[] }) {
  const attempts = useQuery({
    queryKey: ['attempts', { status: 'IN_PROGRESS', limit: 1 }],
    queryFn: ({ signal }) => listAttempts({ status: 'IN_PROGRESS', limit: 1 }, signal),
  });
  const attempt = attempts.data?.items[0];
  const fromCatalog = catalog.find((item) => item.id === attempt?.simulation_id);
  const simulation = useQuery({
    queryKey: ['simulation', attempt?.simulation_id],
    queryFn: ({ signal }) => getSimulation(attempt!.simulation_id, signal),
    enabled: Boolean(attempt) && !fromCatalog,
    retry: false,
  });

  if (!attempt) return null;
  const summary = fromCatalog ?? simulation.data;
  const type = summary ? (typedSkills(summary.skills)[0]?.type ?? 'STONE') : 'STONE';

  return (
    <Link href={`/jugar/${attempt.id}`} className="active-attempt panel" data-type={type}>
      <svg className="pixel-icon" width="30" height="36" viewBox="0 0 10 12" aria-hidden="true">
        <path fill="#FFFFFF" d="M0 1h10v11h-10z" />
        <path fill="var(--color-ink)" d="M1 2h8v9h-8z" />
        <path fill="var(--type-base)" d="M3 0h4v2h-4z" />
        <path fill="#FFFFFF" d="M2 4h6v1h-6z M2 6h6v1h-6z M2 8h4v1h-4z" />
      </svg>
      <span className="active-attempt-text">
        <span className="active-attempt-label">Partida en curso</span>
        <span className="active-attempt-title">{summary?.title ?? 'Tu partida'}</span>
      </span>
      <span className="active-attempt-action">Seguir ▶</span>
    </Link>
  );
}
