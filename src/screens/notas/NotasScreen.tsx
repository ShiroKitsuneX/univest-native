import { useMemo, useState } from 'react'
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { useCardStyle, useLabelStyle } from '@/theme/styles'
import { TAG_D, TAG_L } from '@/theme/palette'
import { NOTAS_CORTE } from '@/data/notasCorte'
import { ENEM_SUBJECTS, subjectScore } from '@/data/subjects'
import { SBox } from '@/components/SBox'
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import {
  Button,
  Card,
  EmptyState,
  HeroGreeting,
  MiniBarChart,
  Pill,
  StatCard,
  StreakBadge,
  type BarPoint,
} from '@/shared/components'

export function NotasScreen({ onEditCourses, onAddGrade }) {
  const { T, isDark, brand, domain, radius, typography, shadow } = useTheme()
  const alertTag = isDark ? TAG_D.alert : TAG_L.alert
  const alert = { fg: alertTag.tx, bg: alertTag.bg, b: alertTag.b }

  const nome = useProfileStore(s => s.nome)
  const c1 = useOnboardingStore(s => s.c1)
  const c2 = useOnboardingStore(s => s.c2)
  const gs = useProfileStore(s => s.gs)
  const setGs = useProfileStore(s => s.setGs)

  const [nSrch, setNsrch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'all' | 'prova' | 'simulado'>(
    'all'
  )

  const last = gs[gs.length - 1]
  const prev = gs[gs.length - 2]
  const avg = (g: { s: { l: number; h: number; n: number; m: number } }) =>
    Math.round((g.s.l + g.s.h + g.s.n + g.s.m) / 4)

  const lastAvg = last ? avg(last) : null
  const prevAvg = prev ? avg(prev) : null
  const delta = lastAvg !== null && prevAvg !== null ? lastAvg - prevAvg : null

  const tgt = useMemo(
    () =>
      NOTAS_CORTE.filter(n => n.curso === c1).reduce(
        (a, b) => Math.max(a, b.nota),
        70
      ),
    [c1]
  )

  const radar = useMemo(
    () =>
      last
        ? ENEM_SUBJECTS.map(sub => ({
            subject: sub.short,
            v: subjectScore(last.s, sub.k),
          }))
        : [],
    [last]
  )
  const weak = radar.length ? radar.reduce((a, b) => (a.v < b.v ? a : b)) : null

  // Last up-to-7 grades — values are the averages, plotted as a violet bar
  // chart. The most recent bar is highlighted with a "Hoje" / value tag.
  const chartData: BarPoint[] = useMemo(() => {
    const slice = gs.slice(-7)
    const lastIdx = slice.length - 1
    return slice.map((g, i) => {
      const v = avg(g)
      return {
        label:
          g.ex.length > 4
            ? g.ex
                .replace(/[^A-Za-zÀ-ÿ0-9]/g, '')
                .slice(0, 3)
                .toUpperCase()
            : g.ex,
        value: v,
        highlighted: i === lastIdx,
        caption: i === lastIdx ? `${v} pts` : undefined,
      }
    })
  }, [gs])

  const filtN = useMemo(() => {
    const uCourses = [c1, c2].filter(Boolean)
    return NOTAS_CORTE.filter(n => {
      if (nSrch)
        return (
          n.curso.toLowerCase().includes(nSrch.toLowerCase()) ||
          n.uni.toLowerCase().includes(nSrch.toLowerCase())
        )
      return uCourses.length === 0 || uCourses.some(c => c && n.curso === c)
    })
  }, [c1, c2, nSrch])

  const filteredGrades = useMemo(
    () => gs.filter(g => gradeFilter === 'all' || g.type === gradeFilter),
    [gs, gradeFilter]
  )

  const cd = useCardStyle()
  const lbl = useLabelStyle()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero greeting — display typography, breathing room. */}
      <HeroGreeting
        name={nome || 'aluno'}
        subtitle="Acompanhe sua evolução"
      />

      {/* Course chips inline under hero — slim, scannable. */}
      <View style={styles.courseRow}>
        {c1 ? (
          <Pill active onPress={onEditCourses} size="sm">
            {`1ª ${c1}`}
          </Pill>
        ) : (
          <Pill onPress={onEditCourses} size="sm">
            Definir curso
          </Pill>
        )}
        {c2 ? (
          <Pill onPress={onEditCourses} size="sm">
            {`2ª ${c2}`}
          </Pill>
        ) : null}
        <TouchableOpacity onPress={onEditCourses} style={styles.editChip}>
          <Text style={{ color: T.muted, fontSize: 12 }}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Hero stat card — current average, delta, target. The visual anchor of
          the screen, matching the inspiration's "Daily Goal" treatment. */}
      <Card
        tone="highlight"
        padding={20}
        style={[
          {
            marginTop: 20,
            backgroundColor: brand.primary,
            borderColor: brand.primary,
          },
          shadow.primary,
        ]}
      >
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>Sua média atual</Text>
            <Text style={styles.heroValue}>
              {lastAvg !== null ? lastAvg : '—'}
            </Text>
            <View style={styles.heroDeltaRow}>
              {delta !== null && (
                <Text style={styles.heroDelta}>
                  {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} pts vs anterior
                </Text>
              )}
              {delta === null && (
                <Text style={styles.heroDelta}>
                  Adicione provas para acompanhar
                </Text>
              )}
            </View>
          </View>
          <View style={styles.heroRing}>
            <Text style={styles.heroRingValue}>
              {lastAvg !== null && tgt
                ? Math.min(100, Math.round((lastAvg / tgt) * 100))
                : 0}
              %
            </Text>
            <Text style={styles.heroRingLabel}>da meta</Text>
          </View>
        </View>
      </Card>

      {/* Stat grid — 2 columns matching inspiration's "Total Task / Completed"
          row. Domain accents key the icon tile colours. */}
      <View style={styles.statGrid}>
        <StatCard
          tone="simulado"
          icon={<Text style={{ fontSize: 18 }}>📋</Text>}
          value={gs.length}
          label="Simulados feitos"
        />
        <StatCard
          tone="goal"
          icon={<Text style={{ fontSize: 18 }}>🎯</Text>}
          value={tgt}
          label={`Meta · ${c1 || 'curso'}`}
        />
      </View>

      <View style={styles.statGrid}>
        <StatCard
          tone="progress"
          icon={<Text style={{ fontSize: 18 }}>📈</Text>}
          value={lastAvg ?? '—'}
          label="Última nota"
        />
        <StatCard
          tone="news"
          icon={<Text style={{ fontSize: 18 }}>🏆</Text>}
          value={
            gs.length > 0
              ? Math.max(...gs.map(g => avg(g)))
              : '—'
          }
          label="Melhor nota"
        />
      </View>

      {gs.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <StreakBadge days={gs.length} label="provas registradas" />
        </View>
      )}

      {/* Evolution chart card — replaces the chart-kit BarChart with the
          custom MiniBarChart for a cleaner look and consistent radius. */}
      {chartData.length > 0 && (
        <Card padding={18} style={{ marginTop: 20 }}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.eyebrow, { color: T.muted }]}>
                EVOLUÇÃO
              </Text>
              <Text
                style={[
                  typography.headline,
                  { color: T.text, marginTop: 2 },
                ]}
              >
                Últimas {chartData.length} provas
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <MiniBarChart data={chartData} height={150} max={1000} />
          </View>
        </Card>
      )}

      {weak && (
        <Card
          padding={14}
          style={{
            marginTop: 16,
            backgroundColor: alert.bg,
            borderColor: alert.fg + '55',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: alert.fg + '33',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>⚠️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[typography.eyebrow, { color: alert.fg, marginBottom: 2 }]}
            >
              Área para melhorar
            </Text>
            <Text
              style={{ color: alert.fg, fontSize: 14, fontWeight: '800' }}
            >
              {weak.subject}
            </Text>
            <Text style={{ color: alert.fg, fontSize: 11, opacity: 0.8 }}>
              {weak.v} pts na última prova
            </Text>
          </View>
          <View
            style={{
              backgroundColor: alert.fg + '22',
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: alert.fg, fontSize: 13, fontWeight: '800' }}>
              {weak.v}
            </Text>
          </View>
        </Card>
      )}

      {/* Per-subject vs target — kept as horizontal bars (existing pattern). */}
      {last && c1 && (
        <Card padding={16} style={{ marginTop: 16 }}>
          <Text style={[typography.eyebrow, { color: T.muted }]}>
            VOCÊ VS META
          </Text>
          <Text
            style={[typography.headline, { color: T.text, marginTop: 2, marginBottom: 14 }]}
          >
            {c1}
          </Text>
          <View style={{ gap: 14 }}>
            {ENEM_SUBJECTS.map(sub => {
              const v = subjectScore(last.s, sub.k)
              const pct = Math.min(100, Math.round((v / tgt) * 100))
              const isAbove = v >= tgt
              return (
                <View key={sub.k}>
                  <View style={styles.subjectRow}>
                    <Text
                      style={{ color: T.text, fontSize: 12, fontWeight: '600' }}
                    >
                      {sub.long}
                    </Text>
                    <Text
                      style={{
                        color: isAbove ? domain.news.fg : T.sub,
                        fontSize: 12,
                        fontWeight: '800',
                      }}
                    >
                      {v} <Text style={{ color: T.muted, fontWeight: '500' }}>· {pct}%</Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: T.card2,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, v / 10)}%` as const,
                        height: '100%',
                        backgroundColor: brand.primary,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        </Card>
      )}

      {/* Notas de corte */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={[typography.eyebrow, { color: T.muted }]}>
            NOTAS DE CORTE
          </Text>
          <Text style={[typography.headline, { color: T.text, marginTop: 2 }]}>
            Cursos & universidades
          </Text>
        </View>
      </View>

      <SBox
        val={nSrch}
        set={setNsrch}
        ph="Buscar outro curso ou universidade…"
        T={T}
      />

      <View style={{ gap: 10, marginBottom: 24, marginTop: 12 }}>
        {filtN.map((n, i) => {
          const diff = lastAvg !== null ? lastAvg - n.nota : null
          const diffColor =
            diff === null
              ? T.muted
              : diff >= 0
                ? domain.news.fg
                : alert.fg
          return (
            <Card
              key={i}
              padding={0}
              radius={radius.md}
              style={{
                overflow: 'hidden',
                borderLeftWidth: 4,
                borderLeftColor: n.cor,
              }}
            >
              <View style={{ padding: 14 }}>
                <View style={styles.cutoffHeaderRow}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: n.cor + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: n.cor + '44',
                    }}
                  >
                    <Text
                      style={{ color: n.cor, fontSize: 10, fontWeight: '800' }}
                    >
                      {n.uni.split(' ')[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 13, fontWeight: '800' }}>
                      {n.curso}
                    </Text>
                    <Text style={{ color: T.sub, fontSize: 11 }}>
                      {n.uni} · {n.vagas} vagas
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={{ color: T.text, fontSize: 22, fontWeight: '900', letterSpacing: -1 }}>
                      {n.nota}
                    </Text>
                    {diff !== null && (
                      <Text
                        style={{
                          color: diffColor,
                          fontSize: 10,
                          fontWeight: '800',
                        }}
                      >
                        {diff >= 0 ? '+' : ''}{diff.toFixed(0)} pts
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(n.site)}
                  style={{ marginTop: 10, alignSelf: 'flex-start' }}
                >
                  <Text style={{ color: brand.primary, fontSize: 11, fontWeight: '700' }}>
                    Site oficial ↗
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )
        })}
        {filtN.length === 0 && (
          <Text
            style={{
              color: T.muted,
              textAlign: 'center',
              padding: 20,
              fontSize: 13,
            }}
          >
            Nenhum resultado.
          </Text>
        )}
      </View>

      {/* Minhas notas */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={[typography.eyebrow, { color: T.muted }]}>
            MINHAS NOTAS
          </Text>
          <Text style={[typography.headline, { color: T.text, marginTop: 2 }]}>
            Histórico de provas
          </Text>
        </View>
        <Button onPress={onAddGrade} variant="primary" size="sm">
          + Adicionar
        </Button>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 12 }}>
        {([
          ['all', 'Todas'],
          ['prova', 'Provas'],
          ['simulado', 'Simulados'],
        ] as const).map(([v, l]) => (
          <Pill
            key={v}
            active={gradeFilter === v}
            onPress={() => setGradeFilter(v)}
            size="sm"
          >
            {l}
          </Pill>
        ))}
      </View>

      {filteredGrades.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Nenhuma nota ainda"
          description="Adicione notas de simulados para ver gráficos e análises."
          action={
            <Button onPress={onAddGrade} variant="primary" size="md">
              Adicionar primeira nota
            </Button>
          }
        />
      ) : (
        <Card padding={14}>
          {filteredGrades.map((g, i, arr) => (
            <View
              key={g.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderColor: T.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.sm,
                  backgroundColor: g.type === 'simulado' ? T.acBg : T.card2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {g.type === 'simulado' ? '📋' : '📝'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontSize: 13, fontWeight: '700' }}>
                  {g.ex}
                </Text>
                <Text style={{ color: T.muted, fontSize: 10 }}>
                  {g.dt} · L{g.s.l} H{g.s.h} N{g.s.n} M{g.s.m} R{g.s.r}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 6 }}>
                <Text style={{ color: brand.primary, fontSize: 18, fontWeight: '800' }}>
                  {avg(g)}
                </Text>
                <Text style={{ color: T.muted, fontSize: 9 }}>média</Text>
              </View>
              <TouchableOpacity onPress={() => setGs(gs.filter(x => x.id !== g.id))}>
                <Text style={{ color: T.muted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  courseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  editChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  heroDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  heroDelta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroRingLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 28,
    marginBottom: 12,
  },
  cutoffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})
