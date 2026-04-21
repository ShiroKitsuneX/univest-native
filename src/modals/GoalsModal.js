import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../theme/useTheme";
import { BottomSheet } from "../components/BottomSheet";
import { removeAccents } from "../utils/string";
import { useUniversitiesStore } from "../stores/universitiesStore";

export function GoalsModal({ visible, onClose }) {
  const { T, isDark, AT } = useTheme();

  const fbUnis = useUniversitiesStore(s => s.fbUnis);
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis);
  const setGoalsUnis = useUniversitiesStore(s => s.setGoalsUnis);

  const [goalsSearch, setGoalsSearch] = useState("");

  useEffect(() => { if (!visible) setGoalsSearch(""); }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>📋 Tarefas</Text>
        </View>
        <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:16, borderWidth:1, borderColor:T.inpB }}>
          <Text style={{ fontSize:14, marginRight:8 }}>🔍</Text>
          <TextInput value={goalsSearch} onChangeText={setGoalsSearch} placeholder="Buscar universidade..." placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
          {goalsSearch.length > 0 && <TouchableOpacity onPress={()=>setGoalsSearch("")}><Text style={{ color:T.muted, fontSize:12 }}>✕</Text></TouchableOpacity>}
        </View>
        <Text style={{ color:T.sub, fontSize:12, marginBottom:12 }}>Selecione as universidades que você pretende fazer vestibular</Text>
        <ScrollView style={{ maxHeight:400 }} showsVerticalScrollIndicator={false}>
          {(() => {
            const allUnis = fbUnis.filter(u => u.type !== "Técnico");
            const filtered = goalsSearch.length > 0
              ? allUnis.filter(u => removeAccents(u.name.toLowerCase()).includes(removeAccents(goalsSearch.toLowerCase())) || removeAccents(u.fullName.toLowerCase()).includes(removeAccents(goalsSearch.toLowerCase())))
              : allUnis;
            if (filtered.length === 0) {
              return <Text style={{ color:T.muted, textAlign:"center", padding:20 }}>Nenhuma universidade encontrada</Text>;
            }
            return filtered.map(uni => {
              const isSelected = goalsUnis.some(g => g.id === uni.id);
              const nextExam = uni.exams?.find(e => e.status === "upcoming");
              return (
                <TouchableOpacity key={uni.id} onPress={() => {
                  if (isSelected) {
                    setGoalsUnis(goalsUnis.filter(g => g.id !== uni.id));
                  } else {
                    setGoalsUnis([...goalsUnis, uni]);
                  }
                }} style={{ flexDirection:"row", alignItems:"center", backgroundColor:isSelected?T.acBg:T.card2, borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:isSelected?T.accent:T.border }}>
                  <View style={{ width:44, height:44, borderRadius:22, backgroundColor:uni.color, alignItems:"center", justifyContent:"center", marginRight:12 }}>
                    <Text style={{ color:"#fff", fontSize:12, fontWeight:"800" }}>{uni.name.slice(0,2)}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{uni.name}</Text>
                    <View style={{ flexDirection:"row", alignItems:"center", gap:8, marginTop:2 }}>
                      <Text style={{ color:T.muted, fontSize:11 }}>{uni.vestibular}</Text>
                      {nextExam && <Text style={{ color:T.accent, fontSize:10, fontWeight:"600" }}>📅 {nextExam.date}</Text>}
                    </View>
                  </View>
                  <View style={{ width:24, height:24, borderRadius:12, backgroundColor:isSelected?T.accent:T.card, borderWidth:2, borderColor:isSelected?T.accent:T.border, alignItems:"center", justifyContent:"center" }}>
                    {isSelected && <Text style={{ color:AT, fontSize:12, fontWeight:"800" }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            });
          })()}
        </ScrollView>
        {goalsUnis.length > 0 && (
          <TouchableOpacity onPress={onClose} style={{ marginTop:16, padding:16, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
            <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar Metas ({goalsUnis.length})</Text>
          </TouchableOpacity>
        )}
      </View>
    </BottomSheet>
  );
}
