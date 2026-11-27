'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { FeedbackBadge } from '../../../../components/Badges';
import { STEP_TYPES } from '../../../../components/play/StepContext';
import { Sparkle } from '../../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { getSharedEvidence, isApiError } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';

const formatScore = (n: number) => String(Math.round(n * 10) / 10);
const two = (n: number) => String(n).padStart(2, '0');

function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <span className="public-brand">
          <span className="public-logo">
            <Image src="/logo.svg" alt="" width={28} height={28} unoptimized />
          </span>
          <span className="public-brand-name">QATO&apos;K</span>
        </span>
        <span className="public-tag">Evidencia compartida</span>
      </div>
    </header>
  );
}

/** PublicaV2 · Evidencia pública: sin sesión; 404 y 410 con su propio estado. */
export function PublicEvidenceView({ token }: { token: string }) {
  const shared = useQuery({
    queryKey: ['public-evidence', token],
    queryFn: ({ signal }) => getSharedEvidence(token, signal),
    retry: false,
  });

  if (shared.isError) {
    const expired = isApiError(shared.error, 'SHARE_LINK_EXPIRED');
    const invalid = isApiError(shared.error, 'INVALID_SHARE_LINK', 'NOT_FOUND', 'VALIDATION_ERROR');
    return (
      <div className="public">
        <PublicHeader />
        {expired ? (
          <StateCard
            kind="expired"
            title="Este enlace venció"
            message="Pídele a quien te lo compartió uno nuevo."
          />
        ) : invalid ? (
          <StateCard
            kind="not-found"
            title="Este enlace ya no es válido"
            message="Puede que lo hayan revocado o que esté mal copiado. Pídele a quien te lo compartió uno nuevo."
          />
        ) : (
          <StateCard
            kind="error"
            title="No pudimos cargar esta evidencia"
            message="Intenta de nuevo en unos segundos."
            action={{ label: 'Reintentar', onClick: () => void shared.refetch() }}
          />
        )}
      </div>
    );
  }
  if (!shared.data) {
    return (
      <div className="public">
        <PublicHeader />
        <LoadingCard />
      </div>
    );
  }

  const data = shared.data;
  return (
    <div className="public">
      <PublicHeader />
      <section className="public-hero">
        <Sparkle color="var(--color-stone)" size={33} className="public-sparkle" />
        <div className="public-hero-inner">
          <span className="public-trophy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sprites/trophy.svg" alt="" width={80} height={80} />
          </span>
          <div className="public-hero-text">
            <span className="public-owner">
              {data.owner.name} · {formatDate(data.generated_at)}
            </span>
            <h1 className="public-title">{data.title}</h1>
            <span className="public-simulation">Simulación: {data.content.simulation.title}</span>
          </div>
        </div>
      </section>
      <main className="public-main">
        <div className="public-content">
          <section className="public-section" aria-labelledby="resumen">
            <h2 id="resumen" className="public-heading">
              Resumen
            </h2>
            <p className="public-summary">{data.content.description}</p>
          </section>
          <section className="public-section" aria-labelledby="decisiones">
            <h2 id="decisiones" className="public-heading">
              Decisiones
            </h2>
            <ol className="public-decisions">
              {data.content.decisions.map((decision) => (
                <li key={decision.sequence} className="public-decision panel">
                  <div className="public-decision-head">
                    <span className="public-decision-step">
                      <span className="public-decision-num">{two(decision.sequence)}</span>
                      <span>
                        {STEP_TYPES[decision.step.type].label} · {decision.step.title}
                      </span>
                    </span>
                    <FeedbackBadge result={decision.feedback_type} />
                  </div>
                  <p className="public-decision-option">{decision.option}</p>
                  {decision.consequences.map((consequence, index) => (
                    <p key={index} className="public-decision-consequence">
                      → {consequence}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="public-side">
          <div className="public-score panel">
            <span className="public-heading">Puntuación</span>
            <span>
              <span className="public-score-value">{formatScore(data.content.score)}</span>
              <span className="public-heading"> / 100</span>
            </span>
          </div>
          <div className="public-skills panel">
            <span className="public-heading">Habilidades practicadas</span>
            <ul>
              {data.content.skills.map((skill) => (
                <li key={skill.name}>{skill.name}</li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
      <footer className="public-footer">
        <p>
          Instantánea guardada al terminar la simulación. {data.owner.name} compartió este enlace y
          puede revocarlo en cualquier momento.
        </p>
      </footer>
    </div>
  );
}
