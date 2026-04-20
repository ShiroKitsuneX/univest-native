import { View, Text, TouchableOpacity, ScrollView, Appearance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DK, LT } from "../../theme/palette";
import { getMonthFromKey } from "../../utils/dates";
import { useProfileStore } from "../../stores/profileStore";
import { useUniversitiesStore } from "../../stores/universitiesStore";

export function FollowingScreen({ onBack, onExplore, onSelectUni }) {
  const insets = useSafeAreaInsets();
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  const unis = useUniversitiesStore(s => s.unis);
  const uniSort = useUniversitiesStore(s => s.uniSort);
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs);

  const fol = unis.filter(u => u.followed).sort((a, b) => {
    if (uniSort === "pref") return (uniPrefs[b.id] || 5) - (uniPrefs[a.id] || 5);
    const gm = s => getMonthFromKey(s?.match(/[A-Z]{3}/)?.[0] || "DEZ");
    return gm(a.prova) - gm(b.prova);
  });

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
        <TouchableOpacity onPress={onBack} style={{ marginRight:12 }}>
          <Text style={{ fontSize:24, color:T.accent }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:"800", color:T.text, flex:1 }}>🏛️ Seguindo</Text>
      </View>

      <ScrollView style={{ flex:1, paddingHorizontal:16, paddingTop:16 }}>
        {fol.length === 0 ? (
          <View style={{ paddingVertical:40, alignItems:"center" }}>
            <Text style={{ fontSize:48, marginBottom:12 }}>🏛️</Text>
            <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>Nenhuma universidade seguida</Text>
            <TouchableOpacity onPress={onExplore} style={{ marginTop:16, paddingHorizontal:16, paddingVertical:8, backgroundColor:T.accent, borderRadius:8 }}>
              <Text style={{ color:AT, fontSize:12, fontWeight:"700" }}>Explorar universidades</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap:10, marginBottom:40 }}>
            {fol.map(u => (
              <TouchableOpacity key={u.id} onPress={()=>onSelectUni(u)} style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:14, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}>
                <View style={{ width:44, height:44, borderRadius:22, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
                </View>
                <View style={{ flex:1, marginLeft:12 }}>
                  <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{u.name}</Text>
                  <Text style={{ color:T.sub, fontSize:11 }}>{u.fullName}</Text>
                </View>
                <Text style={{ color:T.accent, fontSize:20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
