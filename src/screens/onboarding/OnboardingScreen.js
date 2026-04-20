import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Appearance, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { DK, LT } from "../../theme/palette";
import { USER_TYPES } from "../../data/userTypes";
import { ALL_COURSES } from "../../data/areas";
import { SBox } from "../../components/SBox";
import { useProfileStore } from "../../stores/profileStore";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useUniversitiesStore } from "../../stores/universitiesStore";
import { useCoursesStore } from "../../stores/coursesStore";
import { useAuthStore } from "../../stores/authStore";

export function OnboardingScreen({ hStep, hDone, hUType, hC1, hC2 }) {
  const insets = useSafeAreaInsets();
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  const step = useOnboardingStore(s => s.step);
  const uType = useOnboardingStore(s => s.uType);
  const c1 = useOnboardingStore(s => s.c1);
  const c2 = useOnboardingStore(s => s.c2);

  const unis = useUniversitiesStore(s => s.unis);
  const setUnis = useUniversitiesStore(s => s.setUnis);

  const fbCourses = useCoursesStore(s => s.fbCourses);
  const getIcon = (id, fallback) => useCoursesStore.getState().getIcon(id, fallback);

  const currentUser = useAuthStore(s => s.currentUser);

  const [cSrch, setCsrch] = useState("");
  const [uSrch, setUsrch] = useState("");
  const [picking, setPick] = useState(1);

  const coursesToUse = fbCourses.length ? fbCourses : ALL_COURSES;
  const cd = (extra = {}) => ({ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, ...extra });

  const fC = coursesToUse.filter(c => c.toLowerCase().includes(cSrch.toLowerCase())).sort((a, b) => {
    const la = a.toLowerCase(), lb = b.toLowerCase(), ls = cSrch.toLowerCase();
    if (la === ls && lb !== ls) return -1; if (la !== ls && lb === ls) return 1;
    if (la.startsWith(ls) && !lb.startsWith(ls)) return -1; if (!la.startsWith(ls) && lb.startsWith(ls)) return 1;
    return la.localeCompare(lb);
  });
  const canNext = step === 1 ? !!uType : step === 2 ? !!c1 : true;

  const finishOnboarding = async () => {
    hDone(true);
    if (!currentUser) return;
    try {
      const dataToSave = {
        done: true,
        uTypeId: uType?.id,
        c1, c2,
        followedUnis: unis.filter(u => u.followed).map(u => u.name),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "usuarios", currentUser.uid), dataToSave, { merge: true });
    } catch (e) { console.log("Error saving onboarding:", e.message); }
  };

  const filteredUnis = unis.filter(u => !uSrch || u.name.toLowerCase().includes(uSrch.toLowerCase()) || u.fullName.toLowerCase().includes(uSrch.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: T.text }}>Uni<Text style={{ color: T.accent }}>Vest</Text></Text>
      </View>
      {step === 1 && (
        <>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: T.border }}>
            <Text style={{ color: T.muted, fontSize: 10, marginBottom: 4 }}>Passo 1 de 3</Text>
            <Text style={{ color: T.text, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>O que melhor descreve você?</Text>
            <Text style={{ color: T.sub, fontSize: 11 }}>Você pode alterar depois nas configurações</Text>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            {USER_TYPES.map(ut => (
              <TouchableOpacity key={ut.id} onPress={() => hUType(uType?.id === ut.id ? null : ut)} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, backgroundColor: uType?.id === ut.id ? T.acBg : T.card2, borderWidth: 1.5, borderColor: uType?.id === ut.id ? T.accent : T.border, marginBottom: 8 }}>
                <Text style={{ fontSize: 24, marginRight: 14 }}>{getIcon("user_type_" + ut.id, ut.emoji)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: T.text }}>{ut.label}</Text>
                  <Text style={{ fontSize: 11, color: T.sub }}>{ut.sub}</Text>
                </View>
                {uType?.id === ut.id && <Text style={{ color: T.accent, fontSize: 16, fontWeight: "800" }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
      {step === 2 && (
        <>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderColor: T.border }}>
            <Text style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>Passo 2 de 3</Text>
            <Text style={{ color: T.text, fontSize: 20, fontWeight: "800" }}>Qual curso te interessa?</Text>
            <Text style={{ color: T.sub, fontSize: 12, marginTop: 3, marginBottom: 10 }}>Escolha 1ª e 2ª opção</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {[1, 2].map(n => (
                <TouchableOpacity key={n} onPress={() => setPick(n)} style={{ paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, backgroundColor: picking === n ? T.accent : T.card2, borderWidth: 1, borderColor: picking === n ? T.accent : T.border }}>
                  <Text style={{ color: picking === n ? AT : T.sub, fontSize: 11, fontWeight: "700" }}>{n}ª: {n === 1 ? (c1 || "Escolher") : (c2 || "Opcional")}</Text>
                </TouchableOpacity>
              ))}
              {(!!c1 || !!c2) && <TouchableOpacity onPress={() => { hC1(""); hC2(""); setPick(1); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f8717130", borderWidth: 1, borderColor: "#f87171" }}>
                <Text style={{ color: "#f87171", fontSize: 11, fontWeight: "700" }}>Limpar</Text>
              </TouchableOpacity>}
            </View>
            <SBox val={cSrch} set={setCsrch} ph="Buscar curso…" T={T} />
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            {fC.map(cc => { const s1 = c1 === cc, s2 = c2 === cc; return (
              <TouchableOpacity key={cc} onPress={() => {
                if (s1) { hC1(""); if (picking === 1) setPick(1); }
                else if (s2) { hC2(""); if (picking === 2) setPick(2); }
                else if (picking === 1) { hC1(cc); setPick(2); }
                else { hC2(cc); }
              }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 14, backgroundColor: (s1 || s2) ? T.acBg : T.card2, marginBottom: 6 }}>
                <Text style={{ color: (s1 || s2) ? T.accent : T.text, fontSize: 13, fontWeight: (s1 || s2) ? "700" : "500" }}>{cc}</Text>
                <Text style={{ fontSize: 11, fontWeight: "800", color: T.accent }}>{s1 && "1ª ✓"}{s2 && "2ª ✓"}</Text>
              </TouchableOpacity>
            ); })}
          </ScrollView>
        </>
      )}
      {step === 3 && (
        <>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderColor: T.border }}>
            <Text style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>Passo 3 de 3</Text>
            <Text style={{ color: T.text, fontSize: 20, fontWeight: "800" }}>Quais universidades seguir?</Text>
            <Text style={{ color: T.sub, fontSize: 12, marginTop: 3, marginBottom: 10 }}>Escolha para personalizar seu feed</Text>
            <SBox val={uSrch} set={setUsrch} ph="Buscar universidade…" T={T} />
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            {filteredUnis.map(u => (
              <View key={u.id} style={{ ...cd(), flexDirection: "row", alignItems: "center", padding: 15, marginBottom: 8 }}>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: u.color, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>{u.name.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 14, fontWeight: "800" }}>{u.name}</Text>
                  <Text style={{ color: T.sub, fontSize: 11 }}>{u.city} · {u.state}</Text>
                </View>
                <TouchableOpacity onPress={() => setUnis(prev => prev.map(x => x.id === u.id ? { ...x, followed: !x.followed } : x))} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 11, backgroundColor: u.followed ? "#dc2626" : T.accent }}>
                  <Text style={{ color: u.followed ? "#fff" : AT, fontSize: 11, fontWeight: "800" }}>{u.followed ? "Seguindo" : "+ Seguir"}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {filteredUnis.length === 0 && (
              <Text style={{ color: T.muted, textAlign: "center", padding: 30, fontSize: 13 }}>Nenhuma universidade encontrada.</Text>
            )}
          </ScrollView>
        </>
      )}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 10, paddingTop: 10, backgroundColor: T.bg }}>
        <View style={{ height: 3, backgroundColor: T.border, borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
          <View style={{ width: ((step / 3) * 100) + "%", height: "100%", backgroundColor: T.accent, borderRadius: 2 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {step > 1 && <TouchableOpacity onPress={() => hStep(s => s - 1)} style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: T.card2, alignItems: "center", borderWidth: 1, borderColor: T.border }}><Text style={{ color: T.sub, fontSize: 14, fontWeight: "700" }}>← Voltar</Text></TouchableOpacity>}
          <TouchableOpacity disabled={!canNext} onPress={() => { if (step < 3) hStep(step + 1); else finishOnboarding(); }} style={{ flex: 2, padding: 14, borderRadius: 16, backgroundColor: canNext ? T.accent : T.border, alignItems: "center" }}>
            <Text style={{ color: canNext ? AT : T.muted, fontSize: 15, fontWeight: "800" }}>{step === 3 ? "Entrar no app 🚀" : "Continuar →"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
