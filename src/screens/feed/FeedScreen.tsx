import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
import { Button, Card, EmptyState, SvgIcon } from '@/shared/components'

export function FeedScreen({
  refreshing,
  onRefresh,
  goExplorar,
  onSelectUni,
  onShare,
}) {
  const { T, isDark, brand, radius, typography } = useTheme()
  const TG = isDark ? TAG_D : TAG_L

  // Urgency tone for the upcoming-exam countdown chip when ≤ 30 days. We use
  // the alert tag colour (warm amber/orange) so it reads at a glance without
  // introducing a new red palette that doesn't exist elsewhere.
  const urgencyTone = TG.alert

  const stories = useStoriesStore(s => s.stories)
  const loadStories = useStoriesStore(s => s.load)

  const [viewerVisible, setViewerVisible] = useState(false)
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [menuOpenFor, setMenuOpenFor] = useState<string | number | null>(null)

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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
            colors={[brand.primary]}
          />
        }
      >
        <StoriesStrip onStoryPress={handleStoryPress} goExplorar={goExplorar} />
        {upcoming.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text
              style={[
                typography.eyebrow,
                { color: brand.primary, marginBottom: 12 },
              ]}
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
                    activeOpacity={0.85}
                    style={{ marginRight: 12 }}
                  >
                    <Card
                      tone={urgent ? 'highlight' : 'default'}
                      padding={14}
                      style={{
                        minWidth: 132,
                        backgroundColor: urgent ? urgencyTone.bg : T.card,
                        borderColor: urgent ? urgencyTone.b : T.border,
                      }}
                    >
                      <View style={styles.upcomingHeader}>
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
                              color: '#FFFFFF',
                              fontSize: 9,
                              fontWeight: '800',
                            }}
                          >
                            {e.uni.name.slice(0, 2)}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: T.sub,
                            fontSize: 11,
                            fontWeight: '600',
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {e.uni.name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: urgent ? urgencyTone.tx : T.text,
                          fontSize: 28,
                          fontWeight: '900',
                          letterSpacing: -1,
                        }}
                      >
                        {e.daysUntil}d
                      </Text>
                      <Text
                        style={[typography.caption, { color: T.muted }]}
                        numberOfLines={1}
                      >
                        {e.name || 'Prova'}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}
        {feedItems.length === 0 && fol.length === 0 && (
          <EmptyState
            icon="🎓"
            title="Seu feed está vazio"
            description="Siga universidades para ver novidades, datas e notas de corte."
            action={
              <Button onPress={goExplorar} variant="primary" size="md">
                Explorar universidades
              </Button>
            }
          />
        )}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          {feedItems.map(item => {
            const tc = TG[item.type] || TG.news
            const isL = liked[item.id]
            const isS = saved[item.id]
            const ui = unis.find(u => u.id === item.uniId)
            return (
              <Card
                key={item.id}
                padding={0}
                radius={radius.lg}
                style={{
                  overflow: 'hidden',
                  borderLeftWidth: 4,
                  borderLeftColor: ui?.color || brand.primary,
                }}
              >
                <View style={styles.postHeader}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: ui?.color || T.card2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: T.border,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {ui?.name?.slice(0, 2) || ''}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: T.text, fontSize: 14, fontWeight: '700' }}
                    >
                      {item.uni}
                    </Text>
                    <Text style={[typography.caption, { color: T.muted }]}>
                      {item.time || timeAgo(item.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: tc.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: radius.full,
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
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        setMenuOpenFor(menuOpenFor === item.id ? null : item.id)
                      }
                      style={{ padding: 4 }}
                    >
                      <Text style={{ color: T.muted, fontSize: 16 }}>⋯</Text>
                    </TouchableOpacity>
                    {menuOpenFor === item.id && (
                      <View
                        style={[
                          styles.postMenu,
                          { backgroundColor: T.card, borderColor: T.border },
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setMenuOpenFor(null)
                            reportItem(item)
                          }}
                          style={{ paddingVertical: 10, paddingHorizontal: 16 }}
                        >
                          <Text style={{ color: T.text, fontSize: 14 }}>
                            🚩 Reportar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                  <Text
                    style={[
                      typography.headline,
                      { color: T.text, marginBottom: 6, lineHeight: 22 },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ color: T.sub, fontSize: 13, lineHeight: 20 }}>
                    {item.body}
                  </Text>
                </View>
                <View style={[styles.postFooter, { borderTopColor: T.border }]}>
                  <TouchableOpacity
                    onPress={() => toggleLike(item)}
                    style={styles.actionBtn}
                  >
                    <SvgIcon
                      name="heart"
                      size={18}
                      color={isL ? '#F87171' : T.muted}
                    />
                    <Text
                      style={{
                        color: isL ? '#F87171' : T.muted,
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
                    style={styles.actionBtn}
                  >
                    <SvgIcon name="shareSocial" size={18} color={T.muted} />
                    <Text
                      style={{
                        color: T.muted,
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
                    style={styles.actionBtn}
                  >
                    <SvgIcon name="flag" size={18} color={T.muted} />
                    <Text
                      style={{
                        color: T.muted,
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
                      color={isS ? brand.primary : T.muted}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
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

const styles = StyleSheet.create({
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  postMenu: {
    position: 'absolute',
    right: 8,
    top: 30,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 4,
  },
})
