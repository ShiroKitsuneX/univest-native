import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { AREAS } from '@/data/areas'
import { NOTAS_CORTE } from '@/data/notasCorte'

export function DiscoverCoursesModal({ visible, onClose, onPickCourse }) {
  const { T, isDark } = useTheme()

  const [dArea, setDarea] = useState(null)

  useEffect(() => {
    if (!visible) setDarea(null)
  }, [visible])

  const cd = (extra = {}) => ({
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    ...extra,
  })

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <Text
          style={{
            color: T.text,
            fontSize: 17,
            fontWeight: '800',
            marginBottom: 4,
          }}
        >
          🧭 Descobrir Cursos
        </Text>
        {!dArea ? (
          <>
            <Text style={{ color: T.sub, fontSize: 13, marginBottom: 14 }}>
              Explore por área do conhecimento
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 16,
              }}
            >
              {AREAS.map(a => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setDarea(a)}
                  style={{
                    width: '47%',
                    backgroundColor: isDark ? a.darkBg : a.bg,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: a.cor + '40',
                  }}
                >
                  <Text style={{ fontSize: 26, marginBottom: 6 }}>
                    {a.emoji}
                  </Text>
                  <Text
                    style={{ color: a.cor, fontSize: 13, fontWeight: '800' }}
                  >
                    {a.label}
                  </Text>
                  <Text
                    style={{
                      color: isDark ? 'rgba(255,255,255,.4)' : a.cor + '99',
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    {a.courses.length} cursos
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setDarea(null)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 12,
                backgroundColor: T.card2,
                borderWidth: 1,
                borderColor: T.border,
                alignSelf: 'flex-start',
                marginBottom: 14,
              }}
            >
              <Text style={{ color: T.sub, fontSize: 12, fontWeight: '700' }}>
                ← Voltar
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: isDark ? dArea.darkBg : dArea.bg,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: dArea.cor + '40',
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 30, marginBottom: 6 }}>
                {dArea.emoji}
              </Text>
              <Text
                style={{ color: dArea.cor, fontSize: 18, fontWeight: '800' }}
              >
                {dArea.label}
              </Text>
              <Text
                style={{
                  color: isDark ? 'rgba(255,255,255,.45)' : dArea.cor + '99',
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {dArea.courses.length} cursos
              </Text>
            </View>
            {dArea.courses.map(cc => {
              const ncs = NOTAS_CORTE.filter(n => n.curso === cc)
              const mn = ncs.length ? Math.min(...ncs.map(n => n.nota)) : null
              const mx = ncs.length ? Math.max(...ncs.map(n => n.nota)) : null
              return (
                <TouchableOpacity
                  key={cc}
                  onPress={() => {
                    onPickCourse(cc)
                    onClose()
                  }}
                  style={{
                    ...cd(),
                    padding: 13,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: T.text, fontSize: 14, fontWeight: '700' }}
                    >
                      {cc}
                    </Text>
                    {mn ? (
                      <Text style={{ color: T.sub, fontSize: 11 }}>
                        Nota: {mn === mx ? mn : `${mn}–${mx}`} pts
                      </Text>
                    ) : (
                      <Text style={{ color: T.muted, fontSize: 11 }}>
                        Dados em breve
                      </Text>
                    )}
                  </View>
                  {mn && (
                    <View
                      style={{
                        backgroundColor: T.acBg,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: T.accent,
                          fontSize: 13,
                          fontWeight: '800',
                        }}
                      >
                        {mn}
                      </Text>
                      <Text style={{ color: T.muted, fontSize: 9 }}>mín.</Text>
                    </View>
                  )}
                  <View
                    style={{
                      backgroundColor: dArea.cor + '20',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: dArea.cor,
                        fontSize: 11,
                        fontWeight: '800',
                      }}
                    >
                      Escolher →
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </>
        )}
      </View>
    </BottomSheet>
  )
}
