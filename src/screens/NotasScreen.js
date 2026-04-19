import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { NOTAS_CORTE } from "../constants";

const NotasScreen = () => {
  const { theme: T, isDark } = useTheme();
  const [filter, setFilter] = useState("Todos");

  const cd = (extra = {}) => ({
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    ...extra,
  });

  const filteredNotas = filter === "Todos" 
    ? NOTAS_CORTE 
    : NOTAS_CORTE.filter(n => n.curso === filter);

  const courses = ["Todos", ...new Set(NOTAS_CORTE.map(n => n.curso))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>Notas de Corte</Text>
        <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
          Notas mínimas para aprovação
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 12 }}>
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {courses.map((course) => (
            <TouchableOpacity
              key={course}
              onPress={() => setFilter(course)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === course ? T.accent : T.card,
                borderWidth: 1,
                borderColor: filter === course ? T.accent : T.border,
              }}
            >
              <Text
                style={{
                  color: filter === course ? T.bg : T.text,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {filteredNotas.map((nota, index) => (
          <TouchableOpacity
            key={index}
            style={[cd({ flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 })]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.text, fontSize: 15, fontWeight: "700" }}>
                {nota.curso}
              </Text>
              <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>
                {nota.uni} • {nota.vagas} vagas
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: nota.cor || T.accent, fontSize: 22, fontWeight: "900" }}>
                {nota.nota}
              </Text>
              <Text style={{ color: T.sub, fontSize: 10 }}>pontos</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotasScreen;