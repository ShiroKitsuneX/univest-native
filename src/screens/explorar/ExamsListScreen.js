import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Appearance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DK, LT } from "../../theme/palette";
import { useProfileStore } from "../../stores/profileStore";

export function ExamsListScreen({ selUni, onBack, onSelectExam }) {
  const insets = useSafeAreaInsets();
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  const [examSearch, setExamSearch] = useState("");
  const [examSort, setExamSort] = useState("newest");
  const [expandedYears, setExpandedYears] = useState({});

  const lbl = { color: T.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 };

  if (!selUni?.exams) return null;
  const allExams = selUni.exams;
  const upcoming = allExams.filter(e => e.status === "upcoming");
  const past = allExams.filter(e => e.status === "past");
  const years = [...new Set(past.map(e => e.year))].sort((a, b) => examSort === "newest" ? b - a : a - b);

  const toggleYear = (year) => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));

  const filteredYears = years.map(year => ({
    year,
    exams: past.filter(e => e.year === year).filter(e =>
      !examSearch ||
      e.subject.toLowerCase().includes(examSearch.toLowerCase()) ||
      e.phase.toLowerCase().includes(examSearch.toLowerCase())
    )
  })).filter(g => !examSearch || g.exams.length > 0);

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
        <TouchableOpacity onPress={()=>{ setExamSearch(""); onBack(); }} style={{ marginRight:12 }}>
          <Text style={{ fontSize:24, color:T.accent }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:"800", color:T.text, flex:1 }}>📝 Provas Anteriores</Text>
      </View>

      <ScrollView style={{ flex:1, paddingHorizontal:16, paddingTop:16 }}>
        <View style={{ flexDirection:"row", gap:8, marginBottom:16 }}>
          <TouchableOpacity onPress={()=>setExamSort("newest")} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:examSort==="newest"?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:examSort==="newest"?T.accent:T.border }}>
            <Text style={{ color:examSort==="newest"?AT:T.sub, fontSize:12, fontWeight:"700" }}>Mais recente</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setExamSort("oldest")} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:examSort==="oldest"?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:examSort==="oldest"?T.accent:T.border }}>
            <Text style={{ color:examSort==="oldest"?AT:T.sub, fontSize:12, fontWeight:"700" }}>Mais antigo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:13, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:T.inpB, marginBottom:16 }}>
          <Text style={{ fontSize:14, marginRight:10 }}>🔍</Text>
          <TextInput value={examSearch} onChangeText={setExamSearch} placeholder="Buscar prova..." placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
          {examSearch ? <TouchableOpacity onPress={()=>setExamSearch("")}><Text style={{ color:T.muted }}>✕</Text></TouchableOpacity> : null}
        </View>

        {upcoming.length > 0 && (
          <View style={{ marginBottom:20 }}>
            <Text style={[lbl,{marginBottom:10}]}>🔥 {new Date().getFullYear()}</Text>
            {upcoming.map(exam => (
              <TouchableOpacity key={exam.id} onPress={() => onSelectExam(exam)} style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:12, backgroundColor:isDark?"#1a2e1a":"#f0fdf4", borderWidth:1, borderColor:T.accent+"40", marginBottom:8 }}>
                <View style={{ width:44, height:44, borderRadius:22, backgroundColor:T.accent+"20", alignItems:"center", justifyContent:"center", marginRight:12 }}>
                  <Text style={{ fontSize:20 }}>📋</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{exam.subject}</Text>
                  <Text style={{ color:T.sub, fontSize:12 }}>{exam.phase} · {exam.questions} questões</Text>
                </View>
                <View style={{ backgroundColor:"#fbbf24", paddingHorizontal:10, paddingVertical:4, borderRadius:8 }}>
                  <Text style={{ color:"#000", fontSize:11, fontWeight:"700" }}>Em breve</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredYears.length === 0 ? (
          <View style={{ alignItems:"center", padding:40 }}>
            <Text style={{ fontSize:40, marginBottom:12 }}>📭</Text>
            <Text style={{ color:T.sub, fontSize:14, textAlign:"center" }}>Nenhuma prova encontrada</Text>
          </View>
        ) : filteredYears.map(({year, exams}) => (
          <View key={year} style={{ marginBottom:12 }}>
            <TouchableOpacity onPress={() => toggleYear(year)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:14, borderRadius:12, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, marginBottom:expandedYears[year] ? 8 : 0 }}>
              <View style={{ flexDirection:"row", alignItems:"center" }}>
                <Text style={{ fontSize:18, marginRight:10 }}>📅</Text>
                <Text style={{ color:T.text, fontSize:15, fontWeight:"700" }}>{year}</Text>
                <View style={{ backgroundColor:T.accent+"30", paddingHorizontal:8, paddingVertical:2, borderRadius:10, marginLeft:8 }}>
                  <Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>{exams.length} provas</Text>
                </View>
              </View>
              <Text style={{ color:T.accent, fontSize:18 }}>{expandedYears[year] ? "∧" : "∨"}</Text>
            </TouchableOpacity>

            {expandedYears[year] && exams.map(exam => (
              <TouchableOpacity key={exam.id} onPress={() => onSelectExam(exam)} style={{ flexDirection:"row", alignItems:"center", padding:12, paddingLeft:20, borderRadius:10, backgroundColor:T.bg, borderWidth:1, borderColor:T.border, marginBottom:6 }}>
                <View style={{ width:36, height:36, borderRadius:18, backgroundColor:selUni.color+"20", alignItems:"center", justifyContent:"center", marginRight:10 }}>
                  <Text style={{ fontSize:16 }}>📋</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{exam.subject}</Text>
                  <Text style={{ color:T.sub, fontSize:11 }}>{exam.phase} · {exam.questions} questões · {exam.duration}</Text>
                </View>
                <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                  {exam.pdfUrl ? (
                    <View style={{ backgroundColor:"#22c55e30", paddingHorizontal:6, paddingVertical:2, borderRadius:6 }}>
                      <Text style={{ color:"#22c55e", fontSize:10, fontWeight:"700" }}>PDF</Text>
                    </View>
                  ) : null}
                  <Text style={{ color:T.accent, fontSize:16 }}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{ height:40 }} />
      </ScrollView>
    </View>
  );
}
