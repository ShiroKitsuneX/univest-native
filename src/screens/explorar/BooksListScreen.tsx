import { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useProgressStore } from '@/stores/progressStore'

export function BooksListScreen({ onBack }) {
  const insets = useSafeAreaInsets()
  const { T, domain } = useTheme()
  // Goal-domain pastel keys the "Reading in progress" affordance app-wide.
  const reading = domain.goal

  const unis = useUniversitiesStore(s => s.unis)
  const readBooks = useProgressStore(s => s.readBooks)
  const setReadBooks = useProgressStore(s => s.setReadBooks)

  const [booksSearch, setBooksSearch] = useState('')
  const [bookMenu, setBookMenu] = useState(null)

  const filteredBooks = useMemo(() => {
    const allBooks = []
    unis.forEach(uni => {
      if (
        uni.books &&
        Array.isArray(uni.books) &&
        !Array.isArray(uni.books[0])
      ) {
        uni.books.forEach(book => {
          allBooks.push({ id: `${uni.id}-${book}`, book, uni })
        })
      }
    })
    return allBooks.filter(
      b =>
        !booksSearch ||
        b.book.toLowerCase().includes(booksSearch.toLowerCase()) ||
        b.uni.name.toLowerCase().includes(booksSearch.toLowerCase())
    )
  }, [unis, booksSearch])

  const { readCount, readingCount } = useMemo(() => {
    const values = Object.values(readBooks)
    return {
      readCount: values.filter(s => s === 'read').length,
      readingCount: values.filter(s => s === 'reading').length,
    }
  }, [readBooks])

  const persistReadBooks = newRead => setReadBooks(newRead)

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: insets.top + 4,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderColor: T.border,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setBooksSearch('')
            onBack()
          }}
          style={{ marginRight: 12 }}
        >
          <Text style={{ fontSize: 24, color: T.accent }}>←</Text>
        </TouchableOpacity>
        <Text
          style={{ fontSize: 18, fontWeight: '800', color: T.text, flex: 1 }}
        >
          📚 Todos os Livros
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {(readCount > 0 || readingCount > 0) && (
          <Text style={{ color: T.sub, fontSize: 12, marginBottom: 12 }}>
            {readingCount > 0 ? `Lendo ${readingCount} · ` : ''}Lidos:{' '}
            {readCount}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: T.inp,
            borderRadius: 13,
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderWidth: 1,
            borderColor: T.inpB,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, marginRight: 10 }}>🔍</Text>
          <TextInput
            value={booksSearch}
            onChangeText={setBooksSearch}
            placeholder="Buscar livro ou universidade..."
            placeholderTextColor={T.muted}
            style={{ flex: 1, color: T.text, fontSize: 14, padding: 0 }}
          />
          {booksSearch ? (
            <TouchableOpacity onPress={() => setBooksSearch('')}>
              <Text style={{ color: T.muted }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {filteredBooks.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
            <Text style={{ color: T.text, fontSize: 14, fontWeight: '700' }}>
              Nenhum livro encontrado
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8, marginBottom: 40 }}>
            {filteredBooks.map(item => {
              const status = readBooks[item.id] || 'none'
              const isRead = status === 'read'
              const isReading = status === 'reading'
              const showMenu = bookMenu === item.id
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={() => setBookMenu(showMenu ? null : item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: isRead
                          ? T.acBg
                          : isReading
                            ? reading.bg
                            : T.card2,
                        borderWidth: 1,
                        borderColor: isRead
                          ? T.accent + '40'
                          : isReading
                            ? reading.fg + '55'
                            : T.border,
                      }}
                    >
                      {showMenu ? (
                        <View style={{ flexDirection: 'row', flex: 1, gap: 6 }}>
                          <TouchableOpacity
                            onPress={e => {
                              e.stopPropagation()
                              const newRead = { ...readBooks }
                              delete newRead[item.id]
                              persistReadBooks(newRead)
                              setBookMenu(null)
                            }}
                            style={{
                              flex: 1,
                              padding: 10,
                              borderRadius: 10,
                              backgroundColor: T.card,
                              borderWidth: 1,
                              borderColor: T.border,
                            }}
                          >
                            <Text
                              style={{
                                color: T.muted,
                                fontSize: 12,
                                fontWeight: '700',
                                textAlign: 'center',
                              }}
                            >
                              ○ Nenhum
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={e => {
                              e.stopPropagation()
                              const newRead = {
                                ...readBooks,
                                [item.id]: 'reading',
                              }
                              persistReadBooks(newRead)
                              setBookMenu(null)
                            }}
                            style={{
                              flex: 1,
                              padding: 10,
                              borderRadius: 10,
                              backgroundColor: reading.bg,
                              borderWidth: 1,
                              borderColor: reading.fg,
                            }}
                          >
                            <Text
                              style={{
                                color: reading.fg,
                                fontSize: 12,
                                fontWeight: '700',
                                textAlign: 'center',
                              }}
                            >
                              📖 Lendo
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={e => {
                              e.stopPropagation()
                              const newRead = {
                                ...readBooks,
                                [item.id]: 'read',
                              }
                              persistReadBooks(newRead)
                              setBookMenu(null)
                            }}
                            style={{
                              flex: 1,
                              padding: 10,
                              borderRadius: 10,
                              backgroundColor: T.accent + '20',
                              borderWidth: 1,
                              borderColor: T.accent,
                            }}
                          >
                            <Text
                              style={{
                                color: T.accent,
                                fontSize: 12,
                                fontWeight: '700',
                                textAlign: 'center',
                              }}
                            >
                              ✓ Lido
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: item.uni.color,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                            }}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: '800',
                              }}
                            >
                              {item.uni.name.slice(0, 2)}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: T.text,
                                fontSize: 13,
                                fontWeight: '600',
                              }}
                              numberOfLines={2}
                            >
                              {item.book}
                            </Text>
                            <Text style={{ color: T.sub, fontSize: 11 }}>
                              {item.uni.name}
                            </Text>
                          </View>
                          {isReading && (
                            <Text style={{ fontSize: 16 }}>📖</Text>
                          )}
                          {isRead && (
                            <Text style={{ color: T.accent, fontSize: 16 }}>
                              ✓
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
