import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Appearance } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { BottomSheet } from "../components/BottomSheet";
import { DK, LT } from "../theme/palette";
import { db } from "../firebase/config";
import { saveLocalUserData } from "../services/storage";
import { useProfileStore } from "../stores/profileStore";
import { useAuthStore } from "../stores/authStore";

export function EditNameModal({ visible, onClose, currentData }) {
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  const nome = useProfileStore(s => s.nome);
  const setNome = useProfileStore(s => s.setNome);
  const sobrenome = useProfileStore(s => s.sobrenome);
  const setSobrenome = useProfileStore(s => s.setSobrenome);
  const currentUser = useAuthStore(s => s.currentUser);

  const [tmpNome, setTmpNome] = useState(nome);
  const [tmpSobrenome, setTmpSobrenome] = useState(sobrenome);

  useEffect(() => { if (visible) { setTmpNome(nome); setTmpSobrenome(sobrenome); } }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>👤 Alterar Nome</Text>
        </View>
        <View style={{ flexDirection:"row", gap:8, marginBottom:16 }}>
          <TextInput value={tmpNome} onChangeText={setTmpNome} placeholder="Nome" placeholderTextColor={T.muted} style={{ flex:1, padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14 }} />
          <TextInput value={tmpSobrenome} onChangeText={setTmpSobrenome} placeholder="Sobrenome" placeholderTextColor={T.muted} style={{ flex:1, padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14 }} />
        </View>
        <TouchableOpacity onPress={()=>{
          if (tmpNome.trim()) {
            setNome(tmpNome);
            setSobrenome(tmpSobrenome || "");
            onClose();
            if (currentUser) {
              const data = {nome:tmpNome,sobrenome:tmpSobrenome||"",updatedAt:new Date().toISOString()};
              saveLocalUserData({...currentData(),...data});
              setDoc(doc(db,"usuarios",currentUser.uid),data,{merge:true}).catch(()=>{});
            }
          }
        }} disabled={!tmpNome.trim()} style={{ padding:14, borderRadius:16, backgroundColor:tmpNome.trim()?T.accent:T.border, alignItems:"center" }}>
          <Text style={{ color:tmpNome.trim()?AT:T.muted, fontSize:15, fontWeight:"800" }}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
