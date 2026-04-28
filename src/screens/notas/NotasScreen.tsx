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
// import { AdmissionCalcModal } from '@/screens/notas/AdmissionCalcModal'
import type { Grade } from '@/stores/profileStore'

type TypeFilter = 'all' | 'prova' | 'simulado'
type PeriodFilter = 'month' | 'year' | 'all'
type SubjectKey = 'all' | 'l' | 'h' | 'n' | 'm' | 'r'

// Parse `Grade.dt` strings — they come in either `DD/MM/YYYY` or
// `YYYY-MM-DD` shape depending on input source. Returns 0 if unparseable
// so out-of-range entries are filtered out by the period guards.
function gradeTimestamp(dt: string | undefined): number {
  if (!dt) return 0
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) {
    const t = Date.parse(dt)
    return Number.isNaN(t) ? 0 : t
  }
  const m = dt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return 0
  const [, dd, mm, yyyy] = m
  return Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd))
}

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
  const [gradeFilter, setGradeFilter] = useState<TypeFilter>('all')
  // Dashboard-side filters: type drives stat-grid + chart + weak subject;
  // period slices the chart window; subject narrows the chart to a single
  // subject series. Three filters keep the dashboard scannable without
  // collapsing into a single mega-control.
  const [dashType, setDashType] = useState<TypeFilter>('all')
  const [chartPeriod, setChartPeriod] = useState<PeriodFilter>('all')
  const [chartSubject, setChartSubject] = useState<SubjectKey>('all')

  // Admission calculator modal — opens from per-subject section or any
  // notas-de-corte card. `calcTarget` carries the pre-filled cut-off + uni
  // label; null means modal closed.
  const [calcTarget, setCalcTarget] = useState<{
    uni: string
    curso: string
    cutoff: number
  } | null>(null)

  const avg = (g: { s: { l: number; h: number; n: number; m: number } }) =>
    Math.round((g.s.l + g.s.h + g.s.n + g.s.m) / 4)

  // Counts per type — driven by the unfiltered store so the tab labels
  // always show the truthful totals regardless of which dashboard filter
  // is active.
  const totalProvas = gs.filter(g => g.type === 'prova').length
  const totalSimulados = gs.filter(g => g.type === 'simulado').length

  // Grades after the dashboard type filter — drives stats + weak + chart.
  const dashGrades = useMemo(() => {
    if (dashType === 'all') return gs
    return gs.filter(g => g.type === dashType)
  }, [gs, dashType])

  const last = dashGrades[dashGrades.length - 1]
  const prev = dashGrades[dashGrades.length - 2]
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

  // Period-sliced grades for the chart. "month" = last 30 days, "year" =
  // last 365 days, "all" = everything.
  const chartGrades = useMemo(() => {
    if (chartPeriod === 'all') return dashGrades
    const cutoff =
      Date.now() - (chartPeriod === 'month' ? 30 : 365) * 86_400_000
    return dashGrades.filter(g => gradeTimestamp(g.dt) >= cutoff)
  }, [dashGrades, chartPeriod])

  // Last 7 entries within the period window. If chartSubject is set to a
  // specific key, plot that subject's score; otherwise plot the average.
  const chartData: BarPoint[] = useMemo(() => {
    const slice = chartGrades.slice(-7)
    const lastIdx = slice.length - 1
    return slice.map((g, i) => {
      const v =
        chartSubject === 'all' ? avg(g) : subjectScore(g.s, chartSubject)
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
  }, [chartGrades, chartSubject])

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

  // Pre-fill the calculator with the user's last grade (any type) so the
  // modal opens to a useful starting point. The modal handles the no-grade
  // case internally.
  const lastAnyGrade: Grade | undefined = gs[gs.length - 1]

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <HeroGreeting name={nome || 'aluno'} subtitle="Acompanhe sua evolução" />

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

      {/* Type tabs — drive the stat grid, chart, and weak-subject card.
          Counts inline so the user always sees the totals at a glance. */}
      <Text
        style={[
          typography.eyebrow,
          { color: T.muted, marginTop: 24, marginBottom: 10 },
        ]}
      >
        TIPO DE PROVA
      </Text>
      <View style={styles.tabRow}>
        <Pill
          size="sm"
          active={dashType === 'all'}
          onPress={() => setDashType('all')}
        >
          {`Todas · ${gs.length}`}
        </Pill>
        <Pill
          size="sm"
          active={dashType === 'prova'}
          onPress={() => setDashType('prova')}
        >
          {`📋 Provas · ${totalProvas}`}
        </Pill>
        <Pill
          size="sm"
          active={dashType === 'simulado'}
          onPress={() => setDashType('simulado')}
        >
          {`🎯 Simulados · ${totalSimulados}`}
        </Pill>
      </View>

      <View style={[styles.statGrid, { marginTop: 12 }]}>
        <StatCard
          tone="simulado"
          icon={<Text style={{ fontSize: 18 }}>📋</Text>}
          value={dashGrades.length}
          label={
            dashType === 'prova'
              ? 'Provas feitas'
              : dashType === 'simulado'
                ? 'Simulados feitos'
                : 'Provas registradas'
          }
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
            dashGrades.length > 0
              ? Math.max(...dashGrades.map(g => avg(g)))
              : '—'
          }
          label="Melhor nota"
        />
      </View>

      {dashGrades.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <StreakBadge
            days={dashGrades.length}
            label={
              dashType === 'prova'
                ? 'provas registradas'
                : dashType === 'simulado'
                  ? 'simulados registrados'
                  : 'provas registradas'
            }
          />
        </View>
      )}

      {/* Evolution chart — period tabs + subject chips */}
      {dashGrades.length > 0 && (
        <Card padding={18} style={{ marginTop: 20 }}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.eyebrow, { color: T.muted }]}>
                EVOLUÇÃO
              </Text>
              <Text
                style={[typography.headline, { color: T.text, marginTop: 2 }]}
              >
                {chartSubject === 'all'
                  ? 'Média por entrada'
                  : `${ENEM_SUBJECTS.find(s => s.k === chartSubject)?.long || ''}`}
              </Text>
            </View>
          </View>

          <View style={[styles.tabRow, { marginTop: 12 }]}>
            <Pill
              size="sm"
              active={chartPeriod === 'month'}
              onPress={() => setChartPeriod('month')}
            >
              Mês
            </Pill>
            <Pill
              size="sm"
              active={chartPeriod === 'year'}
              onPress={() => setChartPeriod('year')}
            >
              Ano
            </Pill>
            <Pill
              size="sm"
              active={chartPeriod === 'all'}
              onPress={() => setChartPeriod('all')}
            >
              Tudo
            </Pill>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            style={{ marginTop: 8 }}
          >
            <Pill
              size="sm"
              active={chartSubject === 'all'}
              onPress={() => setChartSubject('all')}
            >
              Todas
            </Pill>
            {ENEM_SUBJECTS.filter(s => s.k !== 'r').map(s => (
              <Pill
                key={s.k}
                size="sm"
                active={chartSubject === s.k}
                onPress={() => setChartSubject(s.k as SubjectKey)}
              >
                {s.short}
              </Pill>
            ))}
          </ScrollView>

          <View style={{ marginTop: 16 }}>
            {chartData.length > 0 ? (
              <MiniBarChart data={chartData} height={150} max={1000} />
            ) : (
              <Text
                style={{
                  color: T.muted,
                  fontSize: 12,
                  textAlign: 'center',
                  paddingVertical: 32,
                }}
              >
                Sem dados para este período
              </Text>
            )}
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
            <Text style={{ color: alert.fg, fontSize: 14, fontWeight: '800' }}>
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

      {/* Per-subject vs target — kept as horizontal bars; gains a CTA at
          the bottom that opens the admission calculator pre-filled with
          the user's primary course (1ª opção). */}
      {last && c1 && (
        <Card padding={16} style={{ marginTop: 16 }}>
          <Text style={[typography.eyebrow, { color: T.muted }]}>
            VOCÊ VS META
          </Text>
          <Text
            style={[
              typography.headline,
              { color: T.text, marginTop: 2, marginBottom: 14 },
            ]}
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
                      {v}{' '}
                      <Text style={{ color: T.muted, fontWeight: '500' }}>
                        · {pct}%
                      </Text>
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
          <TouchableOpacity
            onPress={() => {
              const top = NOTAS_CORTE.filter(n => n.curso === c1).sort(
                (a, b) => b.nota - a.nota
              )[0]
              if (top) {
                setCalcTarget({
                  uni: top.uni,
                  curso: top.curso,
                  cutoff: top.nota,
                })
              }
            }}
            style={{ marginTop: 14 }}
          >
            <Text
              style={{
                color: brand.primary,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              🧮 Simular outra universidade →
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Percentile placeholder — surfaces the future feature without
          misleading users with fake numbers. Auto-hides if no grades. */}
      {dashGrades.length > 0 && (
        <Card
          padding={16}
          style={{
            marginTop: 16,
            backgroundColor: domain.progress.bg,
            borderColor: domain.progress.fg + '40',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: domain.progress.fg + '33',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22 }}>🏆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.eyebrow,
                  { color: domain.progress.fg, marginBottom: 2 },
                ]}
              >
                SUA POSIÇÃO
              </Text>
              <Text style={{ color: T.text, fontSize: 14, fontWeight: '700' }}>
                Em breve
              </Text>
              <Text style={{ color: T.sub, fontSize: 11, marginTop: 2 }}>
                Estamos coletando dados anônimos. Quando tivermos amostra
                suficiente, mostraremos sua posição em relação aos demais.
              </Text>
            </View>
          </View>
        </Card>
      )}

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
            diff === null ? T.muted : diff >= 0 ? domain.news.fg : alert.fg
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
                    <Text
                      style={{ color: T.text, fontSize: 13, fontWeight: '800' }}
                    >
                      {n.curso}
                    </Text>
                    <Text style={{ color: T.sub, fontSize: 11 }}>
                      {n.uni} · {n.vagas} vagas
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text
                      style={{
                        color: T.text,
                        fontSize: 22,
                        fontWeight: '900',
                        letterSpacing: -1,
                      }}
                    >
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
                        {diff >= 0 ? '+' : ''}
                        {diff.toFixed(0)} pts
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.cutoffActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setCalcTarget({
                        uni: n.uni,
                        curso: n.curso,
                        cutoff: n.nota,
                      })
                    }
                  >
                    <Text
                      style={{
                        color: brand.primary,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      🧮 Calcular
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL(n.site)}>
                    <Text
                      style={{ color: T.sub, fontSize: 11, fontWeight: '600' }}
                    >
                      Site oficial ↗
                    </Text>
                  </TouchableOpacity>
                </View>
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

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        {(
          [
            ['all', 'Todas'],
            ['prova', 'Provas'],
            ['simulado', 'Simulados'],
          ] as const
        ).map(([v, l]) => (
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
                <Text
                  style={{ color: T.text, fontSize: 13, fontWeight: '700' }}
                >
                  {g.ex}
                </Text>
                <Text style={{ color: T.muted, fontSize: 10 }}>
                  {g.dt} · L{g.s.l} H{g.s.h} N{g.s.n} M{g.s.m} R{g.s.r}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: 6 }}>
                <Text
                  style={{
                    color: brand.primary,
                    fontSize: 18,
                    fontWeight: '800',
                  }}
                >
                  {avg(g)}
                </Text>
                <Text style={{ color: T.muted, fontSize: 9 }}>média</Text>
              </View>
              <TouchableOpacity
                onPress={() => setGs(gs.filter(x => x.id !== g.id))}
              >
                <Text style={{ color: T.muted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}

      {/* <AdmissionCalcModal
        visible={!!calcTarget}
        onClose={() => setCalcTarget(null)}
        target={calcTarget}
        startGrade={lastAnyGrade}
      /> */}
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  cutoffActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
})
