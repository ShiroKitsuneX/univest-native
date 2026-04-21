import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking, Dimensions } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { BarChart } from "react-native-chart-kit";
import { NOTAS_CORTE } from "../../data/notasCorte";
import { ENEM_SUBJECTS, subjectScore } from "../../data/subjects";
import { SBox } from "../../components/SBox";
import { useProfileStore } from "../../stores/profileStore";
import { useOnboardingStore } from "../../stores/onboardingStore";

export function NotasScreen({ onEditCourses, onAddGrade }) {
  const { T, isDark, AT } = useTheme();

  const c1 = useOnboardingStore(s => s.c1);
  const c2 = useOnboardingStore(s => s.c2);
  const gs = useProfileStore(s => s.gs);
  const setGs = useProfileStore(s => s.setGs);

  const [nSrch, setNsrch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [compareMode, setCompareMode] = useState(false);

  const last = gs[gs.length - 1];
  const avg = g => Math.round((g.s.l + g.s.h + g.s.n + g.s.m) / 4);
  const tgt = NOTAS_CORTE.filter(n => n.curso === c1).reduce((a, b) => Math.max(a, b.nota), 70);
  const radar = last ? ENEM_SUBJECTS.map(sub => ({ subject: sub.short, v: subjectScore(last.s, sub.k), fullMark: 100 })) : [];
  const weak = radar.length ? radar.reduce((a, b) => a.v < b.v ? a : b) : null;
  const bars = gs.map(g => {
    const row = { name: g.ex.length > 12 ? g.ex.slice(0, 12) + "…" : g.ex };
    ENEM_SUBJECTS.forEach(sub => { if (sub.k !== "r") row[sub.long] = g.s[sub.k]; });
    return row;
  });
  const chartConfig = {
    backgroundGradientFrom: T.card,
    backgroundGradientTo: T.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 229, 160, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "1", stroke: T.accent },
  };
  const uCourses = [c1, c2].filter(Boolean);
  const filtN = NOTAS_CORTE.filter(n => {
    if (nSrch) return n.curso.toLowerCase().includes(nSrch.toLowerCase()) || n.uni.toLowerCase().includes(nSrch.toLowerCase());
    return uCourses.length === 0 || uCourses.some(c => c && n.curso === c);
  });

  const cd = (extra = {}) => ({ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, ...extra });
  const lbl = { color: T.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 };

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:24 }} keyboardShouldPersistTaps="handled">
      <View style={{ backgroundColor:isDark?"#1a2e4a":"#dbeafe", borderRadius:16, padding:16, marginBottom:16, borderWidth:1, borderColor:isDark?"#3b82f6":"#93c5fd" }}>
        <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
            <Text style={{ fontSize:18 }}>🎯</Text>
            <Text style={{ color:isDark?"#60a5fa":"#1d4ed8", fontSize:14, fontWeight:"700" }}>Meu Objetivo</Text>
          </View>
          <TouchableOpacity onPress={onEditCourses} style={{ backgroundColor:isDark?"#3b82f6":"#fff", paddingHorizontal:10, paddingVertical:4, borderRadius:8, borderWidth:1, borderColor:isDark?"#60a5fa":"#1d4ed8" }}>
            <Text style={{ color:isDark?"#fff":"#1d4ed8", fontSize:10, fontWeight:"700" }}>✏️ editar</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection:"row", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          {c1 ? (
            <View style={{ backgroundColor:isDark?"#1e3a5f":"#fff", paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:isDark?"#60a5fa":"#1d4ed8" }}>
              <Text style={{ color:isDark?"#60a5fa":"#1d4ed8", fontSize:13, fontWeight:"700" }}>1ª {c1}</Text>
            </View>
          ) : (
            <Text style={{ color:isDark?"#60a5fa":"#1d4ed8", fontSize:12 }}>Selecione seu curso</Text>
          )}
          {c2 && (
            <View style={{ backgroundColor:isDark?"#161b27":"#f0f0f0", paddingHorizontal:12, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.sub, fontSize:11, fontWeight:"600" }}>2ª {c2}</Text>
            </View>
          )}
        </View>
        <Text style={{ color:isDark?"#94a3b8":"#64748b", fontSize:10, marginTop:8 }}>Os cursos selecionados guiam toda a análise abaixo</Text>
      </View>

      <Text style={[lbl,{marginBottom:8}]}>📊 Notas de Corte</Text>
      <SBox val={nSrch} set={setNsrch} ph="Buscar outro curso ou universidade…" T={T} />
      <View style={{ height:10 }} />
      <View style={{ gap:10, marginBottom:20 }}>
        {filtN.map((n,i)=>{
          const pct = Math.round((n.nota/100)*100);
          const diff = last ? (avg(last) - n.nota) : null;
          const diffColor = diff===null ? T.muted : diff>=0 ? "#22c55e" : "#f87171";
          return (
            <View key={i} style={{ ...cd(), overflow:"hidden", borderLeftWidth:4, borderLeftColor:n.cor }}>
              <View style={{ padding:14 }}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
                  <View style={{ width:44, height:44, borderRadius:22, backgroundColor:n.cor+"22", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:n.cor+"44" }}>
                    <Text style={{ color:n.cor, fontSize:10, fontWeight:"800" }}>{n.uni.split(" ")[0]}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:"800" }}>{n.curso}</Text>
                    <Text style={{ color:T.sub, fontSize:11 }}>{n.uni} · {n.vagas} vagas</Text>
                  </View>
                  <View style={{ alignItems:"flex-end", gap:2 }}>
                    <View style={{ backgroundColor:n.cor+"18", borderRadius:10, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:n.cor+"44" }}>
                      <Text style={{ color:n.cor, fontSize:18, fontWeight:"800" }}>{n.nota}</Text>
                    </View>
                    {diff!==null && <Text style={{ color:diffColor, fontSize:9, fontWeight:"700", textAlign:"right" }}>{diff>=0?"+"+(diff.toFixed(1)):diff.toFixed(1)} pts</Text>}
                  </View>
                </View>
                <View style={{ marginTop:10, backgroundColor:T.card2, borderRadius:6, height:4 }}>
                  <View style={{ width:pct+"%", height:"100%", backgroundColor:n.cor, borderRadius:6, opacity:0.8 }} />
                </View>
                <TouchableOpacity onPress={()=>Linking.openURL(n.site)} style={{ marginTop:8, alignSelf:"flex-start" }}>
                  <Text style={{ color:T.accent, fontSize:10, fontWeight:"700" }}>Site oficial ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        {filtN.length===0 && <Text style={{ color:T.muted, textAlign:"center", padding:20, fontSize:13 }}>Nenhum resultado.</Text>}
      </View>
      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <Text style={lbl}>📈 Minhas Notas</Text>
        <TouchableOpacity onPress={onAddGrade} style={{ paddingHorizontal:14, paddingVertical:6, borderRadius:10, backgroundColor:T.accent }}>
          <Text style={{ color:AT, fontSize:12, fontWeight:"800" }}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection:"row", gap:6, marginBottom:12 }}>
        {[["all","Todas"],["prova","Provas"],["simulado","Simulados"]].map(([v,l])=>(
          <TouchableOpacity key={v} onPress={()=>setGradeFilter(v)} style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:12, backgroundColor:gradeFilter===v?T.accent:T.card2, borderWidth:1, borderColor:gradeFilter===v?T.accent:T.border }}>
            <Text style={{ color:gradeFilter===v?AT:T.sub, fontSize:11, fontWeight:"700" }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {gs.filter(g=>gradeFilter==="all"||g.type===gradeFilter).length===0 ? (
        <View style={{ ...cd(), padding:24, alignItems:"center" }}>
          <Text style={{ fontSize:32, marginBottom:10 }}>📝</Text>
          <Text style={{ color:T.text, fontSize:14, fontWeight:"700", marginBottom:4 }}>Nenhuma nota ainda</Text>
          <Text style={{ color:T.sub, fontSize:12, textAlign:"center" }}>Adicione notas de simulados para ver gráficos e análises.</Text>
        </View>
      ) : (
        <>
          {weak && (
            <View style={{ backgroundColor:isDark?"#2a1800":"#fff7ed", borderRadius:16, padding:14, borderWidth:1, borderColor:isDark?"#78350f":"#fed7aa", marginBottom:14, flexDirection:"row", alignItems:"center", gap:12 }}>
              <View style={{ width:44, height:44, borderRadius:22, backgroundColor:isDark?"#78350f":"#fed7aa", alignItems:"center", justifyContent:"center" }}>
                <Text style={{ fontSize:22 }}>⚠️</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ color:"#f59e0b", fontSize:10, fontWeight:"800", textTransform:"uppercase", letterSpacing:0.5 }}>Área para melhorar</Text>
                <Text style={{ color:isDark?"#fbbf24":"#c2410c", fontSize:14, fontWeight:"800", marginTop:2 }}>{weak.subject}</Text>
                <Text style={{ color:isDark?"#fbbf24":"#c2410c", fontSize:11, opacity:0.8 }}>{weak.v} pts na última prova</Text>
              </View>
              <View style={{ backgroundColor:isDark?"#78350f":"#fed7aa", borderRadius:10, paddingHorizontal:10, paddingVertical:6 }}>
                <Text style={{ color:isDark?"#fbbf24":"#92400e", fontSize:13, fontWeight:"800" }}>{weak.v}</Text>
              </View>
            </View>
          )}
          <View style={cd({ padding:16, marginBottom:12 })}>
            <Text style={{ color:T.sub, fontSize:11, fontWeight:"700", marginBottom:10 }}>Evolução por área</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{ labels: bars.map(b=>b.name), datasets: [{ data: bars.length > 0 ? [1] : [0] }] }}
                width={Dimensions.get("window").width - 64}
                height={148}
                chartConfig={{
                  ...chartConfig,
                  barColors: ["#60a5fa", "#f87171", "#4ade80", "#fbbf24"],
                }}
                verticalLabelRotation={0}
                xAxisLabel=""
                yAxisSuffix=""
                style={{ marginLeft: -16 }}
                fromZero
                showValuesOnTopOfBars
              />
            </ScrollView>
          </View>
          <View style={cd({ padding:16, marginBottom:12 })}>
            <Text style={{ color:T.sub, fontSize:11, fontWeight:"700", marginBottom:12 }}>📊 Comparativo: Você vs Meta ({c1})</Text>
            {last && c1 ? (
              <View style={{ gap:12 }}>
                {ENEM_SUBJECTS.map(sub => {
                  const v = subjectScore(last.s, sub.k);
                  const targetVal = tgt;
                  const pct = Math.min(100, Math.round((v / targetVal) * 100));
                  const isAbove = v >= targetVal;
                  return (
                    <View key={sub.k}>
                      <View style={{ flexDirection:"row", justifyContent:"space-between", marginBottom:4 }}>
                        <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{sub.long}</Text>
                        <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
                          <Text style={{ color:T.muted, fontSize:10 }}>Meta: {tgt}</Text>
                          <Text style={{ color:isAbove?"#22c55e":"#f87171", fontSize:12, fontWeight:"800" }}>{v} pts ({pct}%)</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
                        <View style={{ flex:1, height:8, backgroundColor:T.card2, borderRadius:4, overflow:"hidden" }}>
                          <View style={{ width:tgt+"%", height:"100%", backgroundColor:"#22c55e40", position:"absolute", borderRadius:4 }} />
                          <View style={{ width:Math.min(100, v)+"%", height:"100%", backgroundColor:sub.color, borderRadius:4 }} />
                        </View>
                        {isAbove ? (
                          <Text style={{ fontSize:12 }}>✅</Text>
                        ) : (
                          <Text style={{ fontSize:12 }}>⚠️</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color:T.muted, fontSize:12, textAlign:"center", padding:10 }}>Adicione uma nota para ver o comparativo</Text>
            )}
          </View>
          <View style={cd({ padding:14 })}>
            <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <Text style={{ color:T.sub, fontSize:11, fontWeight:"700" }}>Histórico</Text>
              {gs.length > 0 && (
                <TouchableOpacity onPress={()=>setCompareMode(!compareMode)} style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:8, backgroundColor:compareMode?T.accent:T.card2, borderWidth:1, borderColor:compareMode?T.accent:T.border }}>
                  <Text style={{ color:compareMode?AT:T.sub, fontSize:10, fontWeight:"700" }}>🔍 Comparar</Text>
                </TouchableOpacity>
              )}
            </View>
            {compareMode && (
              <View style={{ backgroundColor:isDark?"#1a2e4a":"#dbeafe", borderRadius:12, padding:12, marginBottom:12, borderWidth:1, borderColor:isDark?"#3b82f6":"#93c5fd" }}>
                <Text style={{ color:isDark?"#60a5fa":"#1d4ed8", fontSize:11, fontWeight:"700", marginBottom:8 }}>Sua média vs Notas de Corte ({c1})</Text>
                {last && (
                  <View style={{ marginBottom:8 }}>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:"700" }}>📊 Sua última média: {avg(last)} pts</Text>
                  </View>
                )}
                {NOTAS_CORTE.filter(n=>n.curso===c1).slice(0,5).map((n,i)=>{
                  const userAvg = last ? avg(last) : 0;
                  const diff = userAvg - n.nota;
                  const canPass = userAvg >= n.nota;
                  return (
                    <View key={i} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:6, borderBottomWidth:i<4?1:0, borderColor:T.border }}>
                      <View style={{ flex:1 }}>
                        <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{n.uni}</Text>
                        <Text style={{ color:T.muted, fontSize:10 }}>Corte: {n.nota} pts · {n.vagas} vagas</Text>
                      </View>
                      <View style={{ alignItems:"flex-end" }}>
                        {userAvg > 0 ? (
                          <>
                            <Text style={{ color:canPass?"#22c55e":"#f87171", fontSize:12, fontWeight:"700" }}>{canPass?"✅ Passa":"❌ Não passa"}</Text>
                            <Text style={{ color:T.muted, fontSize:9 }}>{diff>=0?"+"+diff:diff} pts</Text>
                          </>
                        ) : (
                          <Text style={{ color:T.muted, fontSize:10 }}>Adicione nota</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
                <Text style={{ color:T.muted, fontSize:10, marginTop:8 }}>Comparando com as 5 primeiras notas de corte</Text>
              </View>
            )}
            {gs.filter(g=>gradeFilter==="all"||g.type===gradeFilter).map((g,i,arr)=>(
              <View key={g.id} style={{ flexDirection:"row", alignItems:"center", gap:10, paddingVertical:9, borderBottomWidth:i<arr.length-1?1:0, borderColor:T.border }}>
                <View style={{ width:32, height:32, borderRadius:16, backgroundColor:g.type==="simulado"?T.acBg:T.card2, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ fontSize:14 }}>{g.type==="simulado"?"📋":"📝"}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"700" }}>{g.ex}</Text>
                  <Text style={{ color:T.muted, fontSize:10 }}>{g.dt} · L{g.s.l} H{g.s.h} N{g.s.n} M{g.s.m} R{g.s.r}</Text>
                </View>
                <View style={{ alignItems:"flex-end", marginRight:6 }}>
                  <Text style={{ color:T.accent, fontSize:15, fontWeight:"800" }}>{avg(g)}</Text>
                  <Text style={{ color:T.muted, fontSize:9 }}>média</Text>
                </View>
                <TouchableOpacity onPress={()=>setGs(gs.filter(x=>x.id!==g.id))}><Text style={{ color:"#f87171", fontSize:14 }}>✕</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
