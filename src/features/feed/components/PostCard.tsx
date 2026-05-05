import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { fmtCount, timeAgo } from '@/utils/format'
import {
  AnimatedHeart,
  Card,
  PressScale,
  SvgIcon,
} from '@/shared/components'
import { PostTag } from '@/features/feed/components/PostTag'
import type { Post } from '@/stores/postsStore'
import type { TagColor } from '@/theme/palette'
import type { University } from '@/stores/universitiesStore'

const BODY_PREVIEW_CHARS = 200

type Props = {
  post: Post
  uni?: University
  liked: boolean
  saved: boolean
  tagColors: TagColor
  onToggleLike: () => void
  onToggleSave: () => void
  onShare: () => void
  onReport: () => void
  // Optional — when supplied, tapping the avatar / uni name navigates.
  onOpenUni?: () => void
}

// Extracted post-card so animations and menu state stay scoped per item.
// Using one shared `menuOpenFor` in the parent forced a re-render of the
// whole feed every time a menu opened/closed and made the per-card popup
// position fragile. Local state is the right granularity here.
export function PostCard({
  post,
  uni,
  liked,
  saved,
  tagColors,
  onToggleLike,
  onToggleSave,
  onShare,
  onReport,
  onOpenUni,
}: Props) {
  const { T, brand, radius, typography } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const bookmarkScale = useRef(new Animated.Value(1)).current
  // Mount entrance — fade up from opacity 0 / +6px so newly-rendered posts
  // settle in instead of popping. Cheap (one-shot, opacity+translateY).
  const mountOpacity = useRef(new Animated.Value(0)).current
  const mountTranslate = useRef(new Animated.Value(6)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(mountTranslate, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }),
    ]).start()
  }, [])

  const animateBookmark = () => {
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }),
    ]).start()
  }

  const handleSave = () => {
    if (!saved) animateBookmark()
    onToggleSave()
  }

  const body = post.body || ''
  const isLong = body.length > BODY_PREVIEW_CHARS
  const visibleBody = !expanded && isLong
    ? body.slice(0, BODY_PREVIEW_CHARS).trimEnd() + '…'
    : body

  return (
    <Animated.View
      style={{
        opacity: mountOpacity,
        transform: [{ translateY: mountTranslate }],
      }}
    >
      <Card
        padding={0}
        radius={radius.lg}
        style={{
          borderLeftWidth: 4,
          borderLeftColor: uni?.color || brand.primary,
          overflow: 'visible',
        }}
      >
        {/* Header — avatar + name + time + tag + ⋯ menu */}
        <View style={styles.postHeader}>
          <PressScale onPress={onOpenUni} disabled={!onOpenUni}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                // Always render a coloured tile when we have a uni record —
                // fall back to the brand violet rather than the muted
                // card2 so an institution post never looks "empty". When
                // the institution has uploaded a `logoUrl`, the image
                // replaces the initials inside the same coloured tile.
                backgroundColor: uni
                  ? uni.color || brand.primary
                  : T.card2,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: T.border,
                overflow: 'hidden',
              }}
            >
              {uni?.logoUrl ? (
                <Image
                  source={{ uri: uni.logoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '800',
                  }}
                >
                  {(uni?.name || post.uni || '')
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              )}
            </View>
          </PressScale>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontSize: 14, fontWeight: '700' }}>
              {post.uni}
            </Text>
            <Text style={[typography.caption, { color: T.muted }]}>
              {post.time || timeAgo(post.createdAt)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setMenuOpen(o => !o)}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              style={styles.menuButton}
            >
              <Text style={{ color: T.muted, fontSize: 18 }}>⋯</Text>
            </TouchableOpacity>
            {post.tag ? <PostTag tag={post.tag} colors={tagColors} /> : null}
          </View>
        </View>

        {/* Optional image — rendered only when present, full-width inside the
            card with rounded inner corners that match the card radius. */}
        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={[styles.image, { backgroundColor: T.card2 }]}
            resizeMode="cover"
          />
        ) : null}

        {/* Body block — tap-to-expand for long posts. */}
        <Pressable
          onPress={() => isLong && setExpanded(e => !e)}
          style={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {!!post.title && (
            <Text
              style={[
                typography.headline,
                { color: T.text, marginBottom: 6, lineHeight: 22 },
              ]}
            >
              {post.title}
            </Text>
          )}
          <Text style={{ color: T.sub, fontSize: 13, lineHeight: 20 }}>
            {visibleBody}
          </Text>
          {isLong && (
            <Text
              style={{
                color: brand.primary,
                fontSize: 12,
                fontWeight: '700',
                marginTop: 6,
              }}
            >
              {expanded ? 'Mostrar menos' : 'Ler mais'}
            </Text>
          )}
        </Pressable>

        {/* Footer — like / share / saved. Comments are intentionally omitted
            for now: the data layer doesn't track them yet, and showing a
            non-functional comment count would mislead. */}
        <View style={[styles.postFooter, { borderTopColor: T.border }]}>
          <TouchableOpacity
            onPress={onToggleLike}
            style={styles.actionBtn}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <AnimatedHeart active={liked} inactiveColor={T.muted} />
            <Text
              style={{
                color: liked ? '#F87171' : T.muted,
                fontSize: 12,
                fontWeight: '600',
                marginLeft: 6,
              }}
            >
              {fmtCount(Math.max(0, post.likesCount ?? post.likes ?? 0))}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            style={styles.actionBtn}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
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
              {fmtCount(post.sharesCount || 0)}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={handleSave}
            style={{ paddingHorizontal: 4, paddingVertical: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <SvgIcon
                name="bookmark"
                size={20}
                color={saved ? brand.primary : T.muted}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Floating menu popup — local state means it overlays only this card.
          Backdrop is a transparent invisible Pressable that closes on tap. */}
      {menuOpen && (
        <>
          <Pressable
            onPress={() => setMenuOpen(false)}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              styles.menuPopup,
              {
                backgroundColor: T.card,
                borderColor: T.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <MenuItem
              icon="🔗"
              label="Copiar link"
              onPress={() => {
                setMenuOpen(false)
                onShare()
              }}
              T={T}
            />
            <View style={[styles.menuDivider, { backgroundColor: T.border }]} />
            <MenuItem
              icon="🚩"
              label="Reportar"
              danger
              onPress={() => {
                setMenuOpen(false)
                onReport()
              }}
              T={T}
            />
          </View>
        </>
      )}
    </Animated.View>
  )
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
  T,
}: {
  icon: string
  label: string
  onPress: () => void
  danger?: boolean
  T: ReturnType<typeof useTheme>['T']
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text
        style={{
          color: danger ? '#DC2626' : T.text,
          fontSize: 13,
          fontWeight: '600',
          marginLeft: 10,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  menuButton: {
    padding: 4,
    paddingTop: 0,
  },
  image: {
    width: '100%',
    height: 200,
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
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 4,
  },
  menuPopup: {
    position: 'absolute',
    right: 16,
    top: 44,
    minWidth: 160,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuDivider: {
    height: 1,
    marginVertical: 2,
  },
})
