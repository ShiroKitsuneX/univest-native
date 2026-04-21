import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { getMonthFromKey } from '@/utils/dates'
import { useUniversitiesStore } from '@/stores/universitiesStore'

export function UniSortModal({ visible, onClose }) {
  const { T, isDark, AT } = useTheme()

  const unis = useUniversitiesStore(s => s.unis)
  const uniSort = useUniversitiesStore(s => s.uniSort)
  const setUniSort = useUniversitiesStore(s => s.setUniSort)
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs)
  const setUniPrefs = useUniversitiesStore(s => s.setUniPrefs)

  const fol = unis
    .filter(u => u.followed)
    .sort((a, b) => {
      if (uniSort === 'pref')
        return (uniPrefs[b.id] || 5) - (uniPrefs[a.id] || 5)
      const gm = s => getMonthFromKey(s?.match(/[A-Z]{3}/)?.[0] || 'DEZ')
      return gm(a.prova) - gm(b.prova)
    })

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text style={{ color: T.text, fontSize: 17, fontWeight: '800' }}>
            ⚙️ Ordenar universidades
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Text style={{ color: T.muted, fontSize: 20, fontWeight: '700' }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: T.sub, fontSize: 13, marginBottom: 14 }}>
          Escolha como ordenar
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            ['date', '📅 Por data'],
            ['pref', '⭐ Por preferência'],
          ].map(([v, l]) => (
            <TouchableOpacity
              key={v}
              onPress={() => setUniSort(v)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                backgroundColor: uniSort === v ? T.accent : T.card2,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: uniSort === v ? T.accent : T.border,
              }}
            >
              <Text
                style={{
                  color: uniSort === v ? AT : T.sub,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {uniSort === 'pref' &&
          fol.map(u => (
            <View
              key={u.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: u.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}
                >
                  {u.name.slice(0, 2)}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  color: T.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {u.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {[10, 7, 5, 3, 1].map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() =>
                      setUniPrefs(prev => ({ ...prev, [u.id]: p }))
                    }
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor:
                        (uniPrefs[u.id] || 5) === p ? T.accent : T.card2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor:
                        (uniPrefs[u.id] || 5) === p ? T.accent : T.border,
                    }}
                  >
                    <Text
                      style={{
                        color: (uniPrefs[u.id] || 5) === p ? AT : T.sub,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        <TouchableOpacity
          onPress={onClose}
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: T.accent,
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text style={{ color: AT, fontSize: 15, fontWeight: '800' }}>
            Salvar ✓
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  )
}
