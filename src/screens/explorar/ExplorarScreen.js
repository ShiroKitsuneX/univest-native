import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { GEO_DATA } from "@/data/geo";
import { SBox } from "@/components/SBox";
import { fmtCount } from "@/utils/format";
import { removeAccents } from "@/utils/string";
import { useProfileStore } from "@/stores/profileStore";
import { useUniversitiesStore } from "@/stores/universitiesStore";
import { useGeoStore } from "@/stores/geoStore";
import { logger } from "@/services/logger";

export function ExplorarScreen({ refreshing, onRefresh, onOpenLocation, onOpenDiscover, onSelectUni }) {
  const { T, isDark, AT } = useTheme();

  const studyStateId = useProfileStore(s => s.studyStateId);
  const unis = useUniversitiesStore(s => s.unis);
  const states = useGeoStore(s => s.states);

  const [query, setQuery] = useState("");
  const [fSt, setFSt] = useState("Todos");

  const getState = (id) => states.find(s => s.id === id) || GEO_DATA.states.find(s => s.id === id);
  const getStateDisplayName = (id) => getState(id)?.name || "";
  const userStudyState = studyStateId ? getStateDisplayName(studyStateId) : null;

  const filtU = useMemo(() => {
    try {
      return unis.filter(u => {
        if (!u || !u.state || !u.name) return false;
        const q = removeAccents(query.toLowerCase());
        const stateName = removeAccents(getStateDisplayName(u.state) || "");
        const matchesSearch =
          removeAccents(u.name.toLowerCase()).includes(q) ||
          (u.fullName && removeAccents(u.fullName.toLowerCase()).includes(q)) ||
          (u.city && removeAccents(u.city.toLowerCase()).includes(q)) ||
          (u.state.toLowerCase() === q) ||
          stateName.includes(q) ||
          (u.courses && u.courses.some(c => removeAccents(c.toLowerCase()).includes(q)));
        const matchesFilter = fSt === "Todos" || u.state === fSt;
        return matchesSearch && matchesFilter;
      });
    } catch (e) {
      logger.warn("Filter error:", e.message);
      return [];
    }
  }, [unis, query, fSt, states]);

  const filterChips = useMemo(() => {
    const allStates = [...new Set(unis.map(u => u.state))].filter(Boolean);
    const validStates = allStates.filter(s => s && s.length === 2 && /^[A-Z]{2}$/.test(s));
    const chips = ["Todos"];
    if (studyStateId) chips.push("🎯 " + studyStateId);
    chips.push(...validStates.sort());
    return chips;
  }, [unis, studyStateId]);

  const hasSearch = query.length > 0;

  const cd = (extra = {}) => ({ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, ...extra });

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:16 }} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}>
      {!studyStateId && (
        <TouchableOpacity onPress={onOpenLocation} style={{ backgroundColor:isDark?"#1a2e4a":"#dbeafe", borderRadius:14, padding:12, flexDirection:"row", alignItems:"center", gap:10, marginBottom:12, borderWidth:1, borderColor:isDark?"#3b82f6":"#93c5fd" }}>
          <Text style={{ fontSize:20 }}>📍</Text>
          <View style={{ flex:1 }}>
            <Text style={{ color:T.text, fontSize:12, fontWeight:"700" }}>Defina seu destino de estudos</Text>
            <Text style={{ color:T.sub, fontSize:10 }}>Toque para selecionar onde você pretende estudar</Text>
          </View>
          <Text style={{ color:T.accent, fontSize:18 }}>›</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onOpenDiscover} style={{ backgroundColor:isDark?"#0c1f3a":"#dbeafe", borderRadius:18, padding:16, flexDirection:"row", alignItems:"center", gap:14, marginBottom:14, borderWidth:1, borderColor:isDark?"#1e40af40":"#bfdbfe" }}>
        <View style={{ width:52, height:52, borderRadius:26, backgroundColor:isDark?"#1e3a6a":"#bfdbfe", alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:28 }}>🧭</Text>
        </View>
        <View style={{ flex:1 }}>
          <Text style={{ color:T.text, fontSize:14, fontWeight:"800" }}>Ainda não sabe qual curso?</Text>
          <Text style={{ color:T.sub, fontSize:11, marginTop:2, lineHeight:15 }}>Explore por área, nota de corte e mercado de trabalho</Text>
        </View>
        <View style={{ backgroundColor:T.accent, borderRadius:12, width:32, height:32, alignItems:"center", justifyContent:"center" }}>
          <Text style={{ color:AT, fontWeight:"800", fontSize:16 }}>›</Text>
        </View>
      </TouchableOpacity>
      <SBox val={query} set={setQuery} ph="Buscar universidade…" T={T} />
      {hasSearch && (
        <View style={{ flexDirection:"row", alignItems:"center", marginBottom:8, marginTop:4 }}>
          <Text style={{ color:T.accent, fontSize:12, fontWeight:"600" }}>🔍 {filtU.length} resultado{filtU.length !== 1 ? "s" : ""}</Text>
          <Text style={{ color:T.muted, fontSize:11, marginLeft:8 }}>para "{query}"</Text>
        </View>
      )}
      <View style={{ height:10 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
        {filterChips.map(s => {
          const chipValue = s.replace("🎯 ","");
          const isSelected = fSt === chipValue;
          return (
            <TouchableOpacity key={s} onPress={()=>setFSt(isSelected ? "Todos" : chipValue)} style={{ paddingHorizontal:13, paddingVertical:7, borderRadius:20, backgroundColor:isSelected?T.accent:T.card2, marginRight:7, borderWidth:1, borderColor:isSelected?T.accent:T.border }}>
              <Text style={{ color:isSelected?AT:T.sub, fontSize:12, fontWeight:"700" }}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={{ gap:9 }}>
        {filtU.map(u=>(
          <TouchableOpacity key={u.id} onPress={()=>onSelectUni(u)} style={{ ...cd(), flexDirection:"row", alignItems:"center", gap:12, padding:15, borderLeftWidth:u.followed?3:0, borderLeftColor:u.color }}>
            <View style={{ width:50, height:50, borderRadius:25, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
            </View>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                <Text style={{ color:T.text, fontSize:15, fontWeight:"800" }}>{u.name}</Text>
                {userStudyState && u.state === userStudyState && <View style={{ backgroundColor:T.accent, borderRadius:8, paddingHorizontal:6, paddingVertical:2 }}><Text style={{ color:AT, fontSize:8, fontWeight:"800" }}>🎯</Text></View>}
              </View>
              <Text style={{ color:T.sub, fontSize:11 }} numberOfLines={1}>{u.fullName}</Text>
              <View style={{ flexDirection:"row", gap:5, marginTop:5 }}>
                {[u.state,u.type].map(x=><View key={x} style={{ backgroundColor:T.card2, borderRadius:8, paddingHorizontal:7, paddingVertical:2 }}><Text style={{ color:T.muted, fontSize:9, fontWeight:"600" }}>{x}</Text></View>)}
                <Text style={{ color:T.sub, fontSize:10 }}>👥 {fmtCount(u.followersCount??u.followers)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
