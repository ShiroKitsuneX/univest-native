import { useCallback, useEffect, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { TAG_D, TAG_L } from '@/theme/palette'
import { useAuthStore } from '@/stores/authStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { fmtCount, timeAgo } from '@/utils/format'
import {
  EmptyState,
  HeroGreeting,
  StatCard,
} from '@/shared/components'
import {
  loadInstitutionAnalytics,
  type InstitutionAnalytics,
  type RankedPost,
} from '@/features/institution/services/institutionAnalyticsService'
import { logger } from '@/core/logging/logger'

// Dedicated dashboard for institution accounts. Replaces the (hidden)
// Notas tab — students get grades and cut-offs there; institutions get
// reach + engagement here.
//
// Reads come exclusively through `loadInstitutionAnalytics` (a pure
// orchestration over existing repositories — no new collections), so the
// screen is safe to mount on every focus + refresh.
export function InstitutionAnalyticsScreen() {
  const { T, isDark, brand, radius, typography } = useTheme()
  const tagPalette = isDark ? TAG_D : TAG_L

  const linkedUniId = useAuthStore(s => s.getLinkedUniId)()
  const unis = useUniversitiesStore(s => s.unis)
  const uni = unis.find(u => String(u.id) === String(linkedUniId))

  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    if (!linkedUniId) return
    try {
      const data = await loadInstitutionAnalytics(linkedUniId)
      setAnalytics(data)
    } catch (e) {
      logger.warn('analytics load:', (e as Error)?.message)
    }
  }, [linkedUniId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  if (!analytics) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          padding: 20,
          justifyContent: 'center',
        }}
      >
        <EmptyState
          icon="📊"
          title="Carregando análises..."
          description="Estamos somando seus seguidores, posts e engajamento."
        />
      </View>
    )
  }

  const noActivity =
    analytics.postsCount === 0 && analytics.followersCount === 0

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={brand.primary}
        />
      }
    >
      <HeroGreeting
        name={uni?.name || 'sua universidade'}
        subtitle="Como o seu conteúdo está performando"
      />

      {noActivity ? (
        <View style={{ marginTop: 32 }}>
          <EmptyState
            icon="🚀"
            title="Nada por aqui ainda"
            description="Publique seu primeiro post pelo botão + na aba Feed. Os números começam a aparecer assim que alguém interagir."
          />
        </View>
      ) : (
        <>
          {/* Top KPIs — same six tiles as the previous embed in the admin
              screen, kept consistent so the institution learns one layout. */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <StatCard
                tone="progress"
                icon={<Text style={{ fontSize: 18 }}>👥</Text>}
                value={fmtCount(analytics.followersCount)}
                label="Seguidores"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                tone="news"
                icon={<Text style={{ fontSize: 18 }}>📣</Text>}
                value={analytics.postsCount}
                label="Publicações"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                tone="simulado"
                icon={<Text style={{ fontSize: 18 }}>❤️</Text>}
                value={fmtCount(analytics.totalLikes)}
                label="Curtidas totais"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                tone="notas"
                icon={<Text style={{ fontSize: 18 }}>🔁</Text>}
                value={fmtCount(analytics.totalShares)}
                label="Compartilhamentos"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                tone="goal"
                icon={<Text style={{ fontSize: 18 }}>👁</Text>}
                value={fmtCount(analytics.totalStoryViews)}
                label="Views em stories"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                tone="progress"
                icon={<Text style={{ fontSize: 18 }}>⚡</Text>}
                value={fmtCount(analytics.last30DaysEngagement)}
                label="Engajamento 30d"
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              backgroundColor: T.acBg,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: brand.primary + '40',
              padding: 14,
            }}
          >
            <Text style={[typography.eyebrow, { color: T.muted }]}>
              MÉDIA POR POST
            </Text>
            <Text
              style={{
                color: T.text,
                fontSize: 28,
                fontWeight: '900',
                marginTop: 2,
                letterSpacing: -0.6,
              }}
            >
              {analytics.averageEngagementPerPost}
              <Text style={{ color: T.sub, fontSize: 13, fontWeight: '700' }}>
                {'  '}interações
              </Text>
            </Text>
            <Text
              style={{
                color: T.muted,
                fontSize: 11,
                marginTop: 4,
                lineHeight: 16,
              }}
            >
              Curtidas + compartilhamentos divididos pelo número total de
              publicações da sua universidade.
            </Text>
          </View>

          {analytics.topPosts.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={[
                  typography.eyebrow,
                  { color: T.muted, marginBottom: 10 },
                ]}
              >
                TOP POSTS POR ENGAJAMENTO
              </Text>
              {analytics.topPosts.map((post, idx) => (
                <TopPostRow
                  key={post.id}
                  post={post}
                  rank={idx + 1}
                  tagPalette={tagPalette}
                />
              ))}
            </View>
          )}

          <View
            style={{
              marginTop: 24,
              padding: 14,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.card,
            }}
          >
            <Text style={[typography.eyebrow, { color: T.muted }]}>
              STORIES
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 8,
                gap: 24,
              }}
            >
              <View>
                <Text
                  style={{
                    color: T.text,
                    fontSize: 22,
                    fontWeight: '900',
                  }}
                >
                  {analytics.activeStoriesCount}
                </Text>
                <Text style={{ color: T.sub, fontSize: 11, fontWeight: '600' }}>
                  ativas (24h)
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: T.text,
                    fontSize: 22,
                    fontWeight: '900',
                  }}
                >
                  {fmtCount(analytics.totalStoryViews)}
                </Text>
                <Text style={{ color: T.sub, fontSize: 11, fontWeight: '600' }}>
                  visualizações
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: T.muted,
                fontSize: 11,
                marginTop: 10,
                lineHeight: 16,
              }}
            >
              Stories expiram automaticamente após 24h. Use o botão{' '}
              <Text style={{ color: brand.primary, fontWeight: '700' }}>+</Text>
              {' '}na aba Feed para publicar.
            </Text>
          </View>

          <Text
            style={{
              color: T.muted,
              fontSize: 11,
              textAlign: 'center',
              marginTop: 20,
              lineHeight: 16,
            }}
          >
            Em breve: gráfico de seguidores ao longo do tempo e segmentação
            por categoria de post.
          </Text>
        </>
      )}
    </ScrollView>
  )
}

function TopPostRow({
  post,
  rank,
  tagPalette,
}: {
  post: RankedPost
  rank: number
  tagPalette: typeof TAG_D
}) {
  const { T, brand, radius } = useTheme()
  const tag = tagPalette[post.type] || tagPalette.news
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: T.card,
        borderColor: T.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>
          #{rank}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              backgroundColor: tag.bg,
              borderColor: tag.b,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: tag.tx,
                fontSize: 9,
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              {post.tag}
            </Text>
          </View>
          <Text style={{ color: T.muted, fontSize: 10, fontWeight: '600' }}>
            {post.createdAt ? timeAgo(post.createdAt) : ''}
          </Text>
        </View>
        <Text
          style={{ color: T.text, fontSize: 13, fontWeight: '700' }}
          numberOfLines={2}
        >
          {post.title}
        </Text>
        <Text
          style={{
            color: T.sub,
            fontSize: 11,
            marginTop: 2,
            fontWeight: '600',
          }}
        >
          ❤️ {post.likesCount} · 🔁 {post.sharesCount} ·{' '}
          <Text style={{ color: brand.primary, fontWeight: '800' }}>
            {post.engagement} interações
          </Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
})
