'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PixelButton } from '../../../components/PixelButton';
import { StateCard } from '../../../components/StateCard';
import { listEvidence, listSkills } from '../../../lib/api';
import { formatDate, plural } from '../../../lib/format';
import { skillType } from '../../../lib/skill-types';

const PAGE_SIZE = 12;

/** EvidenciasV2 · Evidencias: filtro por habilidad (C-04) y «Cargar más». */
export function EvidenceListView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const skillId = params.get('habilidad') || undefined;

  const skills = useQuery({
    queryKey: ['skills'],
    queryFn: ({ signal }) => listSkills(signal),
    staleTime: 5 * 60_000,
  });
  const evidence = useInfiniteQuery({
    queryKey: ['evidence', { skillId, list: true }],
    queryFn: ({ pageParam, signal }) =>
      listEvidence({ skill_id: skillId, limit: PAGE_SIZE, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? loaded : undefined;
    },
  });

  const items = evidence.data?.pages.flatMap((page) => page.items) ?? [];
  const total = evidence.data?.pages[0]?.total;
  const skillName = skills.data?.items.find((skill) => skill.id === skillId)?.name;

  function pick(id: string | undefined) {
    router.replace(id ? `${pathname}?habilidad=${id}` : pathname, { scroll: false });
  }

  return (
    <div className="evidence-page">
      <header className="evidence-page-header">
        <span className="catalog-hello">Tus logros</span>
        <h1 className="evidence-page-title">Evidencias</h1>
      </header>

      <div className="evidence-filter" role="group" aria-labelledby="filtro-habilidad">
        <span id="filtro-habilidad" className="catalog-count">
          Filtrar por habilidad
        </span>
        <div className="catalog-filters">
          <button
            type="button"
            className="filter-chip"
            aria-pressed={!skillId}
            onClick={() => pick(undefined)}
          >
            Todas
          </button>
          {skills.data?.items.map((skill) => (
            <button
              key={skill.id}
              type="button"
              className="filter-chip evidence-skill-chip"
              data-type={skillType(skill.id)}
              aria-pressed={skill.id === skillId}
              onClick={() => pick(skill.id === skillId ? undefined : skill.id)}
            >
              {skill.name}
            </button>
          ))}
        </div>
      </div>

      <span className="catalog-count" aria-live="polite">
        {total === undefined ? 'Buscando…' : plural(total, 'evidencia')}
      </span>

      {evidence.isError && items.length === 0 ? (
        <StateCard
          kind="error"
          title="No pudimos cargar esta pantalla"
          message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
          action={{ label: 'Reintentar', onClick: () => void evidence.refetch() }}
        />
      ) : evidence.isPending ? (
        <div className="evidence-grid" aria-busy="true">
          <div className="sim-card-skeleton panel" />
        </div>
      ) : items.length === 0 ? (
        <div className="evidence-empty">
          <p>
            {skillId
              ? `Aún no tienes evidencias de ${skillName ?? 'esta habilidad'}.`
              : 'Aún no guardas evidencias. Al completar una simulación puedes guardarla como evidencia.'}
          </p>
          <PixelButton
            href={skillId ? '/perfil/recomendaciones' : '/simulaciones'}
            variant="secondary"
          >
            {skillId ? 'Ver recomendaciones' : 'Ir al catálogo'}
          </PixelButton>
        </div>
      ) : (
        <>
          <ul className="evidence-grid">
            {items.map((item) => {
              const firstType = item.skills[0] ? skillType(item.skills[0].id) : 'STONE';
              return (
                <li key={item.id}>
                  <Link
                    href={`/evidencias/${item.id}`}
                    className="evidence-card panel"
                    data-type={firstType}
                  >
                    <div className="type-stripe" aria-hidden="true">
                      {(item.skills.length > 0 ? item.skills : [{ id: 'x', name: '' }]).map(
                        (skill) => (
                          <span
                            key={skill.id}
                            data-type={skillType(skill.id)}
                            style={{ flexGrow: 1 }}
                          />
                        ),
                      )}
                    </div>
                    <div className="evidence-card-body">
                      <span className="evidence-card-icon">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/sprites/trophy.svg" alt="" width={40} height={40} />
                      </span>
                      <div className="evidence-card-text">
                        <h2 className="evidence-card-title">{item.title}</h2>
                        <span className="evidence-card-sub">
                          {item.simulation.title} · {formatDate(item.generated_at)}
                        </span>
                        <span className="evidence-card-skills">
                          {item.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="chip skill-row-chip"
                              data-type={skillType(skill.id)}
                            >
                              {skill.name}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="evidence-card-foot">
                      <span>{item.visibility === 'PUBLIC' ? '◎ Pública' : '● Privada'}</span>
                      <span>{plural(item.active_shares, 'enlace activo', 'enlaces activos')}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {evidence.hasNextPage ? (
            <div className="catalog-more">
              <PixelButton
                variant="secondary"
                onClick={() => void evidence.fetchNextPage()}
                disabled={evidence.isFetchingNextPage}
              >
                {evidence.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
              </PixelButton>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
