import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const FeedScreen = () => {
  const { theme: T, isDark } = useTheme();
  const { currentUser } = useAuth();

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
        <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>Feed</Text>
        <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
          Sigue universidades para ver novidades
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {!currentUser ? (
          <View style={[cd({ alignItems: "center", padding: 40 })]}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
            <Text style={{ color: T.text, fontSize: 16, fontWeight: "800", marginBottom: 8 }}>
              Faça login para ver o feed
            </Text>
            <Text style={{ color: T.sub, fontSize: 13, textAlign: "center" }}>
              Entre com sua conta para acompanhar universidades e ver novidades.
            </Text>
          </View>
        ) : (
          <View style={[cd({ alignItems: "center", padding: 40 })]}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📰</Text>
            <Text style={{ color: T.text, fontSize: 16, fontWeight: "800", marginBottom: 8 }}>
              Seu feed está vazio
            </Text>
            <Text style={{ color: T.sub, fontSize: 13, textAlign: "center", marginBottom: 20 }}>
              Siga universidades na aba Explorar para ver novidades.
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
                Explorar universidades
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedScreen;