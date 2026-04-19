import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const PerfilScreen = () => {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const { currentUser, userData, logout } = useAuth();

  const cd = (extra = {}) => ({
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    ...extra,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>Perfil</Text>
        <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
          Sua conta
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {currentUser ? (
          <>
            <View style={[cd({ padding: 20, alignItems: "center", marginBottom: 16 })]}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: T.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: T.bg, fontSize: 32 }}>
                  {userData?.av || "🧑‍🎓"}
                </Text>
              </View>
              <Text style={{ color: T.text, fontSize: 18, fontWeight: "800" }}>
                {userData?.nome || "Usuário"}
              </Text>
              <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
                {currentUser.email}
              </Text>
            </View>

            <TouchableOpacity
              onPress={toggleTheme}
              style={[cd({ flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 })]}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>
                {isDark ? "🌙" : "☀️"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontSize: 15, fontWeight: "700" }}>
                  Tema {isDark ? "Escuro" : "Claro"}
                </Text>
                <Text style={{ color: T.sub, fontSize: 12 }}>
                  Toque para alternar
                </Text>
              </View>
              <Text style={{ color: T.accent }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={[
                cd({
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  marginTop: 20,
                  backgroundColor: "#dc262615",
                  borderColor: "#dc2626",
                }),
              ]}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>🚪</Text>
              <Text style={{ color: "#dc2626", fontSize: 15, fontWeight: "700" }}>
                Sair da conta
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[cd({ padding: 40, alignItems: "center" })]}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
            <Text
              style={{
                color: T.text,
                fontSize: 16,
                fontWeight: "800",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Entre ou cadastre-se
            </Text>
            <Text
              style={{
                color: T.sub,
                fontSize: 13,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Faça login para acessar seu perfil e seguir universidades.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: T.accent,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: T.bg, fontWeight: "800", fontSize: 14 }}>
                Fazer login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerfilScreen;