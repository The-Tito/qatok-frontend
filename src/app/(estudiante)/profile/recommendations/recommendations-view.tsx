'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '../../../../components/PageHeader';
import { TypeStripe } from '../../../../components/SimulationCard';
import { Sparkle } from '../../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { listRecommendations } from '../../../../lib/api';
import { plural } from '../../../../lib/format';
import { difficultyText, durationText, typedSkills } from '../../../../lib/simulation';

/** P4 · Recomendaciones (C-01). La prioridad solo ordena: no se muestra como número. */
export function RecommendationsView() {
  const recommendations = useQuery({
    queryKey: ['recommendations'],
    queryFn: ({ signal }) => listRecommendations(20, signal),
  });

  const header = (
    <PageHeader
      title="Recomendaciones"
      eyebrow="Para ti"
      back={{ href: '/profile', label: 'Perfil' }}
    />
  );

  if (recommendations.isError) {
    return (
      <div className="recos">
        {header}
        <StateCard
          kind="error"
          title="No pudimos cargar esta pantalla"
          message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
          action={{ label: 'Reintentar', onClick: () => void recommendations.refetch() }}
        />
      </div>
    );
  }
  if (!recommendations.data) {
    return (
      <div className="recos">
        {header}
        <LoadingCard />
      </div>
    );
  }

  const items = recommendations.data.items;

  return (
    <div className="recos">
      {header}
      <div className="recos-body">
        <p className="recos-intro">
          Simulaciones que entrenan las habilidades que tienes por debajo de lo esperado. La primera
          es la que más te ayuda.
        </p>
        <span className="catalog-count">
          {plural(items.length, 'recomendación', 'recomendaciones')}
        </span>
        {items.length === 0 ? (
          <StateCard
            kind="empty"
            title="Nada que reforzar por ahora"
            message="Cuando una habilidad quede por debajo de lo esperado, aquí verás qué practicar."
            action={{ label: 'Ir al catálogo', href: '/simulations' }}
          />
        ) : (
          <ol className="recos-grid">
            {items.map((item, index) => {
              const skills = typedSkills(item.simulation.skills);
              const duration = durationText(item.simulation.estimated_duration);
              return (
                <li key={item.simulation.id}>
                  <Link
                    href={`/simulations/${item.simulation.id}`}
                    className="sim-card panel"
                    data-type={skills[0]?.type ?? 'STONE'}
                  >
                    <TypeStripe skills={skills} />
                    <div className="sim-card-body">
                      <div className="sim-card-meta">
                        <span className="recos-rank">#{index + 1}</span>
                        <span>
                          {difficultyText(item.simulation.difficulty)}
                          {duration ? (
                            <span className="sim-card-duration"> · {duration}</span>
                          ) : null}
                        </span>
                      </div>
                      <h2 className="sim-card-title">{item.simulation.title}</h2>
                      <p className="sim-card-description">{item.simulation.description}</p>
                      {item.skills_to_improve.length > 0 ? (
                        <div className="recos-improve">
                          <span className="recos-improve-label">Refuerza</span>
                          <span className="recos-improve-skills">
                            {item.skills_to_improve.join(', ')}
                          </span>
                        </div>
                      ) : null}
                      <ul className="sim-card-skills" aria-label="Habilidades">
                        {skills.map((skill) => (
                          <li key={skill.id} className="chip chip-sm" data-type={skill.type}>
                            {skill.typeLabel} · {skill.name} {skill.percent}%
                          </li>
                        ))}
                      </ul>
                      <span className="reco-card-action recos-action">Ver simulación ▶</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
        <div className="recos-note">
          <Sparkle color="var(--color-stone)" size={28} />
          <p>Cuando subas de nivel, la lista cambia sola.</p>
        </div>
      </div>
    </div>
  );
}
