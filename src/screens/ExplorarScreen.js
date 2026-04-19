import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";

const ExplorarScreen = () => {
  const { isDark } = useTheme();
  const {
    T, AT, cd, lbl, query, setQuery, fSt, setFSt, unis, setSU,
    refreshing, setRefreshing, setShowLogin, loginBtnScale, fmtCount,
    setLoginMode, setAuthTouched
  } = useApp();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const hasSearch = query.length > 0;
  const filteredBySearch = hasSearch
    ? unis.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.fullName.toLowerCase().includes(query.toLowerCase()))
    : unis;
  const filtU = fSt === "Todos" ? filteredBySearch : filteredBySearch.filter(u => u.state === fSt);

  const allStates = [...new Set(unis.map(u => u.state))].filter(Boolean);
  const validStates = allStates.filter(s => s && s.length === 2 && /^[A-Z]{2}$/.test(s));
  const filterChips = ["Todos", ...validStates.sort()];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}
      >
        <TouchableOpacity style={{ backgroundColor: isDark ? "#1a2e4a" : "#dbeafe", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, borderWidth: 1, borderColor: isDark ? "#3b82f6" : "#93c5fd" }}>
          <Text style={{ fontSize: 20 }}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontSize: 12, fontWeight: "700" }}>Defina seu destino de estudos</Text>
            <Text style={{ color: T.sub, fontSize: 10 }}>Toque para selecionar onde você pretende estudar</Text>
          </View>
          <Text style={{ color: T.accent, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ backgroundColor: isDark ? "#0c1f3a" : "#dbeafe", borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14, borderWidth: 1, borderColor: isDark ? "#1e40af40" : "#bfdbfe" }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: isDark ? "#1e3a6a" : "#bfdbfe", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 28 }}>🧭</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontSize: 14, fontWeight: "800" }}>Ainda não sabe qual curso?</Text>
            <Text style={{ color: T.sub, fontSize: 11, marginTop: 2, lineHeight: 15 }}>Explore por área, nota de corte e mercado de trabalho</Text>
          </View>
          <View style={{ backgroundColor: T.accent, borderRadius: 12, width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: AT, fontWeight: "800", fontSize: 16 }}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: T.inp, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: T.inpB }}>
          <Text style={{ fontSize: 14, marginRight: 10 }}>🔍</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar universidade…" placeholderTextColor={T.muted} style={{ flex: 1, color: T.text, fontSize: 14, padding: 0 }} />
          {query ? <TouchableOpacity onPress={() => setQuery("")}><Text style={{ color: T.muted, fontSize: 13 }}>✕</Text></TouchableOpacity> : null}
        </View>

        {hasSearch && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 4 }}>
            <Text style={{ color: T.accent, fontSize: 12, fontWeight: "600" }}>🔍 {filtU.length} resultado{filtU.length !== 1 ? "s" : ""}</Text>
            <Text style={{ color: T.muted, fontSize: 11, marginLeft: 8 }}>para "{query}"</Text>
          </View>
        )}

        <View style={{ height: 10 }} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {filterChips.map(s => {
            const isSelected = fSt === s;
            return (
              <TouchableOpacity key={s} onPress={() => setFSt(isSelected ? "Todos" : s)} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: isSelected ? T.accent : T.card2, marginRight: 7, borderWidth: 1, borderColor: isSelected ? T.accent : T.border }}>
                <Text style={{ color: isSelected ? AT : T.sub, fontSize: 12, fontWeight: "700" }}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ gap: 9 }}>
          {filtU.map(u => (
            <TouchableOpacity key={u.id} onPress={() => setSU(u)} style={{ ...cd(), flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderLeftWidth: u.followed ? 3 : 0, borderLeftColor: u.color }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: u.color, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>{u.name.slice(0, 2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: T.text, fontSize: 15, fontWeight: "800" }}>{u.name}</Text>
                </View>
                <Text style={{ color: T.sub, fontSize: 11 }} numberOfLines={1}>{u.fullName}</Text>
                <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
                  {[u.state, u.type].map(x => <View key={x} style={{ backgroundColor: T.card2, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}><Text style={{ color: T.muted, fontSize: 9, fontWeight: "600" }}>{x}</Text></View>)}
                  <Text style={{ color: T.sub, fontSize: 10 }}>👥 {fmtCount(u.followersCount ?? u.followers)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 10 }} />

        <TouchableOpacity
          onPress={() => {
            setLoginMode("login");
            setShowLogin(true);
            setAuthTouched({ email: false, nome: false, sobrenome: false, senha: false, confirmarSenha: false, nascimento: false });
          }}
          activeOpacity={0.9}
        >
          <View style={{ padding: 16, borderRadius: 18, backgroundColor: T.accent, alignItems: "center", shadowColor: T.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
            <Text style={{ color: AT, fontSize: 16, fontWeight: "800" }}>Entrar ou criar conta</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExplorarScreen;