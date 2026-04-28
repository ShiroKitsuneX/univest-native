import { useState } from 'react'
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
import { fmtCount } from '@/utils/format'
import { useProgressStore } from '@/stores/progressStore'
import { VerifiedBadge } from '@/shared/components'

export function UniversityDetailScreen({
  selUni,
  onBack,
  onToggleFollow,
  onShowExams,
}) {
  const { T, brand, domain, radius, typography } = useTheme()

  const readBooks = useProgressStore(s => s.readBooks)
  const setReadBooks = useProgressStore(s => s.setReadBooks)

  const [selectedBookYear, setSelectedBookYear] = useState(null)
  const [bookMenu, setBookMenu] = useState(null)

  const lbl = useLabelStyle()
  const cd = useCardStyle(radius.md)

  const persistReadBooks = newRead => setReadBooks(newRead)

  // Reading-in-progress state borrows the goal-domain pastel (warm amber);
  // finished state uses the brand primary (violet). Both pair with their
  // matching `fg` for icon strokes.
  const goalAccent = domain.goal
  const readingBg = goalAccent.bg
  const readingFg = goalAccent.fg
  const doneBg = T.acBg
  const doneFg = brand.primary

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }}>
      <TouchableOpacity
        onPress={onBack}
        style={[
          styles.backBtn,
          {
            backgroundColor: T.card2,
            borderColor: T.border,
            borderRadius: radius.md,
          },
        ]}
      >
        <Text style={{ color: T.sub, fontSize: 12, fontWeight: '700' }}>
          ← Voltar
        </Text>
      </TouchableOpacity>

      {/* Hero card — uses the university's brand colour for the surface,
          white text always on top. */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: selUni.color,
            borderRadius: radius.xl,
          },
        ]}
      >
        <Text style={{ fontSize: 30, marginBottom: 8 }}>
          {selUni.name.slice(0, 2)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[typography.title, { color: '#FFFFFF' }]}>
            {selUni.name}
          </Text>
          {selUni.verified && <VerifiedBadge size={14} />}
        </View>
        <Text
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          {selUni.fullName}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            lineHeight: 20,
            marginBottom: 14,
          }}
        >
          {selUni.description}
        </Text>
        <View style={styles.heroActionRow}>
          <TouchableOpacity
            onPress={() => onToggleFollow(selUni, !selUni.followed)}
            style={[
              styles.followBtn,
              {
                borderRadius: radius.md,
                backgroundColor: selUni.followed
                  ? 'rgba(255,255,255,0.18)'
                  : '#FFFFFF',
                borderWidth: selUni.followed ? 1 : 0,
                borderColor: 'rgba(255,255,255,0.4)',
              },
            ]}
          >
            <Text
              style={{
                color: selUni.followed ? '#FFFFFF' : selUni.color,
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              {selUni.followed ? '✓ Seguindo' : '+ Seguir'}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
            👥{' '}
            <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
              {fmtCount(selUni.followersCount ?? selUni.followers)}
            </Text>{' '}
            seguidores
          </Text>
        </View>
      </View>

      {selUni.exams && selUni.exams.length > 0 && (
        <View
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
        >
          <TouchableOpacity
            onPress={onShowExams}
            activeOpacity={0.85}
            style={[
              styles.examsRow,
              {
                backgroundColor: selUni.color,
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, marginRight: 12 }}>📝</Text>
              <View>
                <Text
                  style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}
                >
                  Provas Anteriores
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                  Consulte provas e simulados
                </Text>
              </View>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 22 }}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ padding: 16, gap: 10 }}>
        <View style={cd({ padding: 16 })}>
          <Text style={[lbl, { marginBottom: 10 }]}>📅 Próximo Vestibular</Text>
          <Text
            style={{
              color: T.text,
              fontSize: 16,
              fontWeight: '800',
              marginBottom: 8,
            }}
          >
            {selUni.vestibular}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              ['Inscrições', selUni.inscricao, brand.primary],
              ['Data da Prova', selUni.prova, domain.simulado.fg],
            ].map(([l, v, c]) => (
              <View
                key={l}
                style={{
                  backgroundColor: T.card2,
                  borderRadius: radius.sm,
                  padding: 8,
                }}
              >
                <Text style={{ color: c, fontSize: 10, fontWeight: '700' }}>
                  {l}
                </Text>
                <Text
                  style={{ color: T.text, fontSize: 12, fontWeight: '600' }}
                >
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={cd({ padding: 16 })}>
          <Text style={[lbl, { marginBottom: 10 }]}>📖 Cursos</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {selUni.courses.map(c => (
              <View
                key={c}
                style={{
                  backgroundColor: T.card2,
                  borderRadius: radius.sm,
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text
                  style={{ color: T.text, fontSize: 12, fontWeight: '600' }}
                >
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {selUni.books && selUni.books.length > 0 && (
          <View style={cd({ padding: 16 })}>
            <View style={styles.booksHeader}>
              <Text style={[lbl, { marginBottom: 0 }]}>
                📚 Livros Obrigatórios
              </Text>
              {selUni.books && selUni.books.length > 4 && (
                <TouchableOpacity
                  onPress={() =>
                    setSelectedBookYear(
                      selectedBookYear === '2026' ? '2025' : '2026'
                    )
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: T.card2,
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  <Text
                    style={{ color: T.sub, fontSize: 10, fontWeight: '600' }}
                  >
                    {selectedBookYear || '2026'} ▼
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {Array.isArray(selUni.books?.[0]) ? (
              <Text style={{ color: T.text, fontSize: 12 }}>
                Verificar ano...
              </Text>
            ) : (
              <View>
                {selUni.books?.slice(0, 8).map((book, i) => {
                  const bookKey = `${selUni.id}-${book}`
                  const status = readBooks[bookKey] || 'none'
                  const isRead = status === 'read'
                  const isReading = status === 'reading'
                  const showMenu = bookMenu === bookKey
                  return (
                    <View key={i}>
                      <TouchableOpacity
                        onPress={() => setBookMenu(showMenu ? null : bookKey)}
                        activeOpacity={0.7}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: isRead || isReading ? 8 : 0,
                          marginHorizontal: isRead || isReading ? -8 : 0,
                          borderRadius: isRead || isReading ? 8 : 0,
                          backgroundColor: isRead
                            ? doneBg
                            : isReading
                              ? readingBg
                              : 'transparent',
                          borderBottomWidth:
                            i < Math.min(selUni.books.length, 8) - 1 ? 1 : 0,
                          borderColor: T.border,
                        }}
                      >
                        {showMenu ? (
                          <View
                            style={{ flexDirection: 'row', flex: 1, gap: 4 }}
                          >
                            <TouchableOpacity
                              onPress={e => {
                                e.stopPropagation()
                                const newRead = { ...readBooks }
                                delete newRead[bookKey]
                                persistReadBooks(newRead)
                                setBookMenu(null)
                              }}
                              style={[styles.menuBtn, {
                                backgroundColor: T.card,
                                borderColor: T.border,
                              }]}
                            >
                              <Text
                                style={[styles.menuBtnText, { color: T.muted }]}
                              >
                                ○
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={e => {
                                e.stopPropagation()
                                const newRead = {
                                  ...readBooks,
                                  [bookKey]: 'reading',
                                }
                                persistReadBooks(newRead)
                                setBookMenu(null)
                              }}
                              style={[styles.menuBtn, {
                                backgroundColor: readingBg,
                                borderColor: readingFg,
                              }]}
                            >
                              <Text
                                style={[styles.menuBtnText, { color: readingFg }]}
                              >
                                📖
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={e => {
                                e.stopPropagation()
                                const newRead = {
                                  ...readBooks,
                                  [bookKey]: 'read',
                                }
                                persistReadBooks(newRead)
                                setBookMenu(null)
                              }}
                              style={[styles.menuBtn, {
                                backgroundColor: doneBg,
                                borderColor: doneFg,
                              }]}
                            >
                              <Text
                                style={[styles.menuBtnText, { color: doneFg }]}
                              >
                                ✓
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: isRead
                                  ? doneFg
                                  : isReading
                                    ? readingFg
                                    : T.card2,
                                borderWidth: 2,
                                borderColor: isRead
                                  ? doneFg
                                  : isReading
                                    ? readingFg
                                    : T.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}
                            >
                              {isRead && (
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: '800',
                                  }}
                                >
                                  ✓
                                </Text>
                              )}
                              {isReading && (
                                <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
                                  📖
                                </Text>
                              )}
                              {!isRead && !isReading && (
                                <View
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: T.muted,
                                  }}
                                />
                              )}
                            </View>
                            <Text
                              style={{ color: T.text, fontSize: 12, flex: 1 }}
                            >
                              {book}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={() => Linking.openURL(selUni.site)}
          style={[
            styles.siteRow,
            {
              backgroundColor: T.acBg,
              borderRadius: radius.md,
              borderColor: brand.primary + '40',
            },
          ]}
        >
          <Text style={{ fontSize: 18 }}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.sub, fontSize: 10 }}>Site oficial</Text>
            <Text style={{ color: brand.primary, fontSize: 13, fontWeight: '700' }}>
              {selUni.site}
            </Text>
          </View>
          <Text style={{ color: brand.primary }}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 16 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    margin: 16,
  },
  hero: {
    marginHorizontal: 16,
    padding: 22,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  followBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  examsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  booksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuBtn: {
    flex: 1,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  menuBtnText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  siteRow: {
    padding: 13,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
})
