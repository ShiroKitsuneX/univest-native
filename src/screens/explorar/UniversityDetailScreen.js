import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { fmtCount } from "../../utils/format";
import { useProgressStore } from "../../stores/progressStore";

export function UniversityDetailScreen({ selUni, onBack, onToggleFollow, onShowExams }) {
  const { T, isDark, AT } = useTheme();

  const readBooks = useProgressStore(s => s.readBooks);
  const setReadBooks = useProgressStore(s => s.setReadBooks);

  const [selectedBookYear, setSelectedBookYear] = useState(null);
  const [bookMenu, setBookMenu] = useState(null);

  const lbl = { color: T.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 };
  const cd = (st = {}) => ({ backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, ...st });

  const persistReadBooks = (newRead) => setReadBooks(newRead);

  return (
    <ScrollView style={{ flex:1 }}>
      <TouchableOpacity onPress={onBack} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:12, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignSelf:"flex-start", margin:16 }}>
        <Text style={{ color:T.sub, fontSize:12, fontWeight:"700" }}>← Voltar</Text>
      </TouchableOpacity>
      <View style={{ marginHorizontal:16, borderRadius:22, padding:22, backgroundColor:selUni.color }}>
        <Text style={{ fontSize:30, marginBottom:8 }}>{selUni.name.slice(0,2)}</Text>
        <Text style={{ color:"#fff", fontSize:22, fontWeight:"800" }}>{selUni.name}</Text>
        <Text style={{ color:"rgba(255,255,255,.65)", fontSize:12, marginBottom:8 }}>{selUni.fullName}</Text>
        <Text style={{ color:"rgba(255,255,255,.8)", fontSize:12, lineHeight:20, marginBottom:14 }}>{selUni.description}</Text>
        <View style={{ flexDirection:"row", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <TouchableOpacity onPress={()=>onToggleFollow(selUni,!selUni.followed)} style={{ paddingHorizontal:18, paddingVertical:9, borderRadius:13, backgroundColor:selUni.followed?"#dc2626":T.accent }}>
            <Text style={{ color:selUni.followed?"#fff":AT, fontSize:13, fontWeight:"800" }}>{selUni.followed?"🚫 Deixar de seguir":"+ Seguir"}</Text>
          </TouchableOpacity>
          <Text style={{ color:"rgba(255,255,255,.65)", fontSize:11 }}>👥 <Text style={{ color:"#fff", fontWeight:"800" }}>{fmtCount(selUni.followersCount??selUni.followers)}</Text> seguidores</Text>
        </View>
      </View>
      {selUni.exams && selUni.exams.length > 0 && (
        <View style={{ paddingHorizontal:16, paddingTop:16, paddingBottom:8 }}>
          <TouchableOpacity onPress={onShowExams} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:14, borderRadius:14, backgroundColor:selUni.color }}>
            <View style={{ flexDirection:"row", alignItems:"center" }}>
              <Text style={{ fontSize:22, marginRight:12 }}>📝</Text>
              <View>
                <Text style={{ color:"#fff", fontSize:15, fontWeight:"800" }}>Provas Anteriores</Text>
                <Text style={{ color:"rgba(255,255,255,.7)", fontSize:11 }}>Consulte provas e simulados</Text>
              </View>
            </View>
            <Text style={{ color:"#fff", fontSize:22 }}>→</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ padding:16, gap:10 }}>
        <View style={cd({ padding:16 })}>
          <Text style={[lbl,{marginBottom:10}]}>📅 Próximo Vestibular</Text>
          <Text style={{ color:T.text, fontSize:16, fontWeight:"800", marginBottom:8 }}>{selUni.vestibular}</Text>
          <View style={{ flexDirection:"row", gap:8 }}>
            {[["Inscrições",selUni.inscricao,T.accent],["Data da Prova",selUni.prova,"#c084fc"]].map(([l,v,c])=>(
              <View key={l} style={{ backgroundColor:T.card2, borderRadius:10, padding:8 }}>
                <Text style={{ color:c, fontSize:10, fontWeight:"700" }}>{l}</Text>
                <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={cd({ padding:16 })}>
          <Text style={[lbl,{marginBottom:10}]}>📖 Cursos</Text>
          <View style={{ flexDirection:"row", flexWrap:"wrap", gap:7 }}>
            {selUni.courses.map(c=>(
              <View key={c} style={{ backgroundColor:T.card2, borderRadius:10, paddingHorizontal:11, paddingVertical:5, borderWidth:1, borderColor:T.border }}>
                <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
        {selUni.books && selUni.books.length > 0 && (
          <View style={cd({ padding:16 })}>
            <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <Text style={[lbl,{marginBottom:0}]}>📚 Livros Obrigatórios</Text>
              {selUni.books && selUni.books.length > 4 && (
                <TouchableOpacity onPress={()=>setSelectedBookYear(selectedBookYear === "2026" ? "2025" : "2026")} style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:8, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}>
                  <Text style={{ color:T.sub, fontSize:10, fontWeight:"600" }}>{selectedBookYear || "2026"} ▼</Text>
                </TouchableOpacity>
              )}
            </View>
            {Array.isArray(selUni.books?.[0]) ? (
              <Text style={{ color:T.text, fontSize:12 }}>Verificar ano...</Text>
            ) : (
              <View>
                {selUni.books?.slice(0, 8).map((book, i) => {
                  const bookKey = `${selUni.id}-${book}`;
                  const status = readBooks[bookKey] || "none";
                  const isRead = status === "read";
                  const isReading = status === "reading";
                  const showMenu = bookMenu === bookKey;
                  return (
                    <View key={i}>
                      <TouchableOpacity onPress={() => setBookMenu(showMenu ? null : bookKey)} activeOpacity={0.7} style={{ paddingVertical:8, paddingHorizontal: isRead || isReading ? 8 : 0, marginHorizontal: isRead || isReading ? -8 : 0, borderRadius: isRead || isReading ? 8 : 0, backgroundColor: isRead ? T.accent+"10" : isReading ? "#f59e0b10" : "transparent", borderBottomWidth:i<Math.min(selUni.books.length, 8)-1?1:0, borderColor:T.border }}>
                        {showMenu ? (
                          <View style={{ flexDirection:"row", flex:1, gap:4 }}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks}; delete newRead[bookKey]; persistReadBooks(newRead); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:T.card, borderWidth:1, borderColor:T.border }}>
                              <Text style={{ color:T.muted, fontSize:10, fontWeight:"700", textAlign:"center" }}>○</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [bookKey]: "reading"}; persistReadBooks(newRead); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:"#f59e0b30", borderWidth:1, borderColor:"#f59e0b" }}>
                              <Text style={{ color:"#f59e0b", fontSize:10, fontWeight:"700", textAlign:"center" }}>📖</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [bookKey]: "read"}; persistReadBooks(newRead); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:T.accent+"20", borderWidth:1, borderColor:T.accent }}>
                              <Text style={{ color:T.accent, fontSize:10, fontWeight:"700", textAlign:"center" }}>✓</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ flexDirection:"row", alignItems:"center" }}>
                            <View style={{ width:24, height:24, borderRadius:12, backgroundColor:isRead ? T.accent : isReading ? "#f59e0b" : T.card2, borderWidth:2, borderColor:isRead ? T.accent : isReading ? "#f59e0b" : T.border, alignItems:"center", justifyContent:"center", marginRight:10 }}>
                              {isRead && <Text style={{ color:AT, fontSize:10, fontWeight:"800" }}>✓</Text>}
                              {isReading && <Text style={{ color:"#fff", fontSize:10 }}>📖</Text>}
                              {!isRead && !isReading && <View style={{ width:8, height:8, borderRadius:4, backgroundColor:T.muted }} />}
                            </View>
                            <Text style={{ color:T.text, fontSize:12, flex:1 }}>{book}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
        <TouchableOpacity onPress={()=>Linking.openURL(selUni.site)} style={{ backgroundColor:isDark?"#0a1f15":"#f0fdf4", borderRadius:14, padding:13, borderWidth:1, borderColor:T.accent+"30", flexDirection:"row", alignItems:"center", gap:10 }}>
          <Text style={{ fontSize:18 }}>🌐</Text>
          <View style={{ flex:1 }}>
            <Text style={{ color:T.sub, fontSize:10 }}>Site oficial</Text>
            <Text style={{ color:T.accent, fontSize:13, fontWeight:"700" }}>{selUni.site}</Text>
          </View>
          <Text style={{ color:T.accent }}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height:16 }} />
    </ScrollView>
  );
}
