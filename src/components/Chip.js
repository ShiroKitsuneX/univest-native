import { TouchableOpacity, Text } from "react-native";

export function Chip({ label, selected, onPress, color = "#6366f1", T }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        backgroundColor: selected ? color : "transparent",
        borderWidth: 1,
        borderColor: selected ? color : T?.border || "#ccc",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{
        color: selected ? "#fff" : T?.text || "#333",
        fontSize: 13,
        fontWeight: "500",
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}