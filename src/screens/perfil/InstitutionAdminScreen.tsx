import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import {
  saveUniversityUpdates,
  updateUniversityInfo,
} from '@/features/explorar/services/universityService'
import { logger } from '@/services/logger'

type Props = {
  universityId: string
  onChangePhoto: () => void
}

type EditMode =
  | null
  | 'description'
  | 'vestibular'
  | 'inscricao'
  | 'prova'
  | 'site'
  | 'courses'
  | 'books'
  | 'email'
  | 'phone'
  | 'color'

export function InstitutionAdminScreen({ universityId, onChangePhoto }: Props) {
  const { T, isDark, AT } = useTheme()

  const unis = useUniversitiesStore(s => s.unis)
  const selUni = useUniversitiesStore(s => s.selUni)
  const setSelUni = useUniversitiesStore(s => s.setSelUni)

  const [loading, setLoading] = useState(false)
  const [editField, setEditField] = useState<EditMode>(null)
  const [editValue, setEditValue] = useState('')

  const [description, setDescription] = useState('')
  const [vestibular, setVestibular] = useState('')
  const [inscricao, setInscricao] = useState('')
  const [prova, setProva] = useState('')
  const [site, setSite] = useState('')
  const [courses, setCourses] = useState<string[]>([])
  const [books, setBooks] = useState<string[]>([])
  const [followers, setFollowers] = useState('')
  const [color, setColor] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const uni = unis.find(
      u => String(u.id) === universityId || u.name === universityId
    )
    if (uni) {
      setSelUni(uni)
      setDescription(String(uni.description || ''))
      setVestibular(String(uni.vestibular || ''))
      setInscricao(String(uni.inscricao || ''))
      setProva(String(uni.prova || ''))
      setSite(String(uni.site || ''))
      setCourses((uni.courses as string[]) || [])
      setBooks((uni.books as string[]) || [])
      setFollowers(String(uni.followersCount || uni.followers || '0'))
      setColor(String(uni.color || ''))
      setFullName(String(uni.fullName || ''))
    }
  }, [universityId, unis])

  const handleSaveField = async () => {
    if (!selUni || !editField) return

    setLoading(true)
    try {
      if (editField === 'courses') {
        const newCourses = editValue
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
        await saveUniversityUpdates(String(selUni.id), { courses: newCourses })
        setCourses(newCourses)
      } else if (editField === 'books') {
        const newBooks = editValue
          .split(',')
          .map(b => b.trim())
          .filter(Boolean)
        await saveUniversityUpdates(String(selUni.id), { books: newBooks })
        setBooks(newBooks)
      } else if (editField === 'color') {
        await saveUniversityUpdates(String(selUni.id), { color: editValue })
        setColor(editValue)
      } else {
        const fieldMap: Record<EditMode, string> = {
          description: 'description',
          vestibular: 'vestibular',
          inscricao: 'inscricao',
          prova: 'prova',
          site: 'site',
          email: 'email',
          phone: 'phone',
          courses: 'courses',
          books: 'books',
          color: 'color',
        }
        await updateUniversityInfo(
          String(selUni.id),
          fieldMap[editField],
          editValue
        )

        switch (editField) {
          case 'description':
            setDescription(editValue)
            break
          case 'vestibular':
            setVestibular(editValue)
            break
          case 'inscricao':
            setInscricao(editValue)
            break
          case 'prova':
            setProva(editValue)
            break
          case 'site':
            setSite(editValue)
            break
        }
      }
      setEditField(null)
      setEditValue('')
    } catch (error) {
      logger.warn('handleSaveField error:', error)
      Alert.alert('Erro', 'Não foi possível salvar.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourses = () => {
    setEditField('courses')
    setEditValue(courses.join(', '))
  }

  const handleEditBooks = () => {
    setEditField('books')
    setEditValue(books.join(', '))
  }

  const handleChangeColor = (newColor: string) => {
    setLoading(true)
    saveUniversityUpdates(String(selUni?.id), { color: newColor })
      .then(() => {
        setColor(newColor)
        setSelUni({ ...selUni, color: newColor } as never)
      })
      .catch(err => logger.warn('color change error:', err))
      .finally(() => setLoading(false))
  }

  const lbl = {
    color: T.muted,
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  }
  const cd = (st = {}) => ({
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    ...st,
  })

  const EditableField = ({
    label,
    field,
    value,
    multiline = false,
    placeholder = '',
  }: {
    label: string
    field: EditMode
    value: string
    multiline?: boolean
    placeholder?: string
  }) => (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <Text style={lbl}>{label}</Text>
        <TouchableOpacity
          onPress={() => {
            setEditField(field)
            setEditValue(value)
          }}
          style={{ paddingHorizontal: 8, paddingVertical: 4 }}
        >
          <Text style={{ color: T.accent, fontSize: 11 }}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: T.text, lineHeight: 20 }}>
        {value || placeholder || '-'}
      </Text>
    </View>
  )

  const EditModal = () => {
    if (!editField) return null

    const fieldLabels: Record<EditMode, string> = {
      description: 'Descrição',
      vestibular: 'Vestibular',
      inscricao: 'Inscrição',
      prova: 'Data da Prova',
      site: 'Site',
      courses: 'Cursos (separar por vírgula)',
      books: 'Livros (separar por vírgula)',
      email: 'E-mail',
      phone: 'Telefone',
      color: 'Cor do tema',
    }
    const isMultiline =
      editField === 'description' ||
      editField === 'courses' ||
      editField === 'books'
    const isColor = editField === 'color'

    const colorOptions = [
      '#004d2c',
      '#1e3a8a',
      '#7c3aed',
      '#be185d',
      '#dc2626',
      '#ea580c',
      '#ca8a04',
      '#16a34a',
      '#0891b2',
      '#4f46e5',
    ]

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View style={cd({ padding: 20 })}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: T.text,
              marginBottom: 16,
            }}
          >
            Editar {fieldLabels[editField]}
          </Text>

          {isColor ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {colorOptions.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setEditValue(c)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: c,
                    borderWidth: editValue === c ? 3 : 0,
                    borderColor: '#fff',
                  }}
                />
              ))}
            </View>
          ) : (
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              multiline={isMultiline}
              numberOfLines={isMultiline ? 4 : 1}
              style={{
                backgroundColor: T.card2,
                borderRadius: 12,
                padding: 12,
                color: T.text,
                minHeight: isMultiline ? 100 : 44,
                textAlignVertical: 'top',
                marginBottom: 16,
              }}
              placeholder={
                editField === 'courses'
                  ? 'Medicina, Engenharia, Direito...'
                  : editField === 'books'
                    ? 'Livro 1, Livro 2, Livro 3...'
                    : 'Digite...'
              }
            />
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setEditField(null)
                setEditValue('')
              }}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                backgroundColor: T.card2,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: T.text, fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveField}
              disabled={loading}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                backgroundColor: T.accent,
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: isDark ? '#000' : '#fff', fontWeight: '700' }}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            borderRadius: 22,
            padding: 22,
            backgroundColor: color,
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={onChangePhoto}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.5)',
            }}
          >
            <Text style={{ fontSize: 28 }}>
              {selUni?.name?.slice(0, 2) || '??'}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: T.accent,
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10 }}>✏️</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setEditField('color')
              setEditValue(color)
            }}
          >
            <Text
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 10,
                marginBottom: 4,
              }}
            >
              Toque no ícone para alterar logo • Toque aqui para alterar cor
            </Text>
          </TouchableOpacity>

          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
            {selUni?.name || ''}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,.65)',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            {fullName}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,.8)',
              fontSize: 12,
              lineHeight: 20,
            }}
          >
            {description || 'Sem descrição'}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 11 }}>
              👥{' '}
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {followers}
              </Text>{' '}
              seguidores
            </Text>
          </View>
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          <View style={cd({ padding: 16 })}>
            <Text style={[lbl, { marginBottom: 10 }]}>📅 Vestibular</Text>
            <EditableField
              label="Nome do Vestibular"
              field="vestibular"
              value={vestibular}
              placeholder="Ex: COMVEST 2026"
            />
            <EditableField
              label="Período de Inscrição"
              field="inscricao"
              value={inscricao}
              placeholder="Ex: Ago/2025"
            />
            <EditableField
              label="Data da Prova"
              field="prova"
              value={prova}
              placeholder="Ex: Dez/2025"
            />
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL(site)}
            disabled={!site}
            style={{
              backgroundColor: isDark ? '#0a1f15' : '#f0fdf4',
              borderRadius: 14,
              padding: 13,
              borderWidth: 1,
              borderColor: T.accent + '30',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>🌐</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.sub, fontSize: 10 }}>Site oficial</Text>
              <Text
                style={{ color: T.accent, fontSize: 13, fontWeight: '700' }}
              >
                {site || 'Não definido'}
              </Text>
            </View>
            <Text style={{ color: T.accent }}>›</Text>
          </TouchableOpacity>

          <View style={cd({ padding: 16 })}>
            <Text style={[lbl, { marginBottom: 10 }]}>📖 Cursos</Text>
            {courses.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {courses.map(c => (
                  <View
                    key={c}
                    style={{
                      backgroundColor: T.card2,
                      borderRadius: 10,
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
            ) : (
              <Text style={{ color: T.muted, marginBottom: 8 }}>
                Nenhum curso adicionado
              </Text>
            )}
            <TouchableOpacity
              onPress={handleEditCourses}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: T.accent, fontSize: 12 }}>
                + Adicionar/Editar cursos
              </Text>
            </TouchableOpacity>
          </View>

          <View style={cd({ padding: 16 })}>
            <Text style={[lbl, { marginBottom: 10 }]}>
              📚 Livros Obrigatórios
            </Text>
            {books.length > 0 ? (
              <View style={{ gap: 4 }}>
                {books.slice(0, 5).map((book, i) => (
                  <Text key={i} style={{ color: T.text, fontSize: 12 }}>
                    • {book}
                  </Text>
                ))}
                {books.length > 5 && (
                  <Text style={{ color: T.muted, fontSize: 11 }}>
                    +{books.length - 5} mais...
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ color: T.muted, marginBottom: 8 }}>
                Nenhum livro adicionado
              </Text>
            )}
            <TouchableOpacity
              onPress={handleEditBooks}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: T.accent, fontSize: 12 }}>
                + Adicionar/Editar livros
              </Text>
            </TouchableOpacity>
          </View>

          <View style={cd({ padding: 16 })}>
            <Text style={[lbl, { marginBottom: 10 }]}>📝 Descrição</Text>
            <Text style={{ color: T.text, lineHeight: 20 }}>
              {description || 'Sem descrição'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditField('description')
                setEditValue(description)
              }}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: T.accent, fontSize: 12 }}>
                + Editar descrição
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <EditModal />
    </View>
  )
}
