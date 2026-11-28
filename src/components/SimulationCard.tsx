import type { SimulationSummary } from '@qatok/shared';
import Link from 'next/link';
import { difficultyText, durationText, typedSkills, type TypedSkill } from '../lib/simulation';

/** Franja superior dividida por pesos (01 · TypeStripe). Decorativa: los chips dicen lo mismo. */
export function TypeStripe({ skills }: { skills: TypedSkill[] }) {
  return (
    <div className="type-stripe" aria-hidden="true">
      {skills.map((skill) => (
        <span key={skill.id} data-type={skill.type} style={{ flexGrow: skill.weight }} />
      ))}
    </div>
  );
}

/** Tarjeta del catálogo: franja, dificultad, duración, título, descripción y habilidades. */
export function SimulationCard({
  simulation,
  href,
}: {
  simulation: SimulationSummary;
  href: string;
}) {
  const skills = typedSkills(simulation.skills);
  const duration = durationText(simulation.estimated_duration);
  return (
    <Link href={href} className="sim-card panel" data-type={skills[0]?.type ?? 'STONE'}>
      <TypeStripe skills={skills} />
      <div className="sim-card-body">
        <div className="sim-card-meta">
          <span>{difficultyText(simulation.difficulty)}</span>
          {duration ? <span className="sim-card-duration">{duration}</span> : null}
        </div>
        <h2 className="sim-card-title">{simulation.title}</h2>
        <p className="sim-card-description">{simulation.description}</p>
        <ul className="sim-card-skills" aria-label="Habilidades">
          {skills.map((skill) => (
            <li key={skill.id} className="chip chip-sm" data-type={skill.type}>
              {skill.typeLabel} · {skill.name} {skill.percent}%
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
