import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { TAG_D, TAG_L } from '@/theme/palette'
import { FEED } from '@/data/feed'
import { timeAgo, fmtCount } from '@/utils/format'
import { getMonthFromExamLabel } from '@/utils/dates'
import { usePostsStore } from '@/stores/postsStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useAuthStore } from '@/stores/authStore'
import { useStoriesStore } from '@/stores/storiesStore'
import { StoriesStrip } from '@/components/StoriesStrip'
import { StoryViewer } from '@/components/StoryViewer'
import {
  togglePostLike,
  reportPost,
  incrementShareCount,
} from '@/features/feed/services/feedService'
import { SvgIcon } from '@/shared/components/SvgIcon'

const COLORS = {
  glassBg: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',
}

export function FeedScreen({
  refreshing,
  onRefresh,
  goExplorar,
  onSelectUni,
  onShare,
}) {
  const { T, isDark } = useTheme()
  const TG = isDark ? TAG_D : TAG_L

  const stories = useStoriesStore(s => s.stories)
  const loadStories = useStoriesStore(s => s.load)

  const [viewerVisible, setViewerVisible] = useState(false)
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)

  useEffect(() => {
    loadStories()
  }, [])

  const handleStoryPress = group => {
    setSelectedStoryGroup(group)
    setSelectedStoryIndex(0)
    setViewerVisible(true)
  }

  const handleCloseViewer = () => {
    setViewerVisible(false)
    setSelectedStoryGroup(null)
  }

  const posts = usePostsStore(s => s.posts)
  const liked = usePostsStore(s => s.liked)
  const setLiked = usePostsStore(s => s.setLiked)
  const saved = usePostsStore(s => s.saved)
  const setSaved = usePostsStore(s => s.setSaved)

  const unis = useUniversitiesStore(s => s.unis)
  const uniSort = useUniversitiesStore(s => s.uniSort)
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs)
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis)

  const currentUser = useAuthStore(s => s.currentUser)

  const cd = (extra = {}) => ({
    backgroundColor: COLORS.glassBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...extra,
  })

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
  const feedItems = posts.length ? posts : FEED

  const upcoming = useMemo(
    () =>
      goalsUnis
        .flatMap(g =>
          (g.exams || [])
            .filter(e => e.status === 'upcoming')
            .map(e => ({ ...e, uni: g }))
        )
        .map(e => {
          const dateNum = e.date ? new Date(e.date).getTime() : 0
          const nowNum = new Date().getTime()
          return {
            ...e,
            daysUntil: Math.ceil((dateNum - nowNum) / 86400000),
          }
        })
        .filter(e => e.daysUntil >= 0 && e.daysUntil <= 180)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5),
    [goalsUnis]
  )

  const toggleLike = item => {
    if (!currentUser) {
      Alert.alert('Atenção', 'Faça login para curtir')
      return
    }
    const newLiked = !liked[item.id]
    setLiked(p => ({ ...p, [item.id]: newLiked }))
    usePostsStore.getState().setLikeDelta(item.id, newLiked ? 1 : -1)
    ;(async () => {
      try {
        await togglePostLike(item.id, currentUser.uid, newLiked)
      } catch {}
    })()
  }

  const shareItem = item => {
    onShare(item)
    usePostsStore.getState().setShareDelta(item.id, 1)
    incrementShareCount(item.id).catch(() => {})
  }

  const reportItem = item => {
    Alert.alert(
      'Reportar',
      'Deseja reportar esta publicação?\n\nNosso time irá analisar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportPost({
                postId: item.id,
                postTitle: item.title,
                reportedBy: currentUser?.uid || 'anon',
                reason: 'user_report',
              })
            } catch {}
            Alert.alert('Obrigado!', 'Report enviado para análise.')
          },
        },
      ]
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A855F7"
            colors={['#A855F7']}
          />
        }
      >
        <StoriesStrip onStoryPress={handleStoryPress} goExplorar={goExplorar} />
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.glassBorder,
            marginBottom: 16,
          }}
        />
        {upcoming.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text
              style={{
                color: '#A855F7',
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              ⏳ Próximas provas
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {upcoming.map((e, i) => {
                const urgent = e.daysUntil <= 30
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      const u = unis.find(x => x.id === e.uni.id)
                      if (u) onSelectUni(u)
                    }}
                    style={{
                      minWidth: 120,
                      marginRight: 12,
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor: urgent
                        ? 'rgba(239,68,68,0.15)'
                        : COLORS.glassBg,
                      borderWidth: 1,
                      borderColor: urgent
                        ? 'rgba(239,68,68,0.3)'
                        : COLORS.glassBorder,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: e.uni.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: '800',
                          }}
                        >
                          {e.uni.name.slice(0, 2)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: '#8b949e',
                          fontSize: 11,
                          fontWeight: '600',
                        }}
                        numberOfLines={1}
                      >
                        {e.uni.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: urgent ? '#ef4444' : '#e6edf3',
                        fontSize: 28,
                        fontWeight: '900',
                      }}
                    >
                      {e.daysUntil}d
                    </Text>
                    <Text
                      style={{
                        color: '#6b7280',
                        fontSize: 11,
                        fontWeight: '500',
                      }}
                      numberOfLines={1}
                    >
                      {e.name || 'Prova'}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}
        {feedItems.length === 0 && fol.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}
          >
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🎓</Text>
            <Text
              style={{
                color: '#e6edf3',
                fontSize: 20,
                fontWeight: '800',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Seu feed está vazio
            </Text>
            <Text
              style={{
                color: '#8b949e',
                fontSize: 14,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Siga universidades para ver novidades, datas e notas de corte.
            </Text>
            <TouchableOpacity
              onPress={goExplorar}
              style={{
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 24,
                backgroundColor: '#8B5CF6',
                borderWidth: 1,
                borderColor: '#A855F7',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                Explorar universidades
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          {feedItems.map(item => {
            const tc = TG[item.type] || TG.news
            const isL = liked[item.id]
            const isS = saved[item.id]
            const ui = unis.find(u => u.id === item.uniId)
            return (
              <View
                key={item.id}
                style={{
                  ...cd({ overflow: 'hidden' }),
                  borderLeftWidth: 4,
                  borderLeftColor: ui?.color || '#8B5CF6',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    paddingBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: ui?.color || '#1c2333',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: COLORS.glassBorder,
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}
                    >
                      {ui?.name?.slice(0, 2) || ''}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: '#e6edf3',
                        fontSize: 14,
                        fontWeight: '700',
                      }}
                    >
                      {item.uni}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {item.time || timeAgo(item.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: tc.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: tc.b,
                    }}
                  >
                    <Text
                      style={{ color: tc.tx, fontSize: 11, fontWeight: '700' }}
                    >
                      {item.icon} {item.tag}
                    </Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                  <Text
                    style={{
                      color: '#e6edf3',
                      fontSize: 15,
                      fontWeight: '700',
                      marginBottom: 8,
                      lineHeight: 22,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ color: '#9ca3af', fontSize: 13, lineHeight: 20 }}
                  >
                    {item.body}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingBottom: 14,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderColor: COLORS.glassBorder,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleLike(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      marginRight: 4,
                    }}
                  >
                    <SvgIcon
                      name={isL ? 'heart' : 'heart'}
                      size={18}
                      color={isL ? '#f87171' : '#6b7280'}
                    />
                    <Text
                      style={{
                        color: isL ? '#f87171' : '#6b7280',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      {fmtCount(
                        Math.max(0, item.likesCount ?? item.likes ?? 0)
                      )}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => shareItem(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      marginRight: 4,
                    }}
                  >
                    <SvgIcon name="shareSocial" size={18} color="#6b7280" />
                    <Text
                      style={{
                        color: '#6b7280',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      {fmtCount(item.sharesCount || 0)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => reportItem(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <SvgIcon name="flag" size={18} color="#6b7280" />
                    <Text
                      style={{
                        color: '#6b7280',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      Reportar
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() =>
                      setSaved(p => ({ ...p, [item.id]: !p[item.id] }))
                    }
                    style={{ paddingHorizontal: 4 }}
                  >
                    <SvgIcon
                      name="bookmark"
                      size={20}
                      color={isS ? '#A855F7' : '#6b7280'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
      <StoryViewer
        visible={viewerVisible}
        stories={selectedStoryGroup?.stories || []}
        initialIndex={selectedStoryIndex}
        onClose={handleCloseViewer}
      />
    </View>
  )
}
