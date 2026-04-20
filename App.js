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

import { USER_TYPES } from "./src/data/userTypes";
import { ALL_COURSES } from "./src/data/areas";
import { GEO_DATA } from "./src/data/geo";
import { DK, LT } from "./src/theme/palette";
import { AVATAR_PRESETS, AVATAR_COLORS } from "./src/theme/avatar";
import { fmtCount } from "./src/utils/format";
import { removeAccents } from "./src/utils/string";
import { loadLocalUserData, saveLocalUserData } from "./src/services/storage";
import { onAuthChange, logout } from "./src/services/auth";
import { fetchUserDoc } from "./src/services/firestore";
import { SBox } from "./src/components/SBox";
import { BottomSheet } from "./src/components/BottomSheet";
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
  const [goalsSearch, setGoalsSearch] = useState("");
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
  const [eC1,   setEC1]   = useState("");
  const [eC2,   setEC2]   = useState("");
  const [ePick, setEpick] = useState(1);
  const [eSrch, setEsrch] = useState("");
  const [mLoc,  setMloc]  = useState(false);
  const [mSaved, setMSaved] = useState(false);
  const countries = useGeoStore(s => s.countries);
  const states = useGeoStore(s => s.states);
  const cities = useGeoStore(s => s.cities);
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
  const [tmpCountryId, setTmpCountryId] = useState("");
  const [tmpStateId, setTmpStateId] = useState("");
  const [tmpCityId, setTmpCityId] = useState("");
  const [tmpStudyCountryId, setTmpStudyCountryId] = useState("");
  const [tmpStudyStateId, setTmpStudyStateId] = useState("");
  const [tmpStudyCityId, setTmpStudyCityId] = useState("");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showStudyStatePicker, setShowStudyStatePicker] = useState(false);
  const [showStudyCityPicker, setShowStudyCityPicker] = useState(false);

  const getCountry = (id) => countries.find(c => c.id === id) || GEO_DATA.countries.find(c => c.id === id);
  const getState = (id) => states.find(s => s.id === id) || GEO_DATA.states.find(s => s.id === id);
  const getCity = (id) => cities.find(c => c.id === id) || GEO_DATA.cities.find(c => c.id === id);
  const getStatesForCountry = (cid) => {
    const fromDb = states.filter(s => s.countryId === cid);
    if (fromDb.length > 0) return fromDb;
    return GEO_DATA.states.filter(s => s.countryId === cid);
  };
  const getCitiesForState = (sid) => {
    const fromDb = cities.filter(c => c.stateId === sid);
    if (fromDb.length > 0) return fromDb;
    return GEO_DATA.cities.filter(c => c.stateId === sid);
  };
  const getCityDisplayName = (id) => getCity(id)?.name || "";
  const getStateDisplayName = (id) => getState(id)?.name || "";
  const getCountryDisplayName = (id) => getCountry(id)?.name || "";

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
        setStep(localData.step||0);
        setDone(localData.done||false);
        setUType(localData.uTypeId?USER_TYPES.find(t=>t.id===localData.uTypeId)||null:null);
        setC1(localData.c1||"");
        setC2(localData.c2||"");
        if (localData.theme) setTheme(localData.theme);
        if (localData.av) setAv(localData.av);
        if (localData.avBgIdx!==undefined) setAvBgIdx(localData.avBgIdx);
        if (localData.grades) setGs(localData.grades);
        if (localData.saved) setSaved(localData.saved);
        if (localData.nome) setNome(localData.nome);
        if (localData.sobrenome) setSobrenome(localData.sobrenome);
        if (localData.liked) setLiked(localData.liked);
        if (localData.readBooks) setReadBooks(localData.readBooks);
        if (localData.readingBooks) setReadingBooks(localData.readingBooks);
        if (localData.countryId) setCountryId(localData.countryId);
        if (localData.stateId) setStateId(localData.stateId);
        if (localData.cityId) setCityId(localData.cityId);
        if (localData.studyCountryId) setStudyCountryId(localData.studyCountryId);
        if (localData.studyStateId) setStudyStateId(localData.studyStateId);
        if (localData.studyCityId) setStudyCityId(localData.studyCityId);
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
            if (fbData.done===true) {
              if (fbData.uTypeId) { const ut=USER_TYPES.find(t=>t.id===fbData.uTypeId); if(ut) setUType(ut); }
              if (fbData.c1) setC1(fbData.c1);
              if (fbData.c2) setC2(fbData.c2);
              setStep(3); setDone(true);
            } else if (fbData.done===false) {
              setStep(1); setDone(false);
            }
            if (fbData.theme) setTheme(fbData.theme);
            if (fbData.av) setAv(fbData.av);
            if (fbData.avBgIdx!==undefined) setAvBgIdx(fbData.avBgIdx);
            if (fbData.grades) setGs(fbData.grades);
            if (fbData.saved) setSaved(fbData.saved);
            if (fbData.nome) setNome(fbData.nome);
            if (fbData.sobrenome) setSobrenome(fbData.sobrenome);
            if (fbData.countryId) setCountryId(fbData.countryId);
            if (fbData.stateId) setStateId(fbData.stateId);
            if (fbData.cityId) setCityId(fbData.cityId);
            if (fbData.studyCountryId) setStudyCountryId(fbData.studyCountryId);
            if (fbData.studyStateId) setStudyStateId(fbData.studyStateId);
            if (fbData.studyCityId) setStudyCityId(fbData.studyCityId);
            if (fbData.goalsUnis) setGoalsUnis(fbData.goalsUnis);
            if (fbData.completedTodos) setCompletedTodos(fbData.completedTodos);
            if (fbData.readBooks) setReadBooks(fbData.readBooks);
            if (fbData.readingBooks) setReadingBooks(fbData.readingBooks);
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
  const lbl = { color:T.muted, fontSize:10, fontWeight:"700", textTransform:"uppercase", letterSpacing:0.8 };

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
      onOpenLocation={() => { setTmpCountryId(countryId||'BR'); setTmpStateId(stateId); setTmpCityId(cityId); setTmpStudyCountryId(studyCountryId||'BR'); setTmpStudyStateId(studyStateId); setTmpStudyCityId(studyCityId); setMloc(true); }}
      onOpenDiscover={() => setMdisc(true)}
      onSelectUni={(u) => setSU(u)}
    />
  );

  const renderNotas = () => (
    <NotasScreen
      onEditCourses={() => { setEC1(c1); setEC2(c2); setEpick(1); setEsrch(''); setMedit(true); }}
      onAddGrade={() => setMgr(true)}
    />
  );

  const renderPerfil = () => (
    <PerfilScreen
      onChangePhoto={() => setMpho(true)}
      onChangeName={() => { setMcfg(false); setMnome(true); }}
      onEditCourses={() => { setEC1(c1); setEC2(c2); setEpick(1); setEsrch(''); setMedit(true); }}
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

      {/* Settings modal */}
      <BottomSheet visible={mCfg} onClose={()=>setMcfg(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <Text style={{ color:T.text, fontSize:18, fontWeight:"800" }}>⚙️ Configurações</Text>
            <TouchableOpacity onPress={()=>setMcfg(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:14 }}>✕</Text></TouchableOpacity>
          </View>
          <Text style={[lbl,{marginBottom:10}]}>Tema</Text>
          <View style={{ flexDirection:"row", gap:8, marginBottom:24 }}>
            {[["dark","🌙 Escuro"],["light","☀️ Claro"],["auto","🔄 Auto"]].map(([v,l])=>(
              <TouchableOpacity key={v} onPress={()=>{
                setTheme(v);
                if (currentUser) {
                  const data = {theme:v,updatedAt:new Date().toISOString()};
                  saveLocalUserData({...currentData(), ...data});
                  setDoc(doc(db,"usuarios",currentUser.uid),data,{merge:true}).catch(()=>{});
                }
              }} style={{ flex:1, padding:12, borderRadius:12, backgroundColor:theme===v?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:theme===v?T.accent:T.border }}>
                <Text style={{ color:theme===v?AT:T.sub, fontSize:12, fontWeight:"700" }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[lbl,{marginBottom:10}]}>Conta</Text>
          {[
            ["👤","Nome",nome && sobrenome ? nome + " " + sobrenome : nome || "Não definido",()=>{setMcfg(false);setMnome(true);}],
            ["📷","Alterar foto de perfil","Ícone e cor",()=>{setMcfg(false);setMpho(true);}],
            ["✏️","Editar opções de curso","Altere suas preferências",()=>{setEC1(c1);setEC2(c2);setEpick(1);setEsrch("");setMcfg(false);setMedit(true);}],
            ["📍","Localização","Sua cidade e destino de estudos",()=>{setTmpCountryId(countryId||"BR");setTmpStateId(stateId);setTmpCityId(cityId);setTmpStudyCountryId(studyCountryId||"BR");setTmpStudyStateId(studyStateId);setTmpStudyCityId(studyCityId);setMcfg(false);setMloc(true);}],
            ["🎯","Metas de vestibular","Universidades que você vai fazer",()=>{setMcfg(false);setGoalsModal(true);}],
            ["📧","E-mail",currentUser?.email||"—",()=>{}],
          ].map(([ic,ti,su,fn])=>(
            <TouchableOpacity key={ti} onPress={fn} style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.card2, borderRadius:14, padding:15, marginBottom:10, borderWidth:1, borderColor:T.border }}>
              <Text style={{ fontSize:22, marginRight:14 }}>{ic}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{ti}</Text>
                <Text style={{ color:T.sub, fontSize:12 }}>{su}</Text>
              </View>
              <Text style={{ color:T.muted, fontSize:18 }}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height:1, backgroundColor:T.border, marginVertical:16 }} />
          <TouchableOpacity onPress={()=>{setMcfg(false);handleLogout();}} style={{ backgroundColor:"#dc2626", borderRadius:14, padding:15, alignItems:"center", marginBottom:12 }}>
            <Text style={{ color:"#fff", fontSize:15, fontWeight:"700" }}>Sair</Text>
          </TouchableOpacity>
          <Text style={{ color:T.muted, fontSize:12, textAlign:"center" }}>UniVest v4.0 · Feito com 💚</Text>
        </View>
      </BottomSheet>

      <AvatarPickerModal visible={mPho} onClose={()=>setMpho(false)} currentData={currentData} />

      <EditNameModal visible={mNome} onClose={()=>setMnome(false)} currentData={currentData} />

      {/* Edit course */}
      <BottomSheet visible={mEdit} onClose={()=>setMedit(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:12 }}>
            <TouchableOpacity onPress={()=>setMedit(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
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
          <TouchableOpacity onPress={()=>{hC1(eC1||c1);hC2(eC2);setMedit(false);}} disabled={!eC1} style={{ padding:14, borderRadius:16, backgroundColor:eC1?T.accent:T.border, alignItems:"center", marginTop:12 }}>
            <Text style={{ color:eC1?AT:T.muted, fontSize:15, fontWeight:"800" }}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <EventDetailModal event={mEv} onClose={()=>setMev(null)} />

      <AddGradeModal visible={mGr} onClose={()=>setMgr(false)} />

      <ShareModal item={mShr} onClose={()=>setMshr(null)} />

      <DiscoverCoursesModal visible={mDisc} onClose={()=>setMdisc(false)} onPickCourse={hC1} />

      <UniSortModal visible={mUni} onClose={()=>setMUni(false)} />

      <ExamDetailModal exam={mExam} onClose={()=>setMexam(null)} />

      {/* Location settings - completely redesigned */}
      <BottomSheet visible={mLoc} onClose={()=>setMloc(false)} T={T}>
        <View style={{ flex:1, paddingBottom:20 }}>
          <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:T.border }}>
            <TouchableOpacity onPress={()=>setMloc(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:T.sub, fontSize:18 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color:T.text, fontSize:18, fontWeight:"800" }}>📍 Localização</Text>
            <View style={{ width:34 }} />
          </View>
          <ScrollView style={{ flex:1 }} keyboardShouldPersistTaps="handled">
            <View style={{ padding:20 }}>
              {/* Current Location Section */}
              <View style={{ backgroundColor:T.card2, borderRadius:16, padding:16, marginBottom:16 }}>
                <Text style={{ color:T.accent, fontSize:14, fontWeight:"800", marginBottom:12 }}>📍 Sua localização atual</Text>
                
                <Text style={[lbl,{marginBottom:6}]}>Estado</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(!showStatePicker)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB }}>
                  <Text style={{ color:T.text, fontSize:14 }}>{tmpStateId ? getStateDisplayName(tmpStateId) : "Selecione o estado"}</Text>
                  <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
                </TouchableOpacity>
                {showStatePicker && (
                  <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                    <ScrollView style={{ maxHeight:190 }}>
                      {getStatesForCountry(tmpCountryId||"BR").map(s => (
                        <TouchableOpacity key={s.id} onPress={() => {setTmpStateId(s.id);setTmpCityId("");setShowStatePicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                          <Text style={{ color:T.text, fontSize:14 }}>{s.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={[lbl,{marginTop:12, marginBottom:6}]}>Cidade</Text>
                <TouchableOpacity onPress={() => tmpStateId ? setShowCityPicker(!showCityPicker) : null} disabled={!tmpStateId} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB, opacity:tmpStateId?1:0.5 }}>
                  <Text style={{ color:T.text, fontSize:14 }}>{tmpCityId ? getCityDisplayName(tmpCityId) : (tmpStateId ? "Selecione a cidade" : "Selecione o estado primeiro")}</Text>
                  <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
                </TouchableOpacity>
                {showCityPicker && tmpStateId && (
                  <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                    <ScrollView style={{ maxHeight:190 }}>
                      {getCitiesForState(tmpStateId).map(c => (
                        <TouchableOpacity key={c.id} onPress={() => {setTmpCityId(c.id);setShowCityPicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                          <Text style={{ color:T.text, fontSize:14 }}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Study Destination Section */}
              <View style={{ backgroundColor:T.card2, borderRadius:16, padding:16, marginBottom:16 }}>
                <Text style={{ color:T.accent, fontSize:14, fontWeight:"800", marginBottom:12 }}>🎯 Destino de estudos</Text>
                
                <Text style={[lbl,{marginBottom:6}]}>Estado</Text>
                <TouchableOpacity onPress={() => setShowStudyStatePicker(!showStudyStatePicker)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB }}>
                  <Text style={{ color:T.text, fontSize:14 }}>{tmpStudyStateId ? getStateDisplayName(tmpStudyStateId) : "Selecione o estado"}</Text>
                  <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
                </TouchableOpacity>
                {showStudyStatePicker && (
                  <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                    <ScrollView style={{ maxHeight:190 }}>
                      {getStatesForCountry(tmpStudyCountryId||"BR").map(s => (
                        <TouchableOpacity key={s.id} onPress={() => {setTmpStudyStateId(s.id);setTmpStudyCityId("");setShowStudyStatePicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                          <Text style={{ color:T.text, fontSize:14 }}>{s.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={[lbl,{marginTop:12, marginBottom:6}]}>Cidade</Text>
                <TouchableOpacity onPress={() => tmpStudyStateId ? setShowStudyCityPicker(!showStudyCityPicker) : null} disabled={!tmpStudyStateId} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB, opacity:tmpStudyStateId?1:0.5 }}>
                  <Text style={{ color:T.text, fontSize:14 }}>{tmpStudyCityId ? getCityDisplayName(tmpStudyCityId) : (tmpStudyStateId ? "Selecione a cidade" : "Selecione o estado primeiro")}</Text>
                  <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
                </TouchableOpacity>
                {showStudyCityPicker && tmpStudyStateId && (
                  <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                    <ScrollView style={{ maxHeight:190 }}>
                      {getCitiesForState(tmpStudyStateId).map(c => (
                        <TouchableOpacity key={c.id} onPress={() => {setTmpStudyCityId(c.id);setShowStudyCityPicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                          <Text style={{ color:T.text, fontSize:14 }}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={()=>{
                setCountryId(tmpCountryId||"BR");
                setStateId(tmpStateId);
                setCityId(tmpCityId);
                setStudyCountryId(tmpStudyCountryId||"BR");
                setStudyStateId(tmpStudyStateId);
                setStudyCityId(tmpStudyCityId);
                setShowStatePicker(false);setShowCityPicker(false);setShowStudyStatePicker(false);setShowStudyCityPicker(false);
                setMloc(false);
                if (currentUser) {
                  const data = {countryId:tmpCountryId||"BR",stateId:tmpStateId,cityId:tmpCityId,studyCountryId:tmpStudyCountryId||"BR",studyStateId:tmpStudyStateId,studyCityId:tmpStudyCityId,updatedAt:new Date().toISOString()};
                  saveLocalUserData({...currentData(), ...data});
                  setDoc(doc(db,"usuarios",currentUser.uid),data,{merge:true}).catch(()=>{});
                }
              }} style={{ padding:16, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
                <Text style={{ color:AT, fontSize:16, fontWeight:"800" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Goals modal */}
      <BottomSheet visible={goalsModal} onClose={()=>setGoalsModal(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
            <TouchableOpacity onPress={()=>{setGoalsModal(false);setGoalsSearch("");}} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>📋 Tarefas</Text>
          </View>
          <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:16, borderWidth:1, borderColor:T.inpB }}>
            <Text style={{ fontSize:14, marginRight:8 }}>🔍</Text>
            <TextInput value={goalsSearch} onChangeText={setGoalsSearch} placeholder="Buscar universidade..." placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
            {goalsSearch.length > 0 && <TouchableOpacity onPress={()=>setGoalsSearch("")}><Text style={{ color:T.muted, fontSize:12 }}>✕</Text></TouchableOpacity>}
          </View>
          <Text style={{ color:T.sub, fontSize:12, marginBottom:12 }}>Selecione as universidades que você pretende fazer vestibular</Text>
          <ScrollView style={{ maxHeight:400 }} showsVerticalScrollIndicator={false}>
            {(() => {
              const allUnis = fbUnis.filter(u => u.type !== "Técnico");
              const filtered = goalsSearch.length > 0 
                ? allUnis.filter(u => removeAccents(u.name.toLowerCase()).includes(removeAccents(goalsSearch.toLowerCase())) || removeAccents(u.fullName.toLowerCase()).includes(removeAccents(goalsSearch.toLowerCase())))
                : allUnis;
              if (filtered.length === 0) {
                return <Text style={{ color:T.muted, textAlign:"center", padding:20 }}>Nenhuma universidade encontrada</Text>;
              }
              return filtered.map(uni => {
                const isSelected = goalsUnis.some(g => g.id === uni.id);
                const nextExam = uni.exams?.find(e => e.status === "upcoming");
                return (
                  <TouchableOpacity key={uni.id} onPress={() => {
                    if (isSelected) {
                      setGoalsUnis(goalsUnis.filter(g => g.id !== uni.id));
                    } else {
                      setGoalsUnis([...goalsUnis, uni]);
                    }
                  }} style={{ flexDirection:"row", alignItems:"center", backgroundColor:isSelected?T.acBg:T.card2, borderRadius:14, padding:14, marginBottom:10, borderWidth:1, borderColor:isSelected?T.accent:T.border }}>
                    <View style={{ width:44, height:44, borderRadius:22, backgroundColor:uni.color, alignItems:"center", justifyContent:"center", marginRight:12 }}>
                      <Text style={{ color:"#fff", fontSize:12, fontWeight:"800" }}>{uni.name.slice(0,2)}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{uni.name}</Text>
                      <View style={{ flexDirection:"row", alignItems:"center", gap:8, marginTop:2 }}>
                        <Text style={{ color:T.muted, fontSize:11 }}>{uni.vestibular}</Text>
                        {nextExam && <Text style={{ color:T.accent, fontSize:10, fontWeight:"600" }}>📅 {nextExam.date}</Text>}
                      </View>
                    </View>
                    <View style={{ width:24, height:24, borderRadius:12, backgroundColor:isSelected?T.accent:T.card, borderWidth:2, borderColor:isSelected?T.accent:T.border, alignItems:"center", justifyContent:"center" }}>
                      {isSelected && <Text style={{ color:AT, fontSize:12, fontWeight:"800" }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </ScrollView>
          {goalsUnis.length > 0 && (
            <TouchableOpacity onPress={() => {
              saveLocalUserData({...currentData(), goalsUnis});
              if (currentUser) {
                setDoc(doc(db,"usuarios",currentUser.uid),{goalsUnis,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{});
              }
              setGoalsModal(false);
              setGoalsSearch("");
            }} style={{ marginTop:16, padding:16, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
              <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar Metas ({goalsUnis.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

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
