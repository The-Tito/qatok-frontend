// Formatos para mostrar datos de la API (fechas ISO-8601 en UTC → hora local, en español).

const dateFormat = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** «1 sep 2026». Sin punto en el mes abreviado, como en el diseño. */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso)).replace(/\./g, '');
}

/** «1 partida», «4 partidas». */
export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
