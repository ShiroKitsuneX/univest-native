import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { removeAccents } from '@/utils/string'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { Button, EmptyState, PressScale } from '@/shared/components'

type Props = {
  visible: boolean
  onClose: () => void
}

export function GoalsModal({ visible, onClose }: Props) {
  const { T, brand, radius, typography } = useTheme()

  const fbUnis = useUniversitiesStore(s => s.fbUnis)
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis)
  const setGoalsUnis = useUniversitiesStore(s => s.setGoalsUnis)

  const [goalsSearch, setGoalsSearch] = useState('')

  useEffect(() => {
    if (!visible) setGoalsSearch('')
  }, [visible])

  const filtered = useMemo(() => {
    const allUnis = fbUnis.filter(u => u.type !== 'Técnico')
    if (!goalsSearch) return allUnis
    const needle = removeAccents(goalsSearch.toLowerCase())
    return allUnis.filter(
      u =>
        removeAccents(u.name.toLowerCase()).includes(needle) ||
        removeAccents(u.fullName.toLowerCase()).includes(needle)
    )
  }, [fbUnis, goalsSearch])

  const toggleGoal = (uni: (typeof fbUnis)[number]) => {
    const isSelected = goalsUnis.some(g => g.id === uni.id)
    if (isSelected) {
      setGoalsUnis(goalsUnis.filter(g => g.id !== uni.id))
    } else {
      setGoalsUnis([...goalsUnis, uni])
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: T.card2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: T.sub, fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[typography.eyebrow, { color: T.muted }]}>
              METAS DE VESTIBULAR
            </Text>
            <Text
              style={[typography.headline, { color: T.text, marginTop: 2 }]}
            >
              Onde você quer prestar
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: T.inp,
            borderRadius: radius.md,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: T.inpB,
          }}
        >
          <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={goalsSearch}
            onChangeText={setGoalsSearch}
            placeholder="Buscar universidade..."
            placeholderTextColor={T.muted}
            style={{ flex: 1, color: T.text, fontSize: 14, padding: 0 }}
          />
          {goalsSearch.length > 0 && (
            <TouchableOpacity onPress={() => setGoalsSearch('')}>
              <Text style={{ color: T.muted, fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ color: T.sub, fontSize: 12, marginBottom: 12 }}>
          Estas universidades alimentam tarefas, contagem regressiva e
          comparações com nota de corte.
        </Text>

        <ScrollView
          style={{ maxHeight: 400 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nenhuma universidade encontrada"
              description="Tente outro termo ou limpe a busca."
            />
          ) : (
            filtered.map(uni => {
              const isSelected = goalsUnis.some(g => g.id === uni.id)
              const nextExam = uni.exams?.find(e => e.status === 'upcoming')
              return (
                <PressScale
                  key={uni.id}
                  onPress={() => toggleGoal(uni)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isSelected ? T.acBg : T.card2,
                    borderRadius: radius.lg,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: isSelected ? brand.primary : T.border,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: uni.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}
                    >
                      {uni.name.slice(0, 2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: T.text, fontSize: 14, fontWeight: '700' }}
                    >
                      {uni.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 2,
                      }}
                    >
                      <Text style={{ color: T.muted, fontSize: 11 }}>
                        {uni.vestibular}
                      </Text>
                      {nextExam && (
                        <Text
                          style={{
                            color: brand.primary,
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          📅 {nextExam.date}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: isSelected ? brand.primary : T.card,
                      borderWidth: 2,
                      borderColor: isSelected ? brand.primary : T.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: '800',
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </PressScale>
              )
            })
          )}
        </ScrollView>

        {goalsUnis.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Button onPress={onClose} variant="primary" size="lg" fullWidth>
              {`Salvar metas (${goalsUnis.length})`}
            </Button>
          </View>
        )}
      </View>
    </BottomSheet>
  )
}
