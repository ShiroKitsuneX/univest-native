import { View, Text, TouchableOpacity } from "react-native";

export function EmptyState({ icon = "📭", title, message, actionLabel, onAction, T }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
      <Text style={{ color: T?.text, fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 8 }}>
        {title || "Nada aqui ainda"}
      </Text>
      {message && (
        <Text style={{ color: T?.sub, fontSize: 14, textAlign: "center", marginBottom: 16 }}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity 
          onPress={onAction}
          style={{ backgroundColor: T?.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}