import { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, Appearance, Linking, StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { db } from "./src/firebase/config";
import { doc, setDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";

import { ALL_COURSES } from "./src/data/areas";
import { DK, LT } from "./src/theme/palette";
import { AVATAR_COLORS } from "./src/theme/avatar";
import { loadLocalUserData, saveLocalUserData } from "./src/services/storage";
import { onAuthChange, logout } from "./src/services/auth";
import { fetchUserDoc } from "./src/services/firestore";
import { useGeoStore } from "./src/stores/geoStore";
import { useCoursesStore } from "./src/stores/coursesStore";
import { usePostsStore } from "./src/stores/postsStore";
import { useProgressStore } from "./src/stores/progressStore";
import { useUniversitiesStore } from "./src/stores/universitiesStore";
import { useOnboardingStore } from "./src/stores/onboardingStore";
import { useProfileStore } from "./src/stores/profileStore";
import { useAuthStore } from "./src/stores/authStore";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { WelcomeScreen } from "./src/screens/auth/WelcomeScreen";
import { OnboardingScreen } from "./src/screens/onboarding/OnboardingScreen";
import { FeedScreen } from "./src/screens/feed/FeedScreen";
import { NotasScreen } from "./src/screens/notas/NotasScreen";
import { ExplorarScreen } from "./src/screens/explorar/ExplorarScreen";
import { FollowingScreen } from "./src/screens/explorar/FollowingScreen";
import { BooksListScreen } from "./src/screens/explorar/BooksListScreen";
import { ExamsListScreen } from "./src/screens/explorar/ExamsListScreen";
import { UniversityDetailScreen } from "./src/screens/explorar/UniversityDetailScreen";
import { PerfilScreen } from "./src/screens/perfil/PerfilScreen";
import { ShareModal } from "./src/modals/ShareModal";
import { UniSortModal } from "./src/modals/UniSortModal";
import { AddGradeModal } from "./src/modals/AddGradeModal";
import { SavedPostsModal } from "./src/modals/SavedPostsModal";
import { EventDetailModal } from "./src/modals/EventDetailModal";
import { ExamDetailModal } from "./src/modals/ExamDetailModal";
import { DiscoverCoursesModal } from "./src/modals/DiscoverCoursesModal";
import { AvatarPickerModal } from "./src/modals/AvatarPickerModal";
import { EditNameModal } from "./src/modals/EditNameModal";
import { EditCoursesModal } from "./src/modals/EditCoursesModal";
import { LocationSettingsModal } from "./src/modals/LocationSettingsModal";
import { GoalsModal } from "./src/modals/GoalsModal";
import { SettingsModal } from "./src/modals/SettingsModal";

function MainApp() {
  const insets = useSafeAreaInsets();
  const colorScheme = Appearance.getColorScheme();
  const theme = useProfileStore(s => s.theme);
  const setTheme = useProfileStore(s => s.setTheme);
  const isDark = theme==="auto" ? colorScheme==="dark" : theme==="dark";
  const T = isDark ? DK : LT;
  const AT = isDark ? "#000" : "#fff";

  const currentUser = useAuthStore(s => s.currentUser);
  const setCurrentUser = useAuthStore(s => s.setCurrentUser);
  const authLoading = useAuthStore(s => s.authLoading);
  const setAuthLoading = useAuthStore(s => s.setAuthLoading);
  const userData = useAuthStore(s => s.userData);
  const setUserData = useAuthStore(s => s.setUserData);
  const nome = useProfileStore(s => s.nome);
  const setNome = useProfileStore(s => s.setNome);
  const sobrenome = useProfileStore(s => s.sobrenome);
  const setSobrenome = useProfileStore(s => s.setSobrenome);

  const step = useOnboardingStore(s => s.step);
  const setStep = useOnboardingStore(s => s.setStep);
  const done = useOnboardingStore(s => s.done);
  const setDone = useOnboardingStore(s => s.setDone);
  const uType = useOnboardingStore(s => s.uType);
  const setUType = useOnboardingStore(s => s.setUType);
  const c1 = useOnboardingStore(s => s.c1);
  const setC1 = useOnboardingStore(s => s.setC1);
  const c2 = useOnboardingStore(s => s.c2);
  const setC2 = useOnboardingStore(s => s.setC2);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const [tab, setTab] = useState("feed");
  const unis = useUniversitiesStore(s => s.unis);
  const setUnis = useUniversitiesStore(s => s.setUnis);
  const fbUnis = useUniversitiesStore(s => s.fbUnis);
  const setFbUnis = useUniversitiesStore(s => s.setFbUnis);
  const fbCourses = useCoursesStore(s => s.fbCourses);
  const fbIcons = useCoursesStore(s => s.fbIcons);
  const selUni = useUniversitiesStore(s => s.selUni);
  const setSU = useUniversitiesStore(s => s.setSelUni);
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis);
  const setGoalsUnis = useUniversitiesStore(s => s.setGoalsUnis);
  const [goalsModal, setGoalsModal] = useState(false);
  const completedTodos = useProgressStore(s => s.completedTodos);
  const setCompletedTodos = useProgressStore(s => s.setCompletedTodos);
  const readBooks = useProgressStore(s => s.readBooks);
  const setReadBooks = useProgressStore(s => s.setReadBooks);
  const readingBooks = useProgressStore(s => s.readingBooks);
  const setReadingBooks = useProgressStore(s => s.setReadingBooks);
  const saved = usePostsStore(s => s.saved);
  const setSaved = usePostsStore(s => s.setSaved);
  const liked = usePostsStore(s => s.liked);
  const setLiked = usePostsStore(s => s.setLiked);
  const [refreshing, setRefreshing] = useState(false);

  const gs = useProfileStore(s => s.gs);
  const setGs = useProfileStore(s => s.setGs);

  const av = useProfileStore(s => s.av);
  const setAv = useProfileStore(s => s.setAv);
  const avBgIdx = useProfileStore(s => s.avBgIdx);
  const setAvBgIdx = useProfileStore(s => s.setAvBgIdx);

  const [mCfg,  setMcfg]  = useState(false);
  const [mPho,  setMpho]  = useState(false);
  const [mEdit, setMedit] = useState(false);
  const [mNome, setMnome] = useState(false);
  const [mEv,   setMev]   = useState(null);
  const [mExam, setMexam] = useState(null);
  const [showExamsPage, setShowExamsPage] = useState(false);

  const [showBooksPage, setShowBooksPage] = useState(false);
  const [showFollowingPage, setShowFollowingPage] = useState(false);
  const [mGr,   setMgr]   = useState(false);
  const [mShr,  setMshr]  = useState(null);
  const [mDisc, setMdisc] = useState(false);
  const [mUni,  setMUni]  = useState(false);
  const [mLoc,  setMloc]  = useState(false);
  const [mSaved, setMSaved] = useState(false);
  const countryId = useProfileStore(s => s.countryId);
  const setCountryId = useProfileStore(s => s.setCountryId);
  const stateId = useProfileStore(s => s.stateId);
  const setStateId = useProfileStore(s => s.setStateId);
  const cityId = useProfileStore(s => s.cityId);
  const setCityId = useProfileStore(s => s.setCityId);
  const studyCountryId = useProfileStore(s => s.studyCountryId);
  const setStudyCountryId = useProfileStore(s => s.setStudyCountryId);
  const studyStateId = useProfileStore(s => s.studyStateId);
  const setStudyStateId = useProfileStore(s => s.setStudyStateId);
  const studyCityId = useProfileStore(s => s.studyCityId);
  const setStudyCityId = useProfileStore(s => s.setStudyCityId);

  const getIcon = (id, fallback) => fbIcons[id] || fallback;

  const currentData = () => ({
    step, done, uTypeId:uType?.id, c1, c2, theme, av, avBgIdx, nome, sobrenome,
    grades:gs, saved, liked, followedUnis: unis.filter(u=>u.followed).map(u=>u.name),
    countryId, stateId, cityId, studyCountryId, studyStateId, studyCityId,
    readBooks, readingBooks
  });

  useEffect(() => {
    loadLocalUserData().then(localData => {
      if (localData) {
        useOnboardingStore.getState().hydrateFromLocal(localData);
        useProfileStore.getState().hydrate(localData);
        useProgressStore.getState().hydrate(localData);
        usePostsStore.getState().hydrate(localData);
      }
      setOnboardingLoaded(true);
    });
  }, []);

  const syncUserData = async (overrides) => {
    const data = { ...currentData(), ...overrides };
    await saveLocalUserData(data);
    if (currentUser) {
      try { await setDoc(doc(db,"usuarios",currentUser.uid),{...data,updatedAt:new Date().toISOString()},{merge:true}); } catch {}
    }
  };

  const hStep = (v) => { const n = typeof v==="function"?v(step):v; setStep(n); syncUserData({ step:n }); };
  const hDone = (v) => { setDone(v); syncUserData({ done:v }); };
  const hUType = (v) => { setUType(v); syncUserData({ uTypeId:v?.id }); };
  const hC1 = (v) => { setC1(v); syncUserData({ c1:v }); };
  const hC2 = (v) => { setC2(v); syncUserData({ c2:v }); };

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const fbData = await fetchUserDoc(user.uid);
          if (fbData) {
            await saveLocalUserData(fbData);
            setUserData(fbData);
            useOnboardingStore.getState().hydrateFromFb(fbData);
            useProfileStore.getState().hydrate(fbData);
            useProgressStore.getState().hydrate(fbData);
            usePostsStore.getState().hydrate(fbData);
            useUniversitiesStore.getState().hydrate(fbData);
          } else {
            setUserData({ followedUnis: [] });
            setStep(1); setDone(false);
          }
        } catch (e) { console.log("Error loading user data:", e.message); }
      } else { setCurrentUser(null); setUserData(null); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    useCoursesStore.getState().load();
    useGeoStore.getState().load();
    useUniversitiesStore.getState().load();
  }, []);

  useEffect(() => {
    useUniversitiesStore.getState().applyFollowedUnis(userData?.followedUnis);
  }, [fbUnis, userData]);

  useEffect(() => {
    (async () => {
      await usePostsStore.getState().load();
      if (currentUser) await usePostsStore.getState().loadLikesFor(currentUser.uid);
    })();
  }, [currentUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        useUniversitiesStore.getState().load(),
        usePostsStore.getState().load(),
      ]);
      if (currentUser) {
        await usePostsStore.getState().loadLikesFor(currentUser.uid);
      }
    } catch {}
    setRefreshing(false);
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert("Sair","Deseja sair da sua conta?",[{text:"Cancelar",style:"cancel"},{text:"Sair",style:"destructive",onPress:async()=>{await logout(); hDone(false); hStep(0);}}]);
  };

  // Single debounced sync — prevents 4 separate writes on login
  const saveTimerRef = useRef(null);
  const prefsInitRef = useRef(false);
  useEffect(() => {
    // Skip the initial mount to avoid overwriting Firebase data on login
    if (!currentUser) { prefsInitRef.current = false; return; }
    if (!prefsInitRef.current) { prefsInitRef.current = true; return; }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const data = { theme, av, avBgIdx, grades:gs, saved, updatedAt:new Date().toISOString() };
        await saveLocalUserData({ ...data, step, done, uTypeId:uType?.id, c1, c2 });
        await setDoc(doc(db,"usuarios",currentUser.uid), data, {merge:true});
      } catch (e) { console.log("Save error:", e.message); }
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [theme, av, avBgIdx, gs, saved, currentUser]);

  const toggleFollow = async (uni, isFollowing) => {
    if (!currentUser){Alert.alert("Atenção","Faça login para seguir universidades");return;}
    setUnis(prev=>prev.map(u=>u.name===uni.name?{...u,followed:isFollowing,followersCount:(u.followersCount||0)+(isFollowing?1:-1)}:u));
    if(selUni?.name===uni.name) setSU(p=>({...p,followed:isFollowing,followersCount:(p.followersCount||0)+(isFollowing?1:-1)}));
    setUserData(prev => {
      const cur = prev?.followedUnis || [];
      const next = isFollowing ? [...new Set([...cur, uni.name])] : cur.filter(n=>n!==uni.name);
      return { ...(prev||{}), followedUnis: next };
    });
    saveLocalUserData(currentData());
    try {
      const userRef=doc(db,"usuarios",currentUser.uid);
      await setDoc(userRef,{
        followedUnis: isFollowing ? arrayUnion(uni.name) : arrayRemove(uni.name),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      if (uni.id) {
        const uniRef=doc(db,"universidades",String(uni.id));
        await setDoc(uniRef,{followersCount:increment(isFollowing?1:-1)},{merge:true}).catch(()=>{});
      }
    } catch(err){
      console.log("toggleFollow error:", err?.message);
      setUnis(prev=>prev.map(u=>u.name===uni.name?{...u,followed:!isFollowing,followersCount:(u.followersCount||0)+(isFollowing?-1:1)}:u));
      if(selUni?.name===uni.name) setSU(p=>({...p,followed:!isFollowing}));
      setUserData(prev => {
        const cur = prev?.followedUnis || [];
        const next = !isFollowing ? [...new Set([...cur, uni.name])] : cur.filter(n=>n!==uni.name);
        return { ...(prev||{}), followedUnis: next };
      });
      Alert.alert("Erro","Não foi possível seguir. " + (err?.message||""));
    }
  };

  const coursesToUse = fbCourses.length ? fbCourses : ALL_COURSES;

  const cd = (extra={}) => ({ backgroundColor:T.card, borderRadius:18, borderWidth:1, borderColor:T.border, ...extra });

  if (!onboardingLoaded || authLoading) {
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

  // ── WELCOME ──
  if (!currentUser) return <WelcomeScreen />;


  // ── ONBOARDING ──
  if (!done) return <OnboardingScreen hStep={hStep} hDone={hDone} hUType={hUType} hC1={hC1} hC2={hC2} />;

  // ── MAIN APP ──
  const greeting = (() => { const h=new Date().getHours(); if(h<12) return "Bom dia"; if(h<18) return "Boa tarde"; return "Boa noite"; })();
  const firstName = currentUser?.email?.split("@")[0]?.split(".")[0] || "você";
  const SBar = () => (
    <View style={{ backgroundColor:T.bg, paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
      <View>
        <Text style={{ fontSize:22, fontWeight:"800", color:T.text }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
        {tab==="feed" && <Text style={{ fontSize:11, color:T.sub, marginTop:1 }}>{greeting}, {firstName} 👋</Text>}
      </View>
      {tab==="perfil" ? (
        <TouchableOpacity onPress={()=>setMcfg(true)} style={{ width:36, height:36, borderRadius:18, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:14 }}>⚙️</Text>
        </TouchableOpacity>
      ) : tab==="feed" ? (
        <View style={{ width:36, height:36, borderRadius:18, backgroundColor:AVATAR_COLORS[avBgIdx][0], alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:18 }}>{av}</Text>
        </View>
      ) : null}
    </View>
  );

  const BNav = () => (
    <View style={{ backgroundColor:T.nav, borderTopWidth:1, borderColor:T.border, paddingBottom:insets.bottom, flexDirection:"row", paddingHorizontal:8, paddingTop:6 }}>
      {[{id:"feed",ic:"🏠",l:"Feed"},{id:"explorar",ic:"🔍",l:"Explorar"},{id:"notas",ic:"📊",l:"Notas"},{id:"perfil",ic:"👤",l:"Perfil"}].map(t=>{
        const active = tab===t.id;
        return (
          <TouchableOpacity key={t.id} onPress={()=>{setTab(t.id);setSU(null);setShowBooksPage(false);setShowFollowingPage(false);}} style={{ flex:1, alignItems:"center", paddingVertical:6 }}>
            <View style={{ paddingHorizontal:16, paddingVertical:5, borderRadius:20, backgroundColor:active?T.acBg:"transparent", alignItems:"center", marginBottom:2 }}>
              <Text style={{ fontSize:20 }}>{getIcon("tab_"+t.id,t.ic)}</Text>
            </View>
            <Text style={{ fontSize:10, fontWeight:active?"800":"500", color:active?T.accent:T.muted }}>{t.l}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderExamsPage = () => (
    <ExamsListScreen
      selUni={selUni}
      onBack={() => setShowExamsPage(false)}
      onSelectExam={(exam) => setMexam(exam)}
    />
  );

  const renderBooksPage = () => (
    <BooksListScreen
      onBack={() => setShowBooksPage(false)}
      currentData={currentData}
    />
  );

  const renderFollowingPage = () => (
    <FollowingScreen
      onBack={() => setShowFollowingPage(false)}
      onExplore={() => { setShowFollowingPage(false); setTab("explorar"); }}
      onSelectUni={(u) => { setSU(u); setTab("explorar"); setShowFollowingPage(false); }}
    />
  );

  const renderUniDetail = () => (
    <UniversityDetailScreen
      selUni={selUni}
      onBack={() => setSU(null)}
      onToggleFollow={toggleFollow}
      onShowExams={() => setShowExamsPage(true)}
      currentData={currentData}
    />
  );

  const renderFeed = () => (
    <FeedScreen
      refreshing={refreshing}
      onRefresh={onRefresh}
      goExplorar={() => setTab("explorar")}
      onSelectUni={(u) => { setSU(u); setTab("explorar"); }}
      onShare={(item) => setMshr(item)}
      currentData={currentData}
    />
  );


  const renderExplorar = () => (
    <ExplorarScreen
      refreshing={refreshing}
      onRefresh={onRefresh}
      onOpenLocation={() => setMloc(true)}
      onOpenDiscover={() => setMdisc(true)}
      onSelectUni={(u) => setSU(u)}
    />
  );

  const renderNotas = () => (
    <NotasScreen
      onEditCourses={() => setMedit(true)}
      onAddGrade={() => setMgr(true)}
    />
  );

  const renderPerfil = () => (
    <PerfilScreen
      onChangePhoto={() => setMpho(true)}
      onChangeName={() => { setMcfg(false); setMnome(true); }}
      onEditCourses={() => setMedit(true)}
      onShowFollowing={() => setShowFollowingPage(true)}
      onShowSaved={() => setMSaved(true)}
      onShowBooks={() => setShowBooksPage(true)}
      onAddGoal={() => setGoalsModal(true)}
      onOpenEvent={(ev) => setMev(ev)}
      onSelectUni={(u) => { setSU(u); setTab('explorar'); }}
      goNotas={() => setTab('notas')}
      currentData={currentData}
    />
  );

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={isDark?"light-content":"dark-content"} />
      {!showExamsPage && !showBooksPage && <SBar />}
      {!selUni && !showExamsPage && !showBooksPage && (
        <View style={{ paddingHorizontal:20, paddingTop:0, paddingBottom:6 }}>
          <Text style={{ color:T.sub, fontSize:11 }}>{tab==="feed"?"Novidades para você":tab==="explorar"?"Encontre sua universidade":tab==="notas"?"Notas de corte & suas provas":`${uType?.emoji||"👤"} ${uType?.label||"Meu Perfil"}`}</Text>
        </View>
      )}
      {showExamsPage && selUni ? renderExamsPage() : showBooksPage ? renderBooksPage() : showFollowingPage ? renderFollowingPage() : selUni ? renderUniDetail() : (
        <>
          {tab==="feed"     && renderFeed()}
          {tab==="explorar" && renderExplorar()}
          {tab==="notas"    && renderNotas()}
          {tab==="perfil"   && renderPerfil()}
        </>
      )}
      <BNav />

      <SettingsModal visible={mCfg} onClose={()=>setMcfg(false)} currentData={currentData} onOpenName={()=>setMnome(true)} onOpenPhoto={()=>setMpho(true)} onOpenEditCourses={()=>setMedit(true)} onOpenLocation={()=>setMloc(true)} onOpenGoals={()=>setGoalsModal(true)} onLogout={handleLogout} />

      <AvatarPickerModal visible={mPho} onClose={()=>setMpho(false)} currentData={currentData} />

      <EditNameModal visible={mNome} onClose={()=>setMnome(false)} currentData={currentData} />

      {/* Edit course */}
      <EditCoursesModal visible={mEdit} onClose={()=>setMedit(false)} onSave={(a,b)=>{hC1(a);hC2(b);}} />

      <EventDetailModal event={mEv} onClose={()=>setMev(null)} />

      <AddGradeModal visible={mGr} onClose={()=>setMgr(false)} />

      <ShareModal item={mShr} onClose={()=>setMshr(null)} />

      <DiscoverCoursesModal visible={mDisc} onClose={()=>setMdisc(false)} onPickCourse={hC1} />

      <UniSortModal visible={mUni} onClose={()=>setMUni(false)} />

      <ExamDetailModal exam={mExam} onClose={()=>setMexam(null)} />

      <LocationSettingsModal visible={mLoc} onClose={()=>setMloc(false)} currentData={currentData} />

      <GoalsModal visible={goalsModal} onClose={()=>setGoalsModal(false)} currentData={currentData} />

      {/* Saved posts */}
      <SavedPostsModal visible={mSaved} onClose={()=>setMSaved(false)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator Main={MainApp} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
