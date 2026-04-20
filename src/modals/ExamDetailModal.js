import { View, Text, TouchableOpacity, Linking, Appearance } from "react-native";
import { BottomSheet } from "../components/BottomSheet";
import { DK, LT } from "../theme/palette";
import { useProfileStore } from "../stores/profileStore";

export function ExamDetailModal({ exam, onClose }) {
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  return (
    <BottomSheet visible={!!exam && !exam?.isList} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        {exam?.status === "upcoming" ? (
          <>
            <View style={{ flexDirection:"row", alignItems:"center", marginBottom:16 }}>
              <TouchableOpacity onPress={onClose} style={{ marginRight:12 }}>
                <Text style={{ color:T.accent, fontSize:24 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>📋 {exam.subject}</Text>
            <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>{exam.year} · {exam.phase}</Text>
            <View style={{ backgroundColor:isDark?"#2a2a1a":"#fffbeb", borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderColor:isDark?"#5c4d1a":"#fcd34d" }}>
              <Text style={{ color:"#f59e0b", fontSize:14, fontWeight:"800", marginBottom:6 }}>⏳ Prova ainda não realizada</Text>
              <Text style={{ color:T.sub, fontSize:13, lineHeight:20 }}>Esta prova está prevista para {exam.date}. Quando estiver disponível, você poderá baixar o PDF e acessar pelo site da instituição.</Text>
            </View>
            <View style={{ backgroundColor:T.card2, borderRadius:14, padding:14, marginBottom:14, borderWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.text, fontSize:13, marginBottom:8 }}>⏱️ Duração: <Text style={{ fontWeight:"700" }}>{exam.duration}</Text></Text>
              <Text style={{ color:T.text, fontSize:13 }}>❓ Questões: <Text style={{ fontWeight:"700" }}>{exam.questions}</Text></Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(exam.sourceUrl)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:T.accent }}>
              <Text style={{ fontSize:16, marginRight:8 }}>🌐</Text>
              <Text style={{ color:AT, fontSize:14, fontWeight:"700" }}>Acompanhar no site</Text>
            </TouchableOpacity>
          </>
        ) : exam ? (
          <>
            <View style={{ flexDirection:"row", alignItems:"center", marginBottom:16 }}>
              <TouchableOpacity onPress={onClose} style={{ marginRight:12 }}>
                <Text style={{ color:T.accent, fontSize:24 }}>✕</Text>
              </TouchableOpacity>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>{exam.subject}</Text>
                <Text style={{ color:T.sub, fontSize:12 }}>{exam.year} · {exam.phase}</Text>
              </View>
            </View>
            <View style={{ backgroundColor:T.card2, borderRadius:14, padding:14, marginBottom:14, borderWidth:1, borderColor:T.border }}>
              <View style={{ flexDirection:"row", marginBottom:10 }}>
                <Text style={{ color:T.sub, fontSize:13, width:80 }}>📅 Data</Text>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{exam.date}</Text>
              </View>
              <View style={{ flexDirection:"row", marginBottom:10 }}>
                <Text style={{ color:T.sub, fontSize:13, width:80 }}>⏱️ Duração</Text>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{exam.duration}</Text>
              </View>
              <View style={{ flexDirection:"row", marginBottom:10 }}>
                <Text style={{ color:T.sub, fontSize:13, width:80 }}>❓ Questões</Text>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{exam.questions}</Text>
              </View>
              {exam.description && <Text style={{ color:T.sub, fontSize:12, marginTop:4, lineHeight:18 }}>{exam.description}</Text>}
            </View>
            <View style={{ flexDirection:"row", gap:10 }}>
              <TouchableOpacity onPress={() => Linking.openURL(exam.sourceUrl)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:T.accent }}>
                <Text style={{ fontSize:16, marginRight:6 }}>🌐</Text>
                <Text style={{ color:AT, fontSize:13, fontWeight:"700" }}>Site</Text>
              </TouchableOpacity>
              {exam.pdfUrl ? (
                <TouchableOpacity onPress={() => Linking.openURL(exam.pdfUrl)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:isDark?"#1a2e4a":"#dbeafe", borderWidth:1, borderColor:isDark?"#3b82f6":"#93c5fd" }}>
                  <Text style={{ fontSize:16, marginRight:6 }}>📄</Text>
                  <Text style={{ color:"#60a5fa", fontSize:13, fontWeight:"700" }}>PDF</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:isDark?"#1a1a1a":"#f5f5f5" }}>
                  <Text style={{ color:T.muted, fontSize:12 }}>PDF indisponível</Text>
                </View>
              )}
            </View>
          </>
        ) : null}
      </View>
    </BottomSheet>
  );
}
