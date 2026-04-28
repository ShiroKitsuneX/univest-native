import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useStoriesStore, type Story } from '@/stores/storiesStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { StoryCircle } from '@/components/StoryCircle'
import { useTheme } from '@/theme/useTheme'

type Group = {
  uniId: string
  uniName: string
  uniColor: string
  stories: Story[]
  latestTimestamp: number
}

type Props = {
  onStoryPress: (group: Group) => void
  goExplorar: () => void
}

export function StoriesStrip({ onStoryPress, goExplorar }: Props) {
  const stories = useStoriesStore(s => s.stories)
  const viewedIds = useStoriesStore(s => s.viewedIds)
  const getFollowedUnis = useUniversitiesStore(s => s.getFollowedUnis)
  const fol = getFollowedUnis()
  const { T, brand } = useTheme()

  const groupedStories = stories.reduce<Group[]>((acc, story) => {
    const existing = acc.find(g => g.uniId === story.uniId)
    if (existing) {
      existing.stories.push(story)
      const ts = new Date(story.createdAt).getTime()
      if (ts > existing.latestTimestamp) existing.latestTimestamp = ts
    } else {
      acc.push({
        uniId: story.uniId,
        uniName: story.uniName,
        uniColor: story.uniColor,
        stories: [story],
        latestTimestamp: new Date(story.createdAt).getTime(),
      })
    }
    return acc
  }, [])

  groupedStories.sort((a, b) => b.latestTimestamp - a.latestTimestamp)

  if (groupedStories.length === 0 && fol.length === 0) {
    return null
  }

  const hasUnviewed = (uniId: string): boolean => {
    const group = groupedStories.find(g => g.uniId === uniId)
    if (!group) return false
    return group.stories.some(s => !viewedIds[s.id])
  }

  return (
    <View style={{ paddingVertical: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: 1,
          justifyContent: groupedStories.length <= 4 ? 'center' : 'flex-start',
        }}
      >
        {groupedStories.map(group => (
          <StoryCircle
            key={group.uniId}
            uniName={group.uniName}
            uniColor={group.uniColor}
            isViewed={!hasUnviewed(group.uniId)}
            onPress={() => onStoryPress(group)}
          />
        ))}
        {fol.length > 0 && groupedStories.length < 6 && (
          <TouchableOpacity
            onPress={goExplorar}
            style={{ alignItems: 'center', marginRight: 14, width: 76 }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: T.acBg,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: brand.primary,
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  color: brand.primary,
                  fontSize: 28,
                  fontWeight: '300',
                }}
              >
                +
              </Text>
            </View>
            <Text
              style={{
                color: T.sub,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 6,
              }}
            >
              Seguir
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}
