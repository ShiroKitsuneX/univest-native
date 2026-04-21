import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/useTheme";
import { BottomSheet } from "../components/BottomSheet";
import { AVATAR_PRESETS, AVATAR_COLORS } from "../theme/avatar";
import { useProfileStore } from "../stores/profileStore";

export function AvatarPickerModal({ visible, onClose }) {
  const { T, isDark, AT } = useTheme();

  const av = useProfileStore(s => s.av);
  const setAv = useProfileStore(s => s.setAv);
  const avBgIdx = useProfileStore(s => s.avBgIdx);
  const setAvBgIdx = useProfileStore(s => s.setAvBgIdx);

  const [tmpAv, setTmpAv] = useState(av);
  const [tmpBgIdx, setTmpBgIdx] = useState(avBgIdx);

  useEffect(() => { if (visible) { setTmpAv(av); setTmpBgIdx(avBgIdx); } }, [visible]);

  const lbl = { color: T.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 };

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:12 }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>📷 Foto de Perfil</Text>
        </View>
        <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>Escolha como aparecer no app</Text>
        <Text style={[lbl,{marginBottom:10}]}>Ícones</Text>
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginBottom:18 }}>
          {AVATAR_PRESETS.map(e=>(
            <TouchableOpacity key={e} onPress={()=>setTmpAv(e)} style={{ width:"23%", height:52, borderRadius:26, backgroundColor:tmpAv===e?T.acBg:T.card2, borderWidth:2, borderColor:tmpAv===e?T.accent:T.border, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ fontSize:26 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[lbl,{marginBottom:10}]}>Cor de fundo</Text>
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginBottom:18 }}>
          {AVATAR_COLORS.map(([c1c],idx)=>(
            <TouchableOpacity key={idx} onPress={()=>setTmpBgIdx(idx)} style={{ width:52, height:52, borderRadius:26, backgroundColor:c1c, borderWidth:tmpBgIdx===idx?3:1, borderColor:tmpBgIdx===idx?"#fff":c1c+"40" }} />
          ))}
        </View>
        <TouchableOpacity onPress={()=>{
          setAv(tmpAv);
          setAvBgIdx(tmpBgIdx);
          onClose();
        }} style={{ padding:14, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
          <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
