import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Linking,
} from 'react-native'
import type { TextStyle } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { ThemeColors } from '@/theme/palette'
import { TAG_D, TAG_L } from '@/theme/palette'
import { useCardStyle, useLabelStyle, type CardStyle } from '@/theme/styles'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import {
  saveUniversityUpdates,
  updateUniversityInfo,
} from '@/features/explorar/services/universityService'
import {
  deleteInstitutionPostById,
  loadInstitutionPosts,
  type InstitutionPost,
} from '@/features/institution/services/institutionPostsService'
import {
  deleteInstitutionStory,
  loadInstitutionStories,
  type StoryDoc,
} from '@/features/institution/services/institutionStoriesService'
import {
  loadInstitutionAnalytics,
  type InstitutionAnalytics,
} from '@/features/institution/services/institutionAnalyticsService'
import { CreatePostModal } from '@/features/institution/modals/CreatePostModal'
import { CreateStoryModal } from '@/features/institution/modals/CreateStoryModal'
import { StatCard } from '@/shared/components'
import { Button } from '@/shared/components'
import { timeAgo } from '@/utils/format'
import { logger } from '@/core/logging/logger'

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
  const { T, isDark } = useTheme()

  const unis = useUniversitiesStore(s => s.unis)
  const selUni = useUniversitiesStore(s => s.selUni)
  const setSelUni = useUniversitiesStore(s => s.setSelUni)

  const [loading, setLoading] = useState(false)
  const [editField, setEditField] = useState<EditMode>(null)
  const [editValue, setEditValue] = useState('')

  // Institution-owned posts state. We load on mount + after each publish so
  // the admin sees their published posts immediately (the feed picks them up
  // via the regular postsStore.load too — this list is just the management
  // surface for delete + audit).
  const [posts, setPosts] = useState<InstitutionPost[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [createPostVisible, setCreatePostVisible] = useState(false)

  const [stories, setStories] = useState<StoryDoc[]>([])
  const [storiesLoading, setStoriesLoading] = useState(false)
  const [createStoryVisible, setCreateStoryVisible] = useState(false)

  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null)
  const tagPalette = isDark ? TAG_D : TAG_L

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

  const refreshPosts = useCallback(async () => {
    if (!universityId) return
    setPostsLoading(true)
    try {
      const list = await loadInstitutionPosts(universityId)
      setPosts(list)
    } catch (e) {
      logger.warn('loadInstitutionPosts:', (e as Error)?.message)
    } finally {
      setPostsLoading(false)
    }
  }, [universityId])

  const refreshStories = useCallback(async () => {
    if (!universityId) return
    setStoriesLoading(true)
    try {
      const list = await loadInstitutionStories(universityId)
      setStories(list)
    } catch (e) {
      logger.warn('loadInstitutionStories:', (e as Error)?.message)
    } finally {
      setStoriesLoading(false)
    }
  }, [universityId])

  const refreshAnalytics = useCallback(async () => {
    if (!universityId) return
    try {
      const data = await loadInstitutionAnalytics(universityId)
      setAnalytics(data)
    } catch (e) {
      logger.warn('loadInstitutionAnalytics:', (e as Error)?.message)
    }
  }, [universityId])

  useEffect(() => {
    refreshPosts()
    refreshStories()
    refreshAnalytics()
  }, [refreshPosts, refreshStories, refreshAnalytics])

  const handleDeleteStory = (story: StoryDoc) => {
    Alert.alert('Excluir story', 'Remover esta story do feed?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInstitutionStory(universityId, story.id)
            setStories(prev => prev.filter(s => s.id !== story.id))
            refreshAnalytics()
          } catch (err) {
            logger.warn('deleteStory:', (err as Error)?.message)
            Alert.alert('Erro', 'Não foi possível excluir a story.')
          }
        },
      },
    ])
  }

  const handleDeletePost = (post: InstitutionPost) => {
    Alert.alert(
      'Excluir publicação',
      `Remover "${post.title}" do feed?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInstitutionPostById(post.id)
              setPosts(prev => prev.filter(p => p.id !== post.id))
              refreshAnalytics()
            } catch (err) {
              logger.warn('deletePost:', (err as Error)?.message)
              Alert.alert('Erro', 'Não foi possível excluir a publicação.')
            }
          },
        },
      ]
    )
  }

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

  const lbl = useLabelStyle()
  const cd = useCardStyle(14)

  const beginEdit = (field: EditMode, value: string) => {
    setEditField(field)
    setEditValue(value)
  }
  const cancelEdit = () => {
    setEditField(null)
    setEditValue('')
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
              value={vestibular}
              placeholder="Ex: COMVEST 2026"
              onEdit={() => beginEdit('vestibular', vestibular)}
              T={T}
              lbl={lbl}
            />
            <EditableField
              label="Período de Inscrição"
              value={inscricao}
              placeholder="Ex: Ago/2025"
              onEdit={() => beginEdit('inscricao', inscricao)}
              T={T}
              lbl={lbl}
            />
            <EditableField
              label="Data da Prova"
              value={prova}
              placeholder="Ex: Dez/2025"
              onEdit={() => beginEdit('prova', prova)}
              T={T}
              lbl={lbl}
            />
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL(site)}
            disabled={!site}
            style={{
              backgroundColor: T.acBg,
              borderRadius: 14,
              padding: 13,
              borderWidth: 1,
              borderColor: T.accent + '40',
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

          <View style={cd({ padding: 16 })}>
            <Text style={[lbl, { marginBottom: 12 }]}>📊 Analytics</Text>
            {analytics ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="progress"
                      icon={<Text style={{ fontSize: 18 }}>👥</Text>}
                      value={analytics.followersCount}
                      label="Seguidores"
                    />
                  </View>
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="news"
                      icon={<Text style={{ fontSize: 18 }}>📣</Text>}
                      value={analytics.postsCount}
                      label="Publicações"
                    />
                  </View>
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="simulado"
                      icon={<Text style={{ fontSize: 18 }}>❤️</Text>}
                      value={analytics.totalLikes}
                      label="Curtidas totais"
                    />
                  </View>
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="notas"
                      icon={<Text style={{ fontSize: 18 }}>🔁</Text>}
                      value={analytics.totalShares}
                      label="Compartilhamentos"
                    />
                  </View>
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="goal"
                      icon={<Text style={{ fontSize: 18 }}>👁</Text>}
                      value={analytics.totalStoryViews}
                      label="Visualizações stories"
                    />
                  </View>
                  <View style={{ flexBasis: '47%', flexGrow: 1 }}>
                    <StatCard
                      tone="progress"
                      icon={<Text style={{ fontSize: 18 }}>⚡</Text>}
                      value={analytics.last30DaysEngagement}
                      label="Engajamento 30d"
                    />
                  </View>
                </View>

                {analytics.topPostTitle && (
                  <View
                    style={{
                      marginTop: 14,
                      backgroundColor: T.acBg,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: T.accent + '40',
                      padding: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: T.muted,
                        fontSize: 10,
                        fontWeight: '700',
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Post de maior engajamento
                    </Text>
                    <Text
                      style={{
                        color: T.text,
                        fontSize: 13,
                        fontWeight: '700',
                      }}
                      numberOfLines={2}
                    >
                      {analytics.topPostTitle}
                    </Text>
                    <Text
                      style={{
                        color: T.accent,
                        fontSize: 11,
                        fontWeight: '700',
                        marginTop: 4,
                      }}
                    >
                      {analytics.topPostEngagement} interações (curtidas +
                      compartilhamentos)
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={{ color: T.muted, fontSize: 12 }}>
                Carregando métricas…
              </Text>
            )}
          </View>

          <View style={cd({ padding: 16 })}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={lbl}>📸 Stories (24h)</Text>
              <Text style={{ color: T.muted, fontSize: 11 }}>
                {stories.length} ativas
              </Text>
            </View>
            <Button
              onPress={() => setCreateStoryVisible(true)}
              variant="primary"
              size="md"
              fullWidth
            >
              + Nova story
            </Button>

            {storiesLoading && stories.length === 0 ? (
              <Text style={{ color: T.muted, marginTop: 12, fontSize: 12 }}>
                Carregando stories…
              </Text>
            ) : stories.length === 0 ? (
              <Text
                style={{
                  color: T.muted,
                  marginTop: 12,
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                Sem stories ativas. Compartilhe um momento da sua universidade
                — expira em 24h.
              </Text>
            ) : (
              <View
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {stories.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onLongPress={() => handleDeleteStory(s)}
                    delayLongPress={350}
                    style={{
                      width: 78,
                      aspectRatio: 9 / 16,
                      borderRadius: 12,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: T.border,
                      backgroundColor: T.card2,
                    }}
                  >
                    {s.imageUrl ? (
                      <Image
                        source={{ uri: s.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        right: 4,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: '700',
                          textShadowColor: 'rgba(0,0,0,0.6)',
                          textShadowRadius: 2,
                        }}
                      >
                        👁 {s.viewsCount}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <Text
                  style={{
                    color: T.muted,
                    fontSize: 10,
                    width: '100%',
                    marginTop: 4,
                  }}
                >
                  Toque e segure uma story para excluir.
                </Text>
              </View>
            )}
          </View>

          <View style={cd({ padding: 16 })}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={lbl}>📣 Publicações</Text>
              <Text style={{ color: T.muted, fontSize: 11 }}>
                {posts.length} no feed
              </Text>
            </View>
            <Button
              onPress={() => setCreatePostVisible(true)}
              variant="primary"
              size="md"
              fullWidth
            >
              + Nova publicação
            </Button>

            {postsLoading && posts.length === 0 ? (
              <Text
                style={{ color: T.muted, marginTop: 12, fontSize: 12 }}
              >
                Carregando publicações…
              </Text>
            ) : posts.length === 0 ? (
              <Text
                style={{
                  color: T.muted,
                  marginTop: 12,
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                Você ainda não publicou nada. Use o botão acima para
                anunciar inscrições, listas de obras, simulados ou notícias
                para quem segue sua universidade.
              </Text>
            ) : (
              <View style={{ marginTop: 12, gap: 8 }}>
                {posts.map(p => {
                  const tag = tagPalette[p.type] || tagPalette.news
                  return (
                    <View
                      key={p.id}
                      style={{
                        backgroundColor: T.card2,
                        borderColor: T.border,
                        borderWidth: 1,
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: tag.bg,
                            borderColor: tag.b,
                            borderWidth: 1,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 999,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ fontSize: 11 }}>{p.icon}</Text>
                          <Text
                            style={{
                              color: tag.tx,
                              fontSize: 10,
                              fontWeight: '700',
                            }}
                          >
                            {p.tag}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: T.muted,
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          {p.createdAt ? timeAgo(p.createdAt) : 'agora'}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: T.text,
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                        numberOfLines={2}
                      >
                        {p.title}
                      </Text>
                      <Text
                        style={{
                          color: T.sub,
                          fontSize: 12,
                          marginTop: 2,
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {p.body}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 8,
                        }}
                      >
                        <Text style={{ color: T.muted, fontSize: 11 }}>
                          ❤️ {p.likesCount} · 🔁 {p.sharesCount}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeletePost(p)}
                          hitSlop={6}
                        >
                          <Text
                            style={{
                              color: '#f87171',
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            Excluir
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CreatePostModal
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        uniId={universityId}
        onPublished={() => {
          refreshPosts()
          refreshAnalytics()
        }}
      />

      <CreateStoryModal
        visible={createStoryVisible}
        onClose={() => setCreateStoryVisible(false)}
        uniId={universityId}
        onPublished={() => {
          refreshStories()
          refreshAnalytics()
        }}
      />

      <EditModal
        editField={editField}
        editValue={editValue}
        setEditValue={setEditValue}
        onCancel={cancelEdit}
        onSave={handleSaveField}
        loading={loading}
        T={T}
        cd={cd}
      />
    </View>
  )
}

// Read-only field row with an "Editar" button. Module-level so its identity is
// stable across parent re-renders.
type EditableFieldProps = {
  label: string
  value: string
  placeholder?: string
  onEdit: () => void
  T: ThemeColors
  lbl: TextStyle
}

function EditableField({
  label,
  value,
  placeholder,
  onEdit,
  T,
  lbl,
}: EditableFieldProps) {
  return (
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
          onPress={onEdit}
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
}

// Edit overlay. Module-level so the TextInput keeps its identity (and focus)
// across re-renders triggered by typing.
const FIELD_LABELS: Record<Exclude<EditMode, null>, string> = {
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

const COLOR_OPTIONS = [
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

type EditModalProps = {
  editField: EditMode
  editValue: string
  setEditValue: (v: string) => void
  onCancel: () => void
  onSave: () => void
  loading: boolean
  T: ThemeColors
  cd: CardStyle
}

function EditModal({
  editField,
  editValue,
  setEditValue,
  onCancel,
  onSave,
  loading,
  T,
  cd,
}: EditModalProps) {
  if (!editField) return null

  const isMultiline =
    editField === 'description' ||
    editField === 'courses' ||
    editField === 'books'
  const isColor = editField === 'color'

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
          Editar {FIELD_LABELS[editField]}
        </Text>

        {isColor ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {COLOR_OPTIONS.map(c => (
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
            onPress={onCancel}
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
            onPress={onSave}
            disabled={loading}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              backgroundColor: T.accent,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
