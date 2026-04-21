import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { BottomSheet } from "@/components/BottomSheet";
import { FEED } from "@/data/feed";
import { usePostsStore } from "@/stores/postsStore";
import { useUniversitiesStore } from "@/stores/universitiesStore";

export function SavedPostsModal({ visible, onClose, onSelectPost }) {
  const { T, isDark } = useTheme();

  const posts = usePostsStore(s => s.posts);
  const saved = usePostsStore(s => s.saved);
  const unis = useUniversitiesStore(s => s.unis);

  const feedItems = posts.length ? posts : FEED;
  const savedItems = feedItems.filter(item => saved[item.id]);

  const cd = (extra = {}) => ({ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, ...extra });

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>🔖 Salvos</Text>
        </View>
        <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>Posts e links salvos para consultar depois</Text>
        {savedItems.length === 0 ? (
          <View style={{ alignItems:"center", padding:30 }}>
            <Text style={{ fontSize:40, marginBottom:12 }}>🔖</Text>
            <Text style={{ color:T.text, fontSize:14, fontWeight:"700", marginBottom:4 }}>Nenhum post salvo</Text>
            <Text style={{ color:T.sub, fontSize:12, textAlign:"center" }}>Toque no 🔖 em qualquer post para salvar</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight:400 }}>
            {savedItems.map(item => {
              const ui = unis.find(u => u.id === item.uniId);
              return (
                <TouchableOpacity key={item.id} onPress={() => { onClose(); onSelectPost?.(item); }} style={{ ...cd({ padding:14, marginBottom:10 }) }}>
                  <View style={{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 }}>
                    <View style={{ width:28, height:28, borderRadius:14, backgroundColor:ui?.color||T.card2, alignItems:"center", justifyContent:"center" }}>
                      <Text style={{ color:"#fff", fontSize:9, fontWeight:"800" }}>{ui?.name?.slice(0,2)||""}</Text>
                    </View>
                    <Text style={{ color:T.text, fontSize:12, fontWeight:"700" }}>{item.uni}</Text>
                    <Text style={{ color:T.muted, fontSize:10 }}>· {item.tag}</Text>
                  </View>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"600", marginBottom:4, lineHeight:18 }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ color:T.muted, fontSize:11 }} numberOfLines={1}>{item.body}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}
