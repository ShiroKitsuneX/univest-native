import { View, Text, ActivityIndicator, StatusBar, Appearance } from "react-native";
import { useProfileStore } from "../stores/profileStore";

export function SplashScreen() {
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";

  return (
    <View style={{ flex:1, backgroundColor:isDark?"#0d1117":"#f0f4fb", justifyContent:"center", alignItems:"center", padding:32 }}>
      <StatusBar barStyle={isDark?"light-content":"dark-content"} />
      <View style={{ width:96, height:96, borderRadius:48, backgroundColor:isDark?"#161b27":"#ffffff", alignItems:"center", justifyContent:"center", marginBottom:22, borderWidth:1, borderColor:isDark?"#21293d":"#dde3ef", shadowColor:"#00E5A0", shadowOpacity:0.18, shadowRadius:18, shadowOffset:{width:0,height:4} }}>
        <Text style={{ fontSize:52 }}>🎓</Text>
      </View>
      <Text style={{ fontSize:34, fontWeight:"800", color:isDark?"#e6edf3":"#1a1f2e", marginBottom:8 }}>
        Uni<Text style={{ color:"#00E5A0" }}>Vest</Text>
      </Text>
      <Text style={{ fontSize:13, color:isDark?"#8b949e":"#5a6478", marginBottom:36, textAlign:"center" }}>Sua jornada acadêmica começa aqui</Text>
      <ActivityIndicator size="large" color="#00E5A0" />
    </View>
  );
}
