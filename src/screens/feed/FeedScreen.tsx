import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { TAG_D, TAG_L } from '@/theme/palette'
import { FEED } from '@/data/feed'
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
import {
  Button,
  Card,
  EmptyState,
  FeedSkeleton,
  HeroGreeting,
  PressScale,
} from '@/shared/components'
import { useProfileStore } from '@/stores/profileStore'
import { PostCard } from '@/features/feed/components/PostCard'

export function FeedScreen({
  refreshing,
  onRefresh,
  goExplorar,
  onSelectUni,
  onShare,
}) {
  const { T, isDark, brand, typography } = useTheme()
  const TG = isDark ? TAG_D : TAG_L
  const urgencyTone = TG.alert

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

  const nome = useProfileStore(s => s.nome)

  const posts = usePostsStore(s => s.posts)
  const loaded = usePostsStore(s => s.loaded)
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

  // Skeleton appears while the live posts are loading and we haven't yet
  // fallen back to FEED seed data. The seed FEED is non-empty, so once
  // `feedItems` is populated we never render the skeleton again — only on
  // the initial cold load before `loaded` flips.
  const showSkeleton = !loaded && feedItems.length === 0

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StoriesStrip onStoryPress={handleStoryPress} goExplorar={goExplorar} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 30, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
            progressViewOffset={30}
          />
        }
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <HeroGreeting
            name={nome || 'aluno'}
            subtitle="Veja o que está acontecendo"
          />
        </View>

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
                  <PressScale
                    key={i}
                    onPress={() => {
                      const u = unis.find(x => x.id === e.uni.id)
                      if (u) onSelectUni(u)
                    }}
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
                  </PressScale>
                )
              })}
            </ScrollView>
          </View>
        )}

        {showSkeleton && <FeedSkeleton count={3} />}

        {!showSkeleton && feedItems.length === 0 && fol.length === 0 && (
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

        {!showSkeleton && feedItems.length > 0 && (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {feedItems.map(item => {
              const tc = TG[item.type] || TG.news
              const ui = unis.find(u => u.id === item.uniId)
              return (
                <PostCard
                  key={item.id}
                  post={item}
                  uni={ui}
                  liked={!!liked[item.id]}
                  saved={!!saved[item.id]}
                  tagColors={tc}
                  onToggleLike={() => toggleLike(item)}
                  onToggleSave={() =>
                    setSaved(p => ({ ...p, [item.id]: !p[item.id] }))
                  }
                  onShare={() => shareItem(item)}
                  onReport={() => reportItem(item)}
                  onOpenUni={ui ? () => onSelectUni(ui) : undefined}
                />
              )
            })}
          </View>
        )}
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
})
