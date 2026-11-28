'use client';

import { useState, type ReactNode } from 'react';
import {
  Chip,
  ClassificationBadge,
  FeedbackBadge,
  ImpactBadge,
  TypeChip,
} from '../../../components/Badges';
import { LevelBar } from '../../../components/LevelBar';
import { PixelButton } from '../../../components/PixelButton';
import { Sheet } from '../../../components/Sheet';
import { LoadingCard, StateCard } from '../../../components/StateCard';
import { SyncBanner } from '../../../components/SyncBanner';
import { StepContext } from '../../../components/play/StepContext';
import '../../(juego)/play/[attemptId]/play.css';
import { SKILL_TYPES, type SkillTypeKey } from '../../../lib/skill-types';
import './gallery.css';

const TYPES = Object.keys(SKILL_TYPES) as SkillTypeKey[];

// Muestras de la página de diseño (no son datos de la app: las pantallas leen la API).
const SAMPLE_SKILL = 'Gestión del tiempo';

// Pasos de muestra para ver los contextos que el dataset no trae (INCIDENT) o trae poco.
const SAMPLE_OPTIONS = [{ id: 'e0000000-0000-4000-8000-0000000009a1', description: 'Opción' }];
const SAMPLE_MEETING = {
  id: 'e0000000-0000-4000-8000-0000000009b1',
  order: 3,
  title: 'Reunión con tu jefa',
  description: 'Tu jefa quiere saber qué pasó y qué propones.',
  type: 'MEETING' as const,
  options: SAMPLE_OPTIONS,
  context: {
    participants: ['Tú', 'Laura Méndez (jefa de área)'],
    agenda: ['Qué pasó con el pedido', 'Qué propones para resolverlo'],
  },
};
const SAMPLE_INCIDENT = {
  id: 'e0000000-0000-4000-8000-0000000009b2',
  order: 2,
  title: '[Título del paso]',
  description: '[Descripción del paso]',
  type: 'INCIDENT' as const,
  options: SAMPLE_OPTIONS,
  context: {
    severity: 'HIGH' as const,
    timeline: [
      { time: '09:10', event: '[Evento 1]' },
      { time: '09:25', event: '[Evento 2]' },
      { time: '09:40', event: '[Evento 3]' },
    ],
  },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="gallery-section">
      <h2 className="gallery-heading">{title}</h2>
      {children}
    </section>
  );
}

export function ComponentGallery() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [type, setType] = useState<SkillTypeKey>('VOICE');

  return (
    <main className="gallery" data-type={type}>
      <header className="gallery-header">
        <h1 className="gallery-title">Componentes</h1>
        <p className="gallery-note">
          Muestra de cada variante a 390, 768 y 1280 px. Solo en desarrollo.
        </p>
        <label className="gallery-type">
          Tipo activo{' '}
          <select value={type} onChange={(event) => setType(event.target.value as SkillTypeKey)}>
            {TYPES.map((key) => (
              <option key={key} value={key}>
                {SKILL_TYPES[key].label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <Section title="01 · Tipos de habilidad">
        <div className="gallery-types">
          {TYPES.map((key) => (
            <div key={key} className="gallery-type-card panel" data-type={key}>
              <div className="gallery-type-base">
                <span className="gallery-type-name">{SKILL_TYPES[key].label}</span>
              </div>
              <div className="gallery-type-tint">
                <TypeChip type={key} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="02 · Botones">
        <div className="gallery-stack">
          <PixelButton size="lg" block>
            Comenzar ▶
          </PixelButton>
          <PixelButton variant="type" size="lg" block>
            Del tipo · {SKILL_TYPES[type].label}
          </PixelButton>
          <PixelButton variant="secondary" block>
            Secundario
          </PixelButton>
          <PixelButton block disabled>
            Deshabilitado
          </PixelButton>
          <PixelButton variant="danger" block>
            Abandonar partida
          </PixelButton>
          <PixelButton variant="secondary" href="/">
            Enlace con aspecto de botón
          </PixelButton>
        </div>
      </Section>

      <Section title="03 · Chips y etiquetas">
        <div className="gallery-row">
          <TypeChip type={type} label={SAMPLE_SKILL} weight={0.6} />
          <TypeChip type={type} />
          <Chip>Todas</Chip>
          <Chip selected>Básica</Chip>
        </div>
        <div className="gallery-row">
          <FeedbackBadge result="CORRECT" />
          <FeedbackBadge result="PARTIAL" />
          <FeedbackBadge result="INCORRECT" />
        </div>
        <div className="gallery-row">
          <ImpactBadge impact="POSITIVE" />
          <ImpactBadge impact="NEUTRAL" />
          <ImpactBadge impact="NEGATIVE" />
          <ClassificationBadge classification="STRENGTH" />
          <ClassificationBadge classification="AREA_FOR_IMPROVEMENT" />
        </div>
      </Section>

      <Section title="04 · Barra de nivel">
        <div className="gallery-stack">
          <LevelBar label={SAMPLE_SKILL} value={40} target={60} type={type} />
          <LevelBar label="Sin objetivo" value={92.5} type="FIRE" />
          <LevelBar label="Objetivo cumplido" value={75} target={75} type="VOICE" />
        </div>
      </Section>

      <Section title="05 · Sincronización">
        <div className="gallery-stack">
          <SyncBanner message="Tu intento ya está guardado." />
          <SyncBanner slow />
        </div>
      </Section>

      <Section title="06 · Estados">
        <div className="gallery-states">
          <LoadingCard />
          <StateCard
            kind="empty"
            title="Nada por aquí"
            message="Ninguna simulación coincide con tu búsqueda."
            action={{ label: 'Quitar filtros', onClick: () => undefined }}
          />
          <StateCard
            kind="error"
            title="No pudimos cargar esta pantalla"
            message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
            action={{ label: 'Reintentar', onClick: () => undefined }}
          />
          <StateCard
            kind="forbidden"
            title="Esta zona es para administración"
            message="Tu cuenta no tiene permiso para ver esta página."
            action={{ label: 'Ir a mi inicio', href: '/' }}
          />
          <StateCard
            kind="expired"
            title="Tu sesión terminó"
            message="Entra de nuevo para seguir donde te quedaste."
            action={{ label: 'Entrar', href: '/login' }}
          />
          <StateCard
            kind="not-found"
            title="Este enlace ya no es válido"
            message="Pídele a quien te lo compartió uno nuevo."
          />
        </div>
      </Section>

      <Section title="07 · Contextos del paso">
        <div className="gallery-stack">
          <StepContext step={SAMPLE_MEETING} />
          <StepContext step={SAMPLE_INCIDENT} />
          <StepContext
            step={{
              ...SAMPLE_INCIDENT,
              context: { ...SAMPLE_INCIDENT.context, severity: 'MEDIUM' },
            }}
          />
        </div>
      </Section>

      <Section title="08 · Hoja y diálogo">
        <PixelButton variant="secondary" onClick={() => setSheetOpen(true)}>
          Abrir hoja
        </PixelButton>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Pausa">
          <p className="gallery-note">
            Hoja inferior en móvil y diálogo centrado de 520 px desde 1024 px. Escape o el fondo
            cierran.
          </p>
          <PixelButton variant="type" size="lg" block onClick={() => setSheetOpen(false)}>
            Seguir jugando ▶
          </PixelButton>
          <PixelButton variant="secondary" block onClick={() => setSheetOpen(false)}>
            Salir y continuar después
          </PixelButton>
        </Sheet>
      </Section>
    </main>
  );
}
