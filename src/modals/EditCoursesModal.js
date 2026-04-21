import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { BottomSheet } from "@/components/BottomSheet";
import { SBox } from "@/components/SBox";
import { ALL_COURSES } from "@/data/areas";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useCoursesStore } from "@/stores/coursesStore";

export function EditCoursesModal({ visible, onClose, onSave }) {
  const { T, isDark, AT } = useTheme();

  const c1 = useOnboardingStore(s => s.c1);
  const c2 = useOnboardingStore(s => s.c2);
  const fbCourses = useCoursesStore(s => s.fbCourses);

  const [eC1, setEC1] = useState("");
  const [eC2, setEC2] = useState("");
  const [ePick, setEpick] = useState(1);
  const [eSrch, setEsrch] = useState("");

  useEffect(() => { if (visible) { setEC1(c1); setEC2(c2); setEpick(1); setEsrch(""); } }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding:20, paddingBottom:24 }}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:12 }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>✏️ Editar opções de curso</Text>
        </View>
        <View style={{ flexDirection:"row", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          {[1,2].map(n=>(
            <TouchableOpacity key={n} onPress={()=>setEpick(n)} style={{ paddingHorizontal:13, paddingVertical:6, borderRadius:20, backgroundColor:ePick===n?T.accent:T.card2, borderWidth:1, borderColor:ePick===n?T.accent:T.border }}>
              <Text style={{ color:ePick===n?AT:T.sub, fontSize:11, fontWeight:"700" }}>{n}ª: {n===1?(eC1||"Escolher"):(eC2||"Opcional")}</Text>
            </TouchableOpacity>
          ))}
          {(!!eC1 || !!eC2) && <TouchableOpacity onPress={()=>{setEC1("");setEC2("");setEpick(1);}} style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:16, backgroundColor:"#f8717130", borderWidth:1, borderColor:"#f87171" }}>
            <Text style={{ color:"#f87171", fontSize:11, fontWeight:"700" }}>Limpar</Text>
          </TouchableOpacity>}
        </View>
        <SBox val={eSrch} set={setEsrch} ph="Buscar curso…" T={T} />
        <ScrollView style={{ maxHeight:280, marginTop:10 }} keyboardShouldPersistTaps="handled">
          {(fbCourses.length?fbCourses:ALL_COURSES).filter(cc=>cc.toLowerCase().includes(eSrch.toLowerCase())).map(cc=>{
            const s1=eC1===cc,s2=eC2===cc;
            return (
              <TouchableOpacity key={cc} onPress={()=>{
                if(s1){setEC1("");if(ePick===1)setEpick(1);}
                else if(s2){setEC2("");if(ePick===2)setEpick(2);}
                else if(ePick===1){setEC1(cc);setEpick(2);}
                else{setEC2(cc);}
              }} style={{ flexDirection:"row", justifyContent:"space-between", padding:12, borderRadius:14, backgroundColor:(s1||s2)?T.acBg:T.card2, marginBottom:6 }}>
                <Text style={{ color:(s1||s2)?T.accent:T.text, fontSize:13, fontWeight:(s1||s2)?"700":"500" }}>{cc}</Text>
                <Text style={{ color:T.accent, fontSize:11, fontWeight:"800" }}>{s1&&"1ª ✓"}{s2&&"2ª ✓"}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity onPress={()=>{ onSave(eC1||c1, eC2); onClose(); }} disabled={!eC1} style={{ padding:14, borderRadius:16, backgroundColor:eC1?T.accent:T.border, alignItems:"center", marginTop:12 }}>
          <Text style={{ color:eC1?AT:T.muted, fontSize:15, fontWeight:"800" }}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
