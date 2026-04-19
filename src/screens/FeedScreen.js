import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";
import { doc, setDoc, deleteDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

const FeedScreen = () => {
  const {
    T, TG, AT, cd, lbl, tab, setTab, unis, goalsUnis, setSU,
    currentUser, posts, setPosts, liked, setLiked, saved, setSaved,
    refreshing, setRefreshing, timeAgo, fmtCount,
    saveLocalUserData, currentData, posts: feedItems
  } = useApp();

  const fol = goalsUnis;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleLike = (item) => {
    if (!currentUser) {
      Alert.alert("Atenção", "Faça login para curtir");
      return;
    }
    const newLiked = !liked[item.id];
    setLiked(p => ({ ...p, [item.id]: newLiked }));
    setPosts(prev => prev.map(p => p.id === item.id ? { ...p, likesCount: (p.likesCount ?? p.likes ?? 0) + (newLiked ? 1 : -1) } : p));
    saveLocalUserData(currentData());
  };

  const handleShare = (item) => {
    setPosts(prev => prev.map(p => p.id === item.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p));
    updateDoc(doc(db, "posts", item.id), { sharesCount: increment(1) }).catch(() => {});
  };

  const handleReport = (item) => {
    Alert.alert("Reportar", "Deseja reportar esta publicação?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Reportar", style: "destructive", onPress: async () => {
        try {
          await addDoc(collection(db, "reports"), {
            postId: item.id, postTitle: item.title, reportedBy: currentUser?.uid || "anon",
            reason: "user_report", createdAt: serverTimestamp(),
          });
        } catch {}
        Alert.alert("Obrigado!", "Report enviado para análise.");
      }}
    ]);
  };

  const upcoming = goalsUnis.flatMap(g => (g.exams || []).filter(e => e.status === "upcoming").map(e => ({ ...e, uni: g })))
    .map(e => ({ ...e, daysUntil: Math.ceil((new Date(e.date) - new Date()) / 86400000) }))
    .filter(e => e.daysUntil >= 0 && e.daysUntil <= 180)
    .sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
          {fol.map(u => (
            <TouchableOpacity key={u.id} onPress={() => setSU(u)} style={{ alignItems: "center", marginRight: 12 }}>
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: u.color, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: T.accent }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>{u.name.slice(0, 2)}</Text>
              </View>
              <Text style={{ color: T.sub, fontSize: 10, fontWeight: "600", marginTop: 4 }}>{u.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setTab("explorar")} style={{ alignItems: "center" }}>
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
                  <TouchableOpacity
                    key={i}
                    onPress={() => { const u = unis.find(x => x.id === e.uni.id); if (u) { setSU(u); setTab("explorar"); } }}
                    style={{ minWidth: 130, marginRight: 10, padding: 12, borderRadius: 14, backgroundColor: urgent ? "#dc262615" : T.card, borderWidth: 1, borderColor: urgent ? "#dc262660" : T.border }}
                  >
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
            <TouchableOpacity onPress={() => setTab("explorar")} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, backgroundColor: T.accent }}>
              <Text style={{ color: AT, fontWeight: "800", fontSize: 14 }}>Explorar universidades</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          {feedItems.map(item => {
            const tc = TG[item.type] || TG.news;
            const isL = liked[item.id];
            const isS = saved[item.id];
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
                  <TouchableOpacity onPress={() => handleLike(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, marginRight: 2 }}>
                    <Text style={{ fontSize: 14, marginRight: 4 }}>{isL ? "❤️" : "🤍"}</Text>
                    <Text style={{ color: isL ? "#f87171" : T.muted, fontSize: 11, fontWeight: "600" }}>{fmtCount(Math.max(0, item.likesCount ?? item.likes ?? 0))}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleShare(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, marginRight: 2 }}>
                    <Text style={{ fontSize: 14, marginRight: 4 }}>📤</Text>
                    <Text style={{ color: T.muted, fontSize: 11, fontWeight: "600" }}>{fmtCount(item.sharesCount || 0)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleReport(item)} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4 }}>
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
    </SafeAreaView>
  );
};

export default FeedScreen;