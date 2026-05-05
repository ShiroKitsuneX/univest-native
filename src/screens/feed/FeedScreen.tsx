import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Pressable,
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
  onOpenCreator,
}) {
  const { T, isDark, brand, typography, shadow } = useTheme()
  const isInstitution = useAuthStore(s => s.isInstitution)()
  const TG = isDark ? TAG_D : TAG_L
  const urgencyTone = TG.alert

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
  // Use remote posts when present. Fall back to seed FEED only for users
  // who already follow universities — the seed posts reference USP/UNICAMP
  // and are useful preview content there. New users with zero follows see
  // the empty state CTA instead of fake demo posts.
  const feedItems = posts.length
    ? posts
    : fol.length > 0
      ? FEED
      : []

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

  // Just opens the share sheet. Counter increment happens once the user
  // actually picks a share target inside the modal — see App.tsx onShared.
  const shareItem = item => {
    onShare(item)
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
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
          />
        }
      >
        {/* Greeting and goal-driven countdown are student concepts and
            don't apply to institution accounts. Institutions enter Feed
            primarily to publish (FAB) and to see how their content
            renders alongside followed-uni stories. */}
        {!isInstitution && (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <HeroGreeting
              name={nome || 'aluno'}
              subtitle="Veja o que está acontecendo"
            />
          </View>
        )}

        {!isInstitution && upcoming.length > 0 && (
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
                            {(e.uni.name || '??').slice(0, 2).toUpperCase()}
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

        {!showSkeleton &&
          feedItems.length === 0 &&
          fol.length === 0 &&
          (isInstitution ? (
            <EmptyState
              icon="📣"
              title="Faça sua primeira publicação"
              description="Use o botão + abaixo para anunciar inscrições, listas de obras, simulados ou notícias para quem segue sua universidade."
              action={
                onOpenCreator ? (
                  <Button
                    onPress={onOpenCreator}
                    variant="primary"
                    size="md"
                  >
                    + Criar publicação
                  </Button>
                ) : undefined
              }
            />
          ) : (
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
          ))}

        {!showSkeleton && feedItems.length > 0 && (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {feedItems.map(item => {
              const tc = TG[item.type] || TG.news
              // Match on string-coerced ids — seed unis sometimes use
              // numeric ids while remote `posts.uniId` is always a string.
              // Strict `===` would silently miss the institution's own posts.
              const ui = unis.find(u => String(u.id) === String(item.uniId))
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

      {/* Institution authoring entry — floats above the feed list. The
          chooser sheet behind it picks between post and story composers. */}
      {isInstitution && onOpenCreator && (
        <Pressable
          onPress={onOpenCreator}
          accessibilityRole="button"
          accessibilityLabel="Criar publicação ou story"
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: brand.primary },
            shadow.primary,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
          hitSlop={8}
        >
          <Text style={styles.fabPlus}>+</Text>
        </Pressable>
      )}
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
  fab: {
    // Bottom-right floating action button. Sits above the tab bar height
    // (we keep it 24px from the bottom of the screen — the tab bar lives
    // outside this view's coordinate space because FeedScreen renders
    // inside Tab.Screen, so safe-area insets are already accounted for).
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -2,
  },
})
