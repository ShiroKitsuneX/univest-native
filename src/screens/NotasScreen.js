import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { NOTAS_CORTE } from "../../constants";

const NotasScreen = () => {
  const { isDark } = useTheme();
  const { T, AT, cd, lbl, c1, setMedit, nSrch, setNsrch, gs, setMgr } = useApp();
  const [gradeFilter, setGradeFilter] = useState("all");

  const avg = (s) => s ? Math.round((s.l + s.h + s.n + s.m + (s.r || 0) / 10) / 5) : 0;
  const last = gs[gs.length - 1];
  const tgt = c1 ? NOTAS_CORTE.find(n => n.curso === c1)?.nota || 700 : 700;

  const filtN = nSrch
    ? NOTAS_CORTE.filter(n => n.curso.toLowerCase().includes(nSrch.toLowerCase()) || n.uni.toLowerCase().includes(nSrch.toLowerCase()))
    : NOTAS_CORTE;

  const bars = last ? [
    { name: "Lingu", value: last.s.l, color: "#f87171" },
    { name: "Human", value: last.s.h, color: "#a78bfa" },
    { name: "Natureza", value: last.s.n, color: "#34d399" },
    { name: "Mat", value: last.s.m, color: "#fbbf24" },
    { name: "Red", value: Math.round(last.s.r / 10), color: "#60a5fa" },
  ] : [];

  const chartConfig = {
    backgroundColor: T.card,
    backgroundGradientFrom: T.card,
    backgroundGradientTo: T.card,
    decimalPlaces: 0,
    color: (opacity = 1) => T.accent + Math.round(255 * opacity).toString(16).padStart(2, "0"),
    labelColor: () => T.sub,
    style: { borderRadius: 16 },
    propsForBackgroundLines: { strokeDasharray: "", stroke: T.border },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: isDark ? "#1a2e4a" : "#dbeafe", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: isDark ? "#3b82f6" : "#93c5fd" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 18 }}>🎯</Text>
              <Text style={{ color: isDark ? "#60a5fa" : "#1d4ed8", fontSize: 14, fontWeight: "700" }}>Meu Objetivo</Text>
            </View>
            <TouchableOpacity onPress={() => setMedit(true)} style={{ backgroundColor: isDark ? "#3b82f6" : "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: isDark ? "#60a5fa" : "#1d4ed8" }}>
              <Text style={{ color: isDark ? "#fff" : "#1d4ed8", fontSize: 10, fontWeight: "700" }}>✏️ editar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            {c1 ? (
              <View style={{ backgroundColor: isDark ? "#1e3a5f" : "#fff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isDark ? "#60a5fa" : "#1d4ed8" }}>
                <Text style={{ color: isDark ? "#60a5fa" : "#1d4ed8", fontSize: 13, fontWeight: "700" }}>1ª {c1}</Text>
              </View>
            ) : (
              <Text style={{ color: isDark ? "#60a5fa" : "#1d4ed8", fontSize: 12 }}>Selecione seu curso</Text>
            )}
          </View>
        </View>

        <Text style={[lbl, { marginBottom: 8 }]}>📊 Notas de Corte</Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: T.inp, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: T.inpB }}>
          <Text style={{ fontSize: 14, marginRight: 10 }}>🔍</Text>
          <TextInput value={nSrch} onChangeText={setNsrch} placeholder="Buscar outro curso ou universidade…" placeholderTextColor={T.muted} style={{ flex: 1, color: T.text, fontSize: 14 }} />
        </View>
        <View style={{ height: 10 }} />

        <View style={{ gap: 10, marginBottom: 20 }}>
          {filtN.map((n, i) => {
            const pct = Math.round((n.nota / 100) * 100);
            return (
              <View key={i} style={{ ...cd(), overflow: "hidden", borderLeftWidth: 4, borderLeftColor: n.cor }}>
                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: n.cor + "22", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: n.cor + "44" }}>
                      <Text style={{ color: n.cor, fontSize: 10, fontWeight: "800" }}>{n.uni.split(" ")[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontSize: 13, fontWeight: "800" }}>{n.curso}</Text>
                      <Text style={{ color: T.sub, fontSize: 11 }}>{n.uni} · {n.vagas} vagas</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <View style={{ backgroundColor: n.cor + "18", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: n.cor + "44" }}>
                        <Text style={{ color: n.cor, fontSize: 18, fontWeight: "800" }}>{n.nota}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: 10, backgroundColor: T.card2, borderRadius: 6, height: 4 }}>
                    <View style={{ width: pct + "%", height: "100%", backgroundColor: n.cor, borderRadius: 6, opacity: 0.8 }} />
                  </View>
                  <TouchableOpacity onPress={() => Linking.openURL(n.site)} style={{ marginTop: 8, alignSelf: "flex-start" }}>
                    <Text style={{ color: T.accent, fontSize: 10, fontWeight: "700" }}>Site oficial ↗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <Text style={lbl}>📈 Minhas Notas</Text>
          <TouchableOpacity onPress={() => setMgr(true)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: T.accent }}>
            <Text style={{ color: AT, fontSize: 12, fontWeight: "800" }}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
          {[["all", "Todas"], ["prova", "Provas"], ["simulado", "Simulados"]].map(([v, l]) => (
            <TouchableOpacity key={v} onPress={() => setGradeFilter(v)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: gradeFilter === v ? T.accent : T.card2, borderWidth: 1, borderColor: gradeFilter === v ? T.accent : T.border }}>
              <Text style={{ color: gradeFilter === v ? AT : T.sub, fontSize: 11, fontWeight: "700" }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {gs.length === 0 ? (
          <View style={{ ...cd(), padding: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 32, marginBottom: 10 }}>📝</Text>
            <Text style={{ color: T.text, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>Nenhuma nota ainda</Text>
            <Text style={{ color: T.sub, fontSize: 12, textAlign: "center" }}>Adicione notas de simulados para ver gráficos e análises.</Text>
          </View>
        ) : (
          <>
            <View style={cd({ padding: 16, marginBottom: 12 })}>
              <Text style={{ color: T.sub, fontSize: 11, fontWeight: "700", marginBottom: 10 }}>Evolução por área</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{ labels: bars.map(b => b.name), datasets: [{ data: bars.length > 0 ? bars.map(b => b.value) : [0] }] }}
                  width={Dimensions.get("window").width - 64}
                  height={148}
                  chartConfig={{
                    ...chartConfig,
                    barColors: bars.map(b => b.color),
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

            <View style={cd({ padding: 14 })}>
              <Text style={{ color: T.sub, fontSize: 11, fontWeight: "700", marginBottom: 12 }}>📊 Histórico</Text>
              {gs.map((g, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: i < gs.length - 1 ? 1 : 0, borderColor: T.border }}>
                  <View>
                    <Text style={{ color: T.text, fontSize: 12, fontWeight: "700" }}>{g.ex}</Text>
                    <Text style={{ color: T.sub, fontSize: 10 }}>{g.dt}</Text>
                  </View>
                  <Text style={{ color: T.accent, fontSize: 14, fontWeight: "800" }}>{avg(g.s)} pts</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotasScreen;