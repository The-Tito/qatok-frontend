interface SyncBannerProps {
  /** Texto bajo la barra. */
  message?: string;
  /** true cuando se agotaron los reintentos: deja de «cargar» y avisa que tardará. */
  slow?: boolean;
}

/**
 * Aviso de sincronización con el grafo (graph = PENDING o pending_sync_count > 0).
 * PENDING no es un error: lo guardado ya está a salvo.
 */
export function SyncBanner({
  message = 'Lo guardado está a salvo; tu perfil se actualiza en segundos.',
  slow = false,
}: SyncBannerProps) {
  return (
    <div className="sync-banner" role="status" data-sync={slow ? 'slow' : 'pending'}>
      <span className="sync-banner-title">
        {slow ? 'Tu progreso se actualizará en unos minutos' : 'Actualizando tu progreso…'}
      </span>
      {slow ? null : <div className="stripe-bar" data-tone="white" />}
      <span className="sync-banner-message">{message}</span>
    </div>
  );
}
