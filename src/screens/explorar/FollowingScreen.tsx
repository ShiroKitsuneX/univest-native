import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { getMonthFromExamLabel } from '@/utils/dates'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { Button, EmptyState } from '@/shared/components'

export function FollowingScreen({
  onBack,
  onExplore,
  onSelectUni,
  onOpenSort,
}) {
  const insets = useSafeAreaInsets()
  const { T, brand, radius, typography } = useTheme()

  const unis = useUniversitiesStore(s => s.unis)
  const uniSort = useUniversitiesStore(s => s.uniSort)
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs)

  const fol = useMemo(
    () =>
      unis
        .filter(u => u.followed)
        .sort((a, b) => {
          if (uniSort === 'pref') {
            const aPref = Number(uniPrefs[String(a.id)]) || 5
            const bPref = Number(uniPrefs[String(b.id)]) || 5
            return bPref - aPref
          }
          return getMonthFromExamLabel(a.prova) - getMonthFromExamLabel(b.prova)
        }),
    [unis, uniSort, uniPrefs]
  )

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            borderColor: T.border,
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 24, color: brand.primary }}>←</Text>
        </TouchableOpacity>
        <Text
          style={[typography.headline, { color: T.text, flex: 1, fontSize: 18 }]}
        >
          🏛️ Seguindo
        </Text>
        {fol.length > 1 && onOpenSort && (
          <TouchableOpacity
            onPress={onOpenSort}
            style={[
              styles.sortBtn,
              {
                backgroundColor: T.card2,
                borderColor: T.border,
                borderRadius: radius.sm,
              },
            ]}
          >
            <Text style={{ color: T.sub, fontSize: 12, fontWeight: '700' }}>
              ↕ Ordenar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {fol.length === 0 ? (
          <EmptyState
            icon="🏛️"
            title="Nenhuma universidade seguida"
            description="Explore e siga universidades para acompanhar provas, datas e notas de corte."
            action={
              <Button onPress={onExplore} variant="primary" size="md">
                Explorar universidades
              </Button>
            }
          />
        ) : (
          <View style={{ gap: 10, marginBottom: 40 }}>
            {fol.map(u => (
              <TouchableOpacity
                key={u.id}
                onPress={() => onSelectUni(u)}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: radius.md,
                  backgroundColor: T.card,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: u.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}
                  >
                    {u.name.slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{ color: T.text, fontSize: 14, fontWeight: '700' }}
                  >
                    {u.name}
                  </Text>
                  <Text style={{ color: T.sub, fontSize: 11 }}>
                    {u.fullName}
                  </Text>
                </View>
                <Text style={{ color: brand.primary, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
})
