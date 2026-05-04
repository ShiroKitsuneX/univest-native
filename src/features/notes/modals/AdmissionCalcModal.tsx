import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { ENEM_SUBJECTS } from '@/data/subjects'
import { useUniversitiesStore, type University } from '@/stores/universitiesStore'
import type { Grade } from '@/stores/profileStore'
import { Button, Card } from '@/shared/components'

// Default ENEM weights — equal across the five areas. Used when the target
// university doesn't define its own weights.
const DEFAULT_WEIGHTS = { l: 20, h: 15, n: 15, m: 30, r: 20 } as const

// Step size for the +/- buttons. ENEM scores move in tens of points in
// practice, so ±10 keeps the simulator responsive without overshooting.
const STEP = 10
const MIN_SCORE = 0
const MAX_SCORE = 1000 // redação is 0-1000; other subjects are also displayed in 0-1000-ish range

type Target = {
  uni: string
  curso: string
  cutoff: number
}

type Props = {
  visible: boolean
  onClose: () => void
  target: Target | null
  startGrade?: Grade
}

type Scores = { l: number; h: number; n: number; m: number; r: number }

// Resolve weights from the matching University doc (matched by uni name).
// Falls back to DEFAULT_WEIGHTS if the doc doesn't carry `examWeights`.
function resolveWeights(uniName: string, unis: University[]): Scores {
  const match = unis.find(u => u.name === uniName || uniName.includes(u.name || ''))
  return (match?.examWeights as Scores | undefined) ?? { ...DEFAULT_WEIGHTS }
}

// Weighted average. ENEM areas are 0-1000 (we display them as 0-1000 in the
// calculator), so the weighted total is also on that scale. Cut-offs in
// `NOTAS_CORTE` are stored on a 0-100-ish scale (e.g. 88.4) — we
// normalise the weighted total to that scale by dividing by 10 to keep the
// comparison apples-to-apples.
function weightedScore(scores: Scores, weights: Scores): number {
  const total =
    (scores.l * weights.l +
      scores.h * weights.h +
      scores.n * weights.n +
      scores.m * weights.m +
      scores.r * weights.r) /
    100
  // Convert from the 0-1000 weighted scale to the 0-100 cut-off scale.
  return Math.round((total / 10) * 10) / 10
}

export function AdmissionCalcModal({
  visible,
  onClose,
  target,
  startGrade,
}: Props) {
  const insets = useSafeAreaInsets()
  const { T, brand, domain, typography, shadow } = useTheme()
  const unis = useUniversitiesStore(s => s.unis)

  // Seed scores from the user's most recent grade. If they have no grades,
  // start every subject at 600 — a believable mid-range for ENEM that lets
  // the user quickly see what improving by N points would do.
  const seed = useMemo<Scores>(() => {
    if (startGrade?.s) {
      return {
        l: startGrade.s.l ?? 0,
        h: startGrade.s.h ?? 0,
        n: startGrade.s.n ?? 0,
        m: startGrade.s.m ?? 0,
        // Redação is stored 0-1000 already; keep on that scale.
        r: startGrade.s.r ?? 0,
      }
    }
    return { l: 600, h: 600, n: 600, m: 600, r: 600 }
  }, [startGrade])

  const [scores, setScores] = useState<Scores>(seed)

  // Re-seed whenever the modal is opened with a fresh target — otherwise
  // the modal would carry stale "what if" tweaks from the previous open.
  useEffect(() => {
    if (visible) setScores(seed)
  }, [visible, seed])

  const weights = useMemo(
    () => (target ? resolveWeights(target.uni, unis) : DEFAULT_WEIGHTS),
    [target, unis]
  )

  const total = useMemo(() => weightedScore(scores, weights), [scores, weights])
  const cutoff = target?.cutoff ?? 0
  const passes = total >= cutoff
  const delta = total - cutoff

  const adjust = (k: keyof Scores, dir: 1 | -1) =>
    setScores(prev => ({
      ...prev,
      [k]: Math.max(MIN_SCORE, Math.min(MAX_SCORE, prev[k] + dir * STEP)),
    }))

  const reset = () => setScores(seed)

  if (!target) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, borderBottomColor: T.border },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.iconBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={{ color: T.text, fontSize: 18, fontWeight: '700' }}>
              ←
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.eyebrow, { color: T.muted }]}>
              CALCULADORA
            </Text>
            <Text
              style={[typography.headline, { color: T.text, fontSize: 18 }]}
              numberOfLines={1}
            >
              {target.curso}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* Hero card — current weighted total, cut-off comparison */}
          <Card
            tone="highlight"
            padding={20}
            style={[
              {
                backgroundColor: passes ? domain.news.bg : T.card,
                borderColor: passes ? domain.news.fg + '55' : T.border,
              },
              shadow.card,
            ]}
          >
            <Text style={[typography.eyebrow, { color: T.sub }]}>
              {target.uni}
            </Text>
            <Text
              style={[
                typography.headline,
                { color: T.text, fontSize: 13, marginTop: 2 },
              ]}
            >
              Nota de corte: {cutoff.toFixed(1)}
            </Text>

            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.eyebrow, { color: T.muted }]}>
                  SUA PONTUAÇÃO PONDERADA
                </Text>
                <Text style={[styles.heroValue, { color: T.text }]}>
                  {total.toFixed(1)}
                </Text>
                <Text
                  style={{
                    color: passes ? domain.news.fg : T.sub,
                    fontSize: 12,
                    fontWeight: '700',
                    marginTop: 4,
                  }}
                >
                  {passes
                    ? `✅ ${delta.toFixed(1)} pts acima da meta`
                    : `Faltam ${Math.abs(delta).toFixed(1)} pts`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={reset}
                style={[
                  styles.resetBtn,
                  { borderColor: T.border, backgroundColor: T.card2 },
                ]}
              >
                <Text style={{ color: T.sub, fontSize: 11, fontWeight: '700' }}>
                  ↺ resetar
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Weights summary — shows what's driving the calculation. Helps
              the user understand WHY a small change in one area moves the
              total more than another. */}
          <Card padding={14} style={{ marginTop: 14 }}>
            <Text style={[typography.eyebrow, { color: T.muted, marginBottom: 8 }]}>
              PESOS DESTA UNIVERSIDADE
            </Text>
            <View style={styles.weightsRow}>
              {ENEM_SUBJECTS.map(sub => (
                <View key={sub.k} style={styles.weightChip}>
                  <Text
                    style={{ color: T.muted, fontSize: 10, fontWeight: '600' }}
                  >
                    {sub.short}
                  </Text>
                  <Text
                    style={{
                      color: brand.primary,
                      fontSize: 13,
                      fontWeight: '800',
                    }}
                  >
                    {weights[sub.k as keyof Scores]}%
                  </Text>
                </View>
              ))}
            </View>
            {!unis.find(
              u =>
                u.name === target.uni || target.uni.includes(u.name || '')
            )?.examWeights && (
              <Text
                style={{
                  color: T.muted,
                  fontSize: 10,
                  marginTop: 8,
                  fontStyle: 'italic',
                }}
              >
                Pesos estimados — esta universidade ainda não tem pesos oficiais cadastrados.
              </Text>
            )}
          </Card>

          {/* What-if sliders. Each subject has a current score + ± buttons
              that step ±10 points. Tap "+" repeatedly to project upward and
              see the live impact on the weighted total above. */}
          <Text
            style={[
              typography.eyebrow,
              { color: T.muted, marginTop: 20, marginBottom: 10 },
            ]}
          >
            E SE EU MELHORAR
          </Text>

          <Card padding={14}>
            {ENEM_SUBJECTS.map((sub, i) => {
              const current = scores[sub.k as keyof Scores]
              const initial = seed[sub.k as keyof Scores]
              const diff = current - initial
              const max = sub.k === 'r' ? 1000 : 1000
              const pct = (current / max) * 100
              return (
                <View
                  key={sub.k}
                  style={[
                    styles.subjectRow,
                    i < ENEM_SUBJECTS.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: T.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.subjectHeader}>
                      <Text
                        style={{
                          color: T.text,
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {sub.long}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {diff !== 0 && (
                          <Text
                            style={{
                              color: diff > 0 ? domain.news.fg : T.sub,
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: T.text,
                            fontSize: 14,
                            fontWeight: '800',
                          }}
                        >
                          {current}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.track,
                        { backgroundColor: T.card2, borderRadius: 4 },
                      ]}
                    >
                      <View
                        style={{
                          width: `${Math.min(100, pct)}%` as const,
                          height: '100%',
                          backgroundColor: brand.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                  <View style={styles.controls}>
                    <Pressable
                      onPress={() => adjust(sub.k as keyof Scores, -1)}
                      style={({ pressed }) => [
                        styles.stepBtn,
                        {
                          borderColor: T.border,
                          backgroundColor: T.card2,
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                      hitSlop={6}
                    >
                      <Text style={{ color: T.text, fontWeight: '800', fontSize: 16 }}>
                        −
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => adjust(sub.k as keyof Scores, 1)}
                      style={({ pressed }) => [
                        styles.stepBtn,
                        {
                          borderColor: brand.primary,
                          backgroundColor: brand.primary,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      hitSlop={6}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </Card>

          <View style={{ marginTop: 20 }}>
            <Button onPress={onClose} variant="primary" size="lg" fullWidth>
              Concluído
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 2,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 6,
  },
  weightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weightChip: {
    alignItems: 'center',
    minWidth: 56,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  track: {
    height: 6,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
})
