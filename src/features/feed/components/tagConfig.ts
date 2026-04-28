export const TAG_ICONS: Record<string, string> = {
  inscricoes: 'reader',
  inscrições: 'reader',
  Inscrições: 'reader',
  inscrição: 'reader',
  Inscrição: 'reader',
  lista: 'bookmark',
  Lista: 'bookmark',
  'lista de obras': 'bookmark',
  'Lista de Obras': 'bookmark',
  notas: 'statsChart',
  Notas: 'statsChart',
  'notas de corte': 'statsChart',
  'Notas de Cortesia': 'statsChart',
  'Notas de Corte': 'statsChart',
  simulado: 'create',
  Simulado: 'create',
  noticia: 'create',
  notícia: 'create',
  Notícia: 'create',
  news: 'create',
  alert: 'flag',
  Alerta: 'flag',
  resultado: 'statsChart',
  Resultado: 'statsChart',
}

export function getTagIcon(tag: string): string | undefined {
  if (!tag) return undefined
  const key = tag.toLowerCase().trim() as string
  return TAG_ICONS[key] as string | undefined
}
