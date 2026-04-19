import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { UNIVERSITIES } from "../constants";

const ExplorarScreen = () => {
  const { theme: T, isDark } = useTheme();
  const [search, setSearch] = useState("");

  const filteredUnis = search
    ? UNIVERSITIES.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.city.toLowerCase().includes(search.toLowerCase())
      )
    : UNIVERSITIES;

  const cd = (extra = {}) => ({
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    ...extra,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>Explorar</Text>
        <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
          Descubra universidades
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <View
          style={[
            cd({
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 11,
            }),
          ]}
        >
          <Text style={{ fontSize: 14, marginRight: 10 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, color: T.text, fontSize: 15 }}
            placeholder="Buscar universidades..."
            placeholderTextColor={T.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: T.sub, fontSize: 11, fontWeight: "700", marginBottom: 12 }}>
          {filteredUnis.length} RESULTADOS
        </Text>

        {filteredUnis.map((uni) => (
          <TouchableOpacity
            key={uni.id}
            style={[cd({ flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 })]}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: uni.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>
                {uni.name.slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: T.text, fontSize: 15, fontWeight: "700" }}>
                {uni.name}
              </Text>
              <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>
                {uni.city} • {uni.type}
              </Text>
            </View>
            <Text style={{ color: T.accent, fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExplorarScreen;