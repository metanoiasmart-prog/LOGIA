export function getCurrentLodgeYear(): number {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return currentMonth >= 7 ? currentYear : currentYear - 1;
}

export function getLodgeYearFromDate(date: Date): number {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return month >= 7 ? year : year - 1;
}

export function getLodgeMonthFromCalendarMonth(month: number): number {
  if (month >= 7) {
    return month - 6;
  }
  return month + 6;
}

export function getCalendarMonthFromLodgeMonth(lodgeMonth: number): number {
  if (lodgeMonth <= 6) {
    return lodgeMonth + 6;
  }
  return lodgeMonth - 6;
}

export function getLodgeYearRange(lodgeYear: number): { start: Date; end: Date } {
  return {
    start: new Date(lodgeYear, 6, 1),
    end: new Date(lodgeYear + 1, 5, 30),
  };
}

export function formatLodgeYear(lodgeYear: number): string {
  return `Julio ${lodgeYear} - Junio ${lodgeYear + 1}`;
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const RITE_NAMES = {
  escoces_antiguo: 'Rito Escocés Antiguo y Aceptado',
  antiguo_gremio: 'Antiguo Gremio',
  emulacion: 'Emulación',
  york: 'York',
  memphis: 'Memphis',
};

export const RITE_COLORS = {
  escoces_antiguo: 'red',
  antiguo_gremio: 'navy',
  emulacion: 'navy',
  york: 'navy',
  memphis: 'sky',
};

export const STATUS_NAMES = {
  activo: 'Activo',
  cese: 'Cese',
  quite: 'Quite',
  licencia: 'Licencia',
  irradiacion: 'Irradiación',
  expulsion: 'Expulsión',
  ad_vitam: 'Ad Vitam',
};

export const EXPENSE_CATEGORIES = {
  alimentacion: 'Alimentación',
  alquiler: 'Alquiler',
  servicios_basicos: 'Servicios Básicos',
  articulos_activos: 'Artículos Activos Logia',
  membresia: 'Membresía',
  otros: 'Otros',
  filantropia: 'Gastos por Filantropía',
  eventos: 'Eventos',
};
