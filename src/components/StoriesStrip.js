import { View, Text, ScrollView, TouchableOpacity, Appearance } from "react-native";
import { DK, LT } from "../theme/palette";
import { useStoriesStore } from "../stores/storiesStore";
import { useProfileStore } from "../stores/profileStore";
import { useUniversitiesStore } from "../stores/universitiesStore";
import { StoryCircle } from "./StoryCircle";

export function StoriesStrip({ onStoryPress, onAddStoryPress, goExplorar }) {
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  
  const stories = useStoriesStore(s => s.stories);
  const viewedIds = useStoriesStore(s => s.viewedIds);
  const isViewed = useStoriesStore(s => s.isViewed);
  const fol = useUniversitiesStore(s => s.unis).filter(u => u.followed);

  const groupedStories = stories.reduce((acc, story) => {
    const existing = acc.find(g => g.uniId === story.uniId);
    if (existing) {
      existing.stories.push(story);
      const ts = new Date(story.createdAt).getTime();
      if (ts > existing.latestTimestamp) existing.latestTimestamp = ts;
    } else {
      acc.push({
        uniId: story.uniId,
        uniName: story.uniName,
        uniColor: story.uniColor,
        stories: [story],
        latestTimestamp: new Date(story.createdAt).getTime(),
      });
    }
    return acc;
  }, []);

  groupedStories.sort((a, b) => b.latestTimestamp - a.latestTimestamp);

  if (groupedStories.length === 0 && fol.length === 0) {
    return null;
  }

  const hasUnviewed = (uniId) => {
    const group = groupedStories.find(g => g.uniId === uniId);
    if (!group) return false;
    return group.stories.some(s => !viewedIds[s.id]);
  };

  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ color: T.text, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
          SEUS STORIES
        </Text>
        <View style={{ flex: 1 }} />
        {fol.length > 0 && (
          <TouchableOpacity onPress={onAddStoryPress} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: T.accent, fontSize: 12, fontWeight: "600" }}>+Novo</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
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
          <TouchableOpacity onPress={goExplorar} style={{ alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: T.card2,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: T.border,
                borderStyle: "dashed",
              }}
            >
              <Text style={{ color: T.sub, fontSize: 24 }}>+</Text>
            </View>
            <Text
              style={{
                color: T.sub,
                fontSize: 10,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              Seguir
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}