import {
  View, Text, TouchableOpacity, ScrollView, Appearance, Alert, RefreshControl,
} from "react-native";
import {
  doc, setDoc, deleteDoc, updateDoc, increment, addDoc, collection, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { DK, LT, TAG_D, TAG_L } from "../../theme/palette";
import { FEED } from "../../data/feed";
import { timeAgo, fmtCount } from "../../utils/format";
import { getMonthFromKey } from "../../utils/dates";
import { saveLocalUserData } from "../../services/storage";
import { useProfileStore } from "../../stores/profileStore";
import { usePostsStore } from "../../stores/postsStore";
import { useUniversitiesStore } from "../../stores/universitiesStore";
import { useAuthStore } from "../../stores/authStore";

export function FeedScreen({ refreshing, onRefresh, goExplorar, onSelectUni, onShare, currentData }) {
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const TG = isDark ? TAG_D : TAG_L;

  const posts = usePostsStore(s => s.posts);
  const liked = usePostsStore(s => s.liked);
  const setLiked = usePostsStore(s => s.setLiked);
  const saved = usePostsStore(s => s.saved);
  const setSaved = usePostsStore(s => s.setSaved);

  const unis = useUniversitiesStore(s => s.unis);
  const uniSort = useUniversitiesStore(s => s.uniSort);
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs);
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis);

  const currentUser = useAuthStore(s => s.currentUser);

  const cd = (extra = {}) => ({ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, ...extra });

  const fol = unis.filter(u => u.followed).sort((a, b) => {
    if (uniSort === "pref") return (uniPrefs[b.id] || 5) - (uniPrefs[a.id] || 5);
    const gm = s => getMonthFromKey(s?.match(/[A-Z]{3}/)?.[0] || "DEZ");
    return gm(a.prova) - gm(b.prova);
  });
  const feedItems = posts.length ? posts : FEED;

  const upcoming = goalsUnis.flatMap(g => (g.exams || []).filter(e => e.status === "upcoming").map(e => ({ ...e, uni: g })))
    .map(e => ({ ...e, daysUntil: Math.ceil((new Date(e.date) - new Date()) / 86400000) }))
    .filter(e => e.daysUntil >= 0 && e.daysUntil <= 180)
    .sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);

  const toggleLike = (item) => {
    if (!currentUser) { Alert.alert("Atenção", "Faça login para curtir"); return; }
    const newLiked = !liked[item.id];
    setLiked(p => ({ ...p, [item.id]: newLiked }));
    usePostsStore.getState().setLikeDelta(item.id, newLiked ? 1 : -1);
    saveLocalUserData(currentData());
    (async () => {
      try {
        const postRef = doc(db, "posts", item.id);
        const lkRef = doc(db, "posts", item.id, "likes", currentUser.uid);
        if (newLiked) { await setDoc(lkRef, { timestamp: serverTimestamp() }); await updateDoc(postRef, { likesCount: increment(1) }); }
        else { await deleteDoc(lkRef); await updateDoc(postRef, { likesCount: increment(-1) }); }
      } catch {}
    })();
  };

  const shareItem = (item) => {
    onShare(item);
    usePostsStore.getState().setShareDelta(item.id, 1);
    updateDoc(doc(db, "posts", item.id), { sharesCount: increment(1) }).catch(() => {});
  };

  const reportItem = (item) => {
    Alert.alert("Reportar", "Deseja reportar esta publicação?\n\nNosso time irá analisar.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Reportar", style: "destructive", onPress: async () => {
        try {
          await addDoc(collection(db, "reports"), {
            postId: item.id, postTitle: item.title, reportedBy: currentUser?.uid || "anon",
            reason: "user_report", createdAt: serverTimestamp(),
          });
        } catch {}
        Alert.alert("Obrigado!", "Report enviado para análise.");
      } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        {fol.map(u => (
          <TouchableOpacity key={u.id} onPress={() => onSelectUni(u)} style={{ alignItems: "center", marginRight: 12 }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: u.color, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: T.accent }}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>{u.name.slice(0, 2)}</Text>
            </View>
            <Text style={{ color: T.sub, fontSize: 10, fontWeight: "600", marginTop: 4 }}>{u.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={goExplorar} style={{ alignItems: "center" }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: T.card2, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: T.border, borderStyle: "dashed" }}>
            <Text style={{ color: T.sub, fontSize: 24 }}>+</Text>
          </View>
          <Text style={{ color: T.sub, fontSize: 10, fontWeight: "600", marginTop: 4 }}>Seguir</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={{ height: 1, backgroundColor: T.border, marginBottom: 8 }} />
      {upcoming.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={{ color: T.sub, fontSize: 11, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>⏳ Contagem regressiva</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upcoming.map((e, i) => {
              const urgent = e.daysUntil <= 30;
              return (
                <TouchableOpacity key={i} onPress={() => { const u = unis.find(x => x.id === e.uni.id); if (u) onSelectUni(u); }} style={{ minWidth: 130, marginRight: 10, padding: 12, borderRadius: 14, backgroundColor: urgent ? "#dc262615" : T.card, borderWidth: 1, borderColor: urgent ? "#dc262660" : T.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: e.uni.color, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontSize: 8, fontWeight: "800" }}>{e.uni.name.slice(0, 2)}</Text>
                    </View>
                    <Text style={{ color: T.sub, fontSize: 10, fontWeight: "700" }} numberOfLines={1}>{e.uni.name}</Text>
                  </View>
                  <Text style={{ color: urgent ? "#dc2626" : T.text, fontSize: 22, fontWeight: "900" }}>{e.daysUntil}d</Text>
                  <Text style={{ color: T.muted, fontSize: 10, fontWeight: "600" }} numberOfLines={1}>{e.name || "Prova"}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
      {feedItems.length === 0 && fol.length === 0 && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📰</Text>
          <Text style={{ color: T.text, fontSize: 16, fontWeight: "800", marginBottom: 8, textAlign: "center" }}>Seu feed está vazio</Text>
          <Text style={{ color: T.sub, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 20 }}>Siga universidades para ver novidades, datas e notas de corte.</Text>
          <TouchableOpacity onPress={goExplorar} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, backgroundColor: T.accent }}>
            <Text style={{ color: isDark ? "#000" : "#fff", fontWeight: "800", fontSize: 14 }}>Explorar universidades</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
        {feedItems.map(item => {
          const tc = TG[item.type] || TG.news; const isL = liked[item.id]; const isS = saved[item.id];
          const ui = unis.find(u => u.id === item.uniId);
          return (
            <View key={item.id} style={{ ...cd({ overflow: "hidden" }), borderLeftWidth: 3, borderLeftColor: ui?.color || T.accent }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: ui?.color || T.card2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{ui?.name?.slice(0, 2) || ""}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 13, fontWeight: "700" }}>{item.uni}</Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>{item.time || timeAgo(item.createdAt)}</Text>
                </View>
                <View style={{ backgroundColor: tc.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: tc.b }}>
                  <Text style={{ color: tc.tx, fontSize: 10, fontWeight: "700" }}>{item.icon} {item.tag}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Text style={{ color: T.text, fontSize: 13, fontWeight: "700", marginBottom: 5, lineHeight: 18 }}>{item.title}</Text>
                <Text style={{ color: T.sub, fontSize: 12, lineHeight: 20 }}>{item.body}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 13, paddingTop: 9, borderTopWidth: 1, borderColor: T.border }}>
                <TouchableOpacity onPress={() => toggleLike(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, marginRight: 2 }}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>{isL ? "❤️" : "🤍"}</Text>
                  <Text style={{ color: isL ? "#f87171" : T.muted, fontSize: 11, fontWeight: "600" }}>{fmtCount(Math.max(0, item.likesCount ?? item.likes ?? 0))}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareItem(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, marginRight: 2 }}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>📤</Text>
                  <Text style={{ color: T.muted, fontSize: 11, fontWeight: "600" }}>{fmtCount(item.sharesCount || 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => reportItem(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>🚩</Text>
                  <Text style={{ color: T.muted, fontSize: 11, fontWeight: "600" }}>Reportar</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setSaved(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 18 }}>{isS ? "🔖" : "🏷️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
