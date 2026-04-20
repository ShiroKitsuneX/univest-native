import { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, Alert, Appearance, Linking, Platform, StatusBar,
  KeyboardAvoidingView, Dimensions, ActivityIndicator, Animated, Pressable,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { db } from "./src/firebase/config";
import { doc, setDoc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";

import { USER_TYPES } from "./src/data/userTypes";
import { AREAS, ALL_COURSES } from "./src/data/areas";
import { FEED } from "./src/data/feed";
import { NOTAS_CORTE } from "./src/data/notasCorte";
import { GEO_DATA } from "./src/data/geo";
import { DK, LT } from "./src/theme/palette";
import { AVATAR_PRESETS, AVATAR_COLORS } from "./src/theme/avatar";
import { fmtCount } from "./src/utils/format";
import { getMonthFromKey } from "./src/utils/dates";
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
import { PerfilScreen } from "./src/screens/perfil/PerfilScreen";

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
  const posts = usePostsStore(s => s.posts);
  const fbUnis = useUniversitiesStore(s => s.fbUnis);
  const setFbUnis = useUniversitiesStore(s => s.setFbUnis);
  const fbCourses = useCoursesStore(s => s.fbCourses);
  const fbIcons = useCoursesStore(s => s.fbIcons);
  const selUni = useUniversitiesStore(s => s.selUni);
  const setSU = useUniversitiesStore(s => s.setSelUni);
  const [selectedBookYear, setSelectedBookYear] = useState(null);
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
  const [requirementsModal, setRequirementsModal] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState(null);
  const saved = usePostsStore(s => s.saved);
  const setSaved = usePostsStore(s => s.setSaved);
  const liked = usePostsStore(s => s.liked);
  const setLiked = usePostsStore(s => s.setLiked);
  const uniSort = useUniversitiesStore(s => s.uniSort);
  const setUniSort = useUniversitiesStore(s => s.setUniSort);
  const uniPrefs = useUniversitiesStore(s => s.uniPrefs);
  const setUniPrefs = useUniversitiesStore(s => s.setUniPrefs);
  const [refreshing, setRefreshing] = useState(false);

  const gs = useProfileStore(s => s.gs);
  const setGs = useProfileStore(s => s.setGs);
  const ng = useProfileStore(s => s.ng);
  const setNg = useProfileStore(s => s.setNg);

  const av = useProfileStore(s => s.av);
  const setAv = useProfileStore(s => s.setAv);
  const avBgIdx = useProfileStore(s => s.avBgIdx);
  const setAvBgIdx = useProfileStore(s => s.setAvBgIdx);
  const [tmpAv, setTmpAv] = useState("🧑‍🎓");
  const [tmpBgIdx, setTmpBgIdx] = useState(0);

  const [mCfg,  setMcfg]  = useState(false);
  const [mPho,  setMpho]  = useState(false);
  const [mEdit, setMedit] = useState(false);
  const [mNome, setMnome] = useState(false);
  const [tmpNome, setTmpNome] = useState("");
  const [tmpSobrenome, setTmpSobrenome] = useState("");
  const [mEv,   setMev]   = useState(null);
  const [mExam, setMexam] = useState(null);
  const [examYear, setExamYear] = useState(null);
  const [showExamsPage, setShowExamsPage] = useState(false);
  const [showBooksPage, setShowBooksPage] = useState(false);
  const [booksSearch, setBooksSearch] = useState("");
  const [expandedYears, setExpandedYears] = useState({});
  const [examSearch, setExamSearch] = useState("");
  const [examSort, setExamSort] = useState("newest");
  const [bookMenu, setBookMenu] = useState(null);
  const [showFollowingPage, setShowFollowingPage] = useState(false);
  const [mGr,   setMgr]   = useState(false);
  const [mShr,  setMshr]  = useState(null);
  const [mDisc, setMdisc] = useState(false);
  const [mUni,  setMUni]  = useState(false);
  const [dArea, setDarea] = useState(null);
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
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [studyStateSearch, setStudyStateSearch] = useState("");
  const [studyCitySearch, setStudyCitySearch] = useState("");
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

  const updateBookStatus = (bookKey, status) => {
    const isReading = readBooks[bookKey] === "reading";
    const isRead = readBooks[bookKey] === "read";
    let newRead = {...readBooks};
    
    if (status === "reading") {
      newRead[bookKey] = "reading";
    } else if (status === "read") {
      newRead[bookKey] = "read";
    } else if (status === "none") {
      delete newRead[bookKey];
    }
    
    setReadBooks(newRead);
    saveLocalUserData({...currentData(), readBooks: newRead});
    if (currentUser) {
      setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{});
    }
  };

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

  const fol = unis.filter(u=>u.followed).sort((a,b)=>{
    if(uniSort==="pref") return (uniPrefs[b.id]||5)-(uniPrefs[a.id]||5);
    const gm = s => getMonthFromKey(s?.match(/[A-Z]{3}/)?.[0] || "DEZ");
    return gm(a.prova)-gm(b.prova);
  });
  const coursesToUse = fbCourses.length ? fbCourses : ALL_COURSES;
  const feedItems = posts.length ? posts : FEED;

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

  const renderExamsPage = () => {
    if (!selUni?.exams) return null;
    const allExams = selUni.exams;
    const upcoming = allExams.filter(e => e.status === "upcoming");
    const past = allExams.filter(e => e.status === "past");
    const years = [...new Set(past.map(e => e.year))].sort((a, b) => examSort === "newest" ? b - a : a - b);
    
    const toggleYear = (year) => {
      setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };
    
    const filteredYears = years.map(year => ({
      year,
      exams: past.filter(e => e.year === year).filter(e => 
        !examSearch || 
        e.subject.toLowerCase().includes(examSearch.toLowerCase()) ||
        e.phase.toLowerCase().includes(examSearch.toLowerCase())
      )
    })).filter(g => !examSearch || g.exams.length > 0);

    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
          <TouchableOpacity onPress={()=>{setShowExamsPage(false);setExamSearch("");}} style={{ marginRight:12 }}>
            <Text style={{ fontSize:24, color:T.accent }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize:18, fontWeight:"800", color:T.text, flex:1 }}>📝 Provas Anteriores</Text>
        </View>
        
        <ScrollView style={{ flex:1, paddingHorizontal:16, paddingTop:16 }}>
          <View style={{ flexDirection:"row", gap:8, marginBottom:16 }}>
            <TouchableOpacity onPress={()=>setExamSort("newest")} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:examSort==="newest"?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:examSort==="newest"?T.accent:T.border }}>
              <Text style={{ color:examSort==="newest"?AT:T.sub, fontSize:12, fontWeight:"700" }}>Mais recente</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setExamSort("oldest")} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:examSort==="oldest"?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:examSort==="oldest"?T.accent:T.border }}>
              <Text style={{ color:examSort==="oldest"?AT:T.sub, fontSize:12, fontWeight:"700" }}>Mais antigo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:13, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:T.inpB, marginBottom:16 }}>
            <Text style={{ fontSize:14, marginRight:10 }}>🔍</Text>
            <TextInput value={examSearch} onChangeText={setExamSearch} placeholder="Buscar prova..." placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
            {examSearch ? <TouchableOpacity onPress={()=>setExamSearch("")}><Text style={{ color:T.muted }}>✕</Text></TouchableOpacity> : null}
          </View>

          {upcoming.length > 0 && (
            <View style={{ marginBottom:20 }}>
              <Text style={[lbl,{marginBottom:10}]}>🔥 {new Date().getFullYear()}</Text>
              {upcoming.map(exam => (
                <TouchableOpacity key={exam.id} onPress={() => setMexam(exam)} style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:12, backgroundColor:isDark?"#1a2e1a":"#f0fdf4", borderWidth:1, borderColor:T.accent+"40", marginBottom:8 }}>
                  <View style={{ width:44, height:44, borderRadius:22, backgroundColor:T.accent+"20", alignItems:"center", justifyContent:"center", marginRight:12 }}>
                    <Text style={{ fontSize:20 }}>📋</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{exam.subject}</Text>
                    <Text style={{ color:T.sub, fontSize:12 }}>{exam.phase} · {exam.questions} questões</Text>
                  </View>
                  <View style={{ backgroundColor:"#fbbf24", paddingHorizontal:10, paddingVertical:4, borderRadius:8 }}>
                    <Text style={{ color:"#000", fontSize:11, fontWeight:"700" }}>Em breve</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredYears.length === 0 ? (
            <View style={{ alignItems:"center", padding:40 }}>
              <Text style={{ fontSize:40, marginBottom:12 }}>📭</Text>
              <Text style={{ color:T.sub, fontSize:14, textAlign:"center" }}>Nenhuma prova encontrada</Text>
            </View>
          ) : filteredYears.map(({year, exams}) => (
            <View key={year} style={{ marginBottom:12 }}>
              <TouchableOpacity onPress={() => toggleYear(year)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:14, borderRadius:12, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, marginBottom:expandedYears[year] ? 8 : 0 }}>
                <View style={{ flexDirection:"row", alignItems:"center" }}>
                  <Text style={{ fontSize:18, marginRight:10 }}>📅</Text>
                  <Text style={{ color:T.text, fontSize:15, fontWeight:"700" }}>{year}</Text>
                  <View style={{ backgroundColor:T.accent+"30", paddingHorizontal:8, paddingVertical:2, borderRadius:10, marginLeft:8 }}>
                    <Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>{exams.length} provas</Text>
                  </View>
                </View>
                <Text style={{ color:T.accent, fontSize:18 }}>{expandedYears[year] ? "∧" : "∨"}</Text>
              </TouchableOpacity>
              
              {expandedYears[year] && exams.map(exam => (
                <TouchableOpacity key={exam.id} onPress={() => setMexam(exam)} style={{ flexDirection:"row", alignItems:"center", padding:12, paddingLeft:20, borderRadius:10, backgroundColor:T.bg, borderWidth:1, borderColor:T.border, marginBottom:6 }}>
                  <View style={{ width:36, height:36, borderRadius:18, backgroundColor:selUni.color+"20", alignItems:"center", justifyContent:"center", marginRight:10 }}>
                    <Text style={{ fontSize:16 }}>📋</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{exam.subject}</Text>
                    <Text style={{ color:T.sub, fontSize:11 }}>{exam.phase} · {exam.questions} questões · {exam.duration}</Text>
                  </View>
                  <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                    {exam.pdfUrl ? (
                      <View style={{ backgroundColor:"#22c55e30", paddingHorizontal:6, paddingVertical:2, borderRadius:6 }}>
                        <Text style={{ color:"#22c55e", fontSize:10, fontWeight:"700" }}>PDF</Text>
                      </View>
                    ) : null}
                    <Text style={{ color:T.accent, fontSize:16 }}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{ height:40 }} />
        </ScrollView>
      </View>
    );
  };

  const renderBooksPage = () => {
    const allBooks = [];
    unis.forEach(uni => {
      if (uni.books && Array.isArray(uni.books) && !Array.isArray(uni.books[0])) {
        uni.books.forEach(book => {
          allBooks.push({ id: `${uni.id}-${book}`, book, uni });
        });
      }
    });

    const filteredBooks = allBooks.filter(b => 
      !booksSearch || 
      b.book.toLowerCase().includes(booksSearch.toLowerCase()) ||
      b.uni.name.toLowerCase().includes(booksSearch.toLowerCase())
    );

    const readCount = Object.values(readBooks).filter(s => s === "read").length;
    const readingCount = Object.values(readBooks).filter(s => s === "reading").length;

    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
          <TouchableOpacity onPress={()=>{setShowBooksPage(false);setBooksSearch("");}} style={{ marginRight:12 }}>
            <Text style={{ fontSize:24, color:T.accent }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize:18, fontWeight:"800", color:T.text, flex:1 }}>📚 Todos os Livros</Text>
        </View>

        <ScrollView style={{ flex:1, paddingHorizontal:16, paddingTop:16 }}>
          {(readCount > 0 || readingCount > 0) && (
            <Text style={{ color:T.sub, fontSize:12, marginBottom:12 }}>
              {readingCount > 0 ? `Lendo ${readingCount} · ` : ""}Lidos: {readCount}
            </Text>
          )}

          <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:13, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:T.inpB, marginBottom:16 }}>
            <Text style={{ fontSize:14, marginRight:10 }}>🔍</Text>
            <TextInput value={booksSearch} onChangeText={setBooksSearch} placeholder="Buscar livro ou universidade..." placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
            {booksSearch ? <TouchableOpacity onPress={()=>setBooksSearch("")}><Text style={{ color:T.muted }}>✕</Text></TouchableOpacity> : null}
          </View>

          {filteredBooks.length === 0 ? (
            <View style={{ paddingVertical:40, alignItems:"center" }}>
              <Text style={{ fontSize:48, marginBottom:12 }}>📚</Text>
              <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>Nenhum livro encontrado</Text>
            </View>
          ) : (
            <View style={{ gap:8, marginBottom:40 }}>
              {filteredBooks.map(item => {
                const status = readBooks[item.id] || "none";
                const isRead = status === "read";
                const isReading = status === "reading";
                const showMenu = bookMenu === item.id;
                return (
                  <View key={item.id}>
                    <TouchableOpacity onPress={() => setBookMenu(showMenu ? null : item.id)} activeOpacity={0.7}>
                      <View style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:14, backgroundColor:isRead ? T.accent+"15" : isReading ? "#f59e0b15" : T.card2, borderWidth:1, borderColor:isRead ? T.accent+"40" : isReading ? "#f59e0b40" : T.border }}>
                        {showMenu ? (
                          <View style={{ flexDirection:"row", flex:1, gap:6 }}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks}; delete newRead[item.id]; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:10, borderRadius:10, backgroundColor:T.card, borderWidth:1, borderColor:T.border }}>
                              <Text style={{ color:T.muted, fontSize:12, fontWeight:"700", textAlign:"center" }}>○ Nenhum</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [item.id]: "reading"}; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:10, borderRadius:10, backgroundColor:"#f59e0b30", borderWidth:1, borderColor:"#f59e0b" }}>
                              <Text style={{ color:"#f59e0b", fontSize:12, fontWeight:"700", textAlign:"center" }}>📖 Lendo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [item.id]: "read"}; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:10, borderRadius:10, backgroundColor:T.accent+"20", borderWidth:1, borderColor:T.accent }}>
                              <Text style={{ color:T.accent, fontSize:12, fontWeight:"700", textAlign:"center" }}>✓ Lido</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ flexDirection:"row", alignItems:"center", flex:1 }}>
                            <View style={{ width:32, height:32, borderRadius:16, backgroundColor:item.uni.color, alignItems:"center", justifyContent:"center", marginRight:12 }}>
                              <Text style={{ color:"#fff", fontSize:10, fontWeight:"800" }}>{item.uni.name.slice(0,2)}</Text>
                            </View>
                            <View style={{ flex:1 }}>
                              <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }} numberOfLines={2}>{item.book}</Text>
                              <Text style={{ color:T.sub, fontSize:11 }}>{item.uni.name}</Text>
                            </View>
                            {isReading && <Text style={{ fontSize:16 }}>📖</Text>}
                            {isRead && <Text style={{ color:T.accent, fontSize:16 }}>✓</Text>}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderFollowingPage = () => (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
        <TouchableOpacity onPress={()=>setShowFollowingPage(false)} style={{ marginRight:12 }}>
          <Text style={{ fontSize:24, color:T.accent }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:"800", color:T.text, flex:1 }}>🏛️ Seguindo</Text>
      </View>

      <ScrollView style={{ flex:1, paddingHorizontal:16, paddingTop:16 }}>
        {fol.length === 0 ? (
          <View style={{ paddingVertical:40, alignItems:"center" }}>
            <Text style={{ fontSize:48, marginBottom:12 }}>🏛️</Text>
            <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>Nenhuma universidade seguida</Text>
            <TouchableOpacity onPress={()=>{setShowFollowingPage(false);setTab("explorar");}} style={{ marginTop:16, paddingHorizontal:16, paddingVertical:8, backgroundColor:T.accent, borderRadius:8 }}>
              <Text style={{ color:AT, fontSize:12, fontWeight:"700" }}>Explorar universidades</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap:10, marginBottom:40 }}>
            {fol.map(u => (
              <TouchableOpacity key={u.id} onPress={()=>{setSU(u);setTab("explorar");setShowFollowingPage(false);}} style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:14, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}>
                <View style={{ width:44, height:44, borderRadius:22, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
                </View>
                <View style={{ flex:1, marginLeft:12 }}>
                  <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{u.name}</Text>
                  <Text style={{ color:T.sub, fontSize:11 }}>{u.fullName}</Text>
                </View>
                <Text style={{ color:T.accent, fontSize:20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderUniDetail = () => (
    <ScrollView style={{ flex:1 }}>
      <TouchableOpacity onPress={()=>setSU(null)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:12, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignSelf:"flex-start", margin:16 }}>
        <Text style={{ color:T.sub, fontSize:12, fontWeight:"700" }}>← Voltar</Text>
      </TouchableOpacity>
      <View style={{ marginHorizontal:16, borderRadius:22, padding:22, backgroundColor:selUni.color }}>
        <Text style={{ fontSize:30, marginBottom:8 }}>{selUni.name.slice(0,2)}</Text>
        <Text style={{ color:"#fff", fontSize:22, fontWeight:"800" }}>{selUni.name}</Text>
        <Text style={{ color:"rgba(255,255,255,.65)", fontSize:12, marginBottom:8 }}>{selUni.fullName}</Text>
        <Text style={{ color:"rgba(255,255,255,.8)", fontSize:12, lineHeight:20, marginBottom:14 }}>{selUni.description}</Text>
        <View style={{ flexDirection:"row", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <TouchableOpacity onPress={()=>toggleFollow(selUni,!selUni.followed)} style={{ paddingHorizontal:18, paddingVertical:9, borderRadius:13, backgroundColor:selUni.followed?"#dc2626":T.accent }}>
            <Text style={{ color:selUni.followed?"#fff":AT, fontSize:13, fontWeight:"800" }}>{selUni.followed?"🚫 Deixar de seguir":"+ Seguir"}</Text>
          </TouchableOpacity>
          <Text style={{ color:"rgba(255,255,255,.65)", fontSize:11 }}>👥 <Text style={{ color:"#fff", fontWeight:"800" }}>{fmtCount(selUni.followersCount??selUni.followers)}</Text> seguidores</Text>
        </View>
      </View>
      {selUni.exams && selUni.exams.length > 0 && (
        <View style={{ paddingHorizontal:16, paddingTop:16, paddingBottom:8 }}>
          <TouchableOpacity onPress={() => { setExpandedYears({}); setExamSearch(""); setExamSort("newest"); setShowExamsPage(true); }} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:14, borderRadius:14, backgroundColor:selUni.color }}>
            <View style={{ flexDirection:"row", alignItems:"center" }}>
              <Text style={{ fontSize:22, marginRight:12 }}>📝</Text>
              <View>
                <Text style={{ color:"#fff", fontSize:15, fontWeight:"800" }}>Provas Anteriores</Text>
                <Text style={{ color:"rgba(255,255,255,.7)", fontSize:11 }}>Consulte provas e simulados</Text>
              </View>
            </View>
            <Text style={{ color:"#fff", fontSize:22 }}>→</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ padding:16, gap:10 }}>
        <View style={cd({ padding:16 })}>
          <Text style={[lbl,{marginBottom:10}]}>📅 Próximo Vestibular</Text>
          <Text style={{ color:T.text, fontSize:16, fontWeight:"800", marginBottom:8 }}>{selUni.vestibular}</Text>
          <View style={{ flexDirection:"row", gap:8 }}>
            {[["Inscrições",selUni.inscricao,T.accent],["Data da Prova",selUni.prova,"#c084fc"]].map(([l,v,c])=>(
              <View key={l} style={{ backgroundColor:T.card2, borderRadius:10, padding:8 }}>
                <Text style={{ color:c, fontSize:10, fontWeight:"700" }}>{l}</Text>
                <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={cd({ padding:16 })}>
          <Text style={[lbl,{marginBottom:10}]}>📖 Cursos</Text>
          <View style={{ flexDirection:"row", flexWrap:"wrap", gap:7 }}>
            {selUni.courses.map(c=>(
              <View key={c} style={{ backgroundColor:T.card2, borderRadius:10, paddingHorizontal:11, paddingVertical:5, borderWidth:1, borderColor:T.border }}>
                <Text style={{ color:T.text, fontSize:12, fontWeight:"600" }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
        {selUni.books && selUni.books.length > 0 && (
          <View style={cd({ padding:16 })}>
            <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <Text style={[lbl,{marginBottom:0}]}>📚 Livros Obrigatórios</Text>
              {selUni.books && selUni.books.length > 4 && (
                <TouchableOpacity onPress={()=>setSelectedBookYear(selectedBookYear === "2026" ? "2025" : "2026")} style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:8, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}>
                  <Text style={{ color:T.sub, fontSize:10, fontWeight:"600" }}>{selectedBookYear || "2026"} ▼</Text>
                </TouchableOpacity>
              )}
            </View>
            {Array.isArray(selUni.books?.[0]) ? (
              <Text style={{ color:T.text, fontSize:12 }}>Verificar ano...</Text>
            ) : (
              <View>
                {selUni.books?.slice(0, 8).map((book, i) => {
                  const bookKey = `${selUni.id}-${book}`;
                  const status = readBooks[bookKey] || "none";
                  const isRead = status === "read";
                  const isReading = status === "reading";
                  const showMenu = bookMenu === bookKey;
                  return (
                    <View key={i}>
                      <TouchableOpacity onPress={() => setBookMenu(showMenu ? null : bookKey)} activeOpacity={0.7} style={{ paddingVertical:8, paddingHorizontal: isRead || isReading ? 8 : 0, marginHorizontal: isRead || isReading ? -8 : 0, borderRadius: isRead || isReading ? 8 : 0, backgroundColor: isRead ? T.accent+"10" : isReading ? "#f59e0b10" : "transparent", borderBottomWidth:i<Math.min(selUni.books.length, 8)-1?1:0, borderColor:T.border }}>
                        {showMenu ? (
                          <View style={{ flexDirection:"row", flex:1, gap:4 }}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks}; delete newRead[bookKey]; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:T.card, borderWidth:1, borderColor:T.border }}>
                              <Text style={{ color:T.muted, fontSize:10, fontWeight:"700", textAlign:"center" }}>○</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [bookKey]: "reading"}; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:"#f59e0b30", borderWidth:1, borderColor:"#f59e0b" }}>
                              <Text style={{ color:"#f59e0b", fontSize:10, fontWeight:"700", textAlign:"center" }}>📖</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); const newRead = {...readBooks, [bookKey]: "read"}; setReadBooks(newRead); saveLocalUserData({...currentData(), readBooks: newRead}); if (currentUser) setDoc(doc(db,"usuarios",currentUser.uid),{readBooks:newRead,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{}); setBookMenu(null); }} style={{ flex:1, padding:6, borderRadius:6, backgroundColor:T.accent+"20", borderWidth:1, borderColor:T.accent }}>
                              <Text style={{ color:T.accent, fontSize:10, fontWeight:"700", textAlign:"center" }}>✓</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ flexDirection:"row", alignItems:"center" }}>
                            <View style={{ width:24, height:24, borderRadius:12, backgroundColor:isRead ? T.accent : isReading ? "#f59e0b" : T.card2, borderWidth:2, borderColor:isRead ? T.accent : isReading ? "#f59e0b" : T.border, alignItems:"center", justifyContent:"center", marginRight:10 }}>
                              {isRead && <Text style={{ color:AT, fontSize:10, fontWeight:"800" }}>✓</Text>}
                              {isReading && <Text style={{ color:"#fff", fontSize:10 }}>📖</Text>}
                              {!isRead && !isReading && <View style={{ width:8, height:8, borderRadius:4, backgroundColor:T.muted }} />}
                            </View>
                            <Text style={{ color:T.text, fontSize:12, flex:1 }}>{book}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
        <TouchableOpacity onPress={()=>Linking.openURL(selUni.site)} style={{ backgroundColor:isDark?"#0a1f15":"#f0fdf4", borderRadius:14, padding:13, borderWidth:1, borderColor:T.accent+"30", flexDirection:"row", alignItems:"center", gap:10 }}>
          <Text style={{ fontSize:18 }}>🌐</Text>
          <View style={{ flex:1 }}>
            <Text style={{ color:T.sub, fontSize:10 }}>Site oficial</Text>
            <Text style={{ color:T.accent, fontSize:13, fontWeight:"700" }}>{selUni.site}</Text>
          </View>
          <Text style={{ color:T.accent }}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height:16 }} />
    </ScrollView>
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
      onOpenLocation={() => { setTmpCountryId(countryId||'BR'); setTmpStateId(stateId); setTmpCityId(cityId); setTmpStudyCountryId(studyCountryId||'BR'); setTmpStudyStateId(studyStateId); setTmpStudyCityId(studyCityId); setStateSearch(''); setCitySearch(''); setStudyStateSearch(''); setStudyCitySearch(''); setMloc(true); }}
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
      onChangePhoto={() => { setTmpAv(av); setTmpBgIdx(avBgIdx); setMpho(true); }}
      onChangeName={() => { setTmpNome(nome); setTmpSobrenome(sobrenome); setMcfg(false); setMnome(true); }}
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
            ["👤","Nome",nome && sobrenome ? nome + " " + sobrenome : nome || "Não definido",()=>{setTmpNome(nome);setTmpSobrenome(sobrenome);setMcfg(false);setMnome(true);}],
            ["📷","Alterar foto de perfil","Ícone e cor",()=>{setTmpAv(av);setTmpBgIdx(avBgIdx);setMcfg(false);setMpho(true);}],
            ["✏️","Editar opções de curso","Altere suas preferências",()=>{setEC1(c1);setEC2(c2);setEpick(1);setEsrch("");setMcfg(false);setMedit(true);}],
            ["📍","Localização","Sua cidade e destino de estudos",()=>{setTmpCountryId(countryId||"BR");setTmpStateId(stateId);setTmpCityId(cityId);setTmpStudyCountryId(studyCountryId||"BR");setTmpStudyStateId(studyStateId);setTmpStudyCityId(studyCityId);setStateSearch("");setCitySearch("");setStudyStateSearch("");setStudyCitySearch("");setMcfg(false);setMloc(true);}],
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

      {/* Avatar picker */}
      <BottomSheet visible={mPho} onClose={()=>setMpho(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:12 }}>
            <TouchableOpacity onPress={()=>setMpho(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
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
            setMpho(false);
            if (currentUser) {
              const data = {av:tmpAv,avBgIdx:tmpBgIdx,updatedAt:new Date().toISOString()};
              saveLocalUserData({...currentData(), ...data});
              setDoc(doc(db,"usuarios",currentUser.uid),data,{merge:true}).catch(()=>{});
            }
          }} style={{ padding:14, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
            <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Edit name */}
      <BottomSheet visible={mNome} onClose={()=>setMnome(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
            <TouchableOpacity onPress={()=>setMnome(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
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
              setMnome(false);
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

      {/* Event detail */}
      <BottomSheet visible={!!mEv} onClose={()=>setMev(null)} T={T}>
        {mEv && (
          <View style={{ padding:20, paddingBottom:24 }}>
            <View style={{ flexDirection:"row", alignItems:"center", gap:12, marginBottom:14 }}>
              <View style={{ backgroundColor:mEv.cor, borderRadius:12, width:52, height:52, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"rgba(255,255,255,.55)", fontSize:8, fontWeight:"700" }}>{mEv.month}</Text>
                <Text style={{ color:"#fff", fontSize:mEv.dayLabel==="—"?18:15, fontWeight:"800" }}>{mEv.dayLabel}</Text>
                <Text style={{ color:"rgba(255,255,255,.45)", fontSize:8 }}>{mEv.year}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:15, fontWeight:"800", lineHeight:20 }}>{mEv.event}</Text>
                <TouchableOpacity onPress={()=>Linking.openURL(mEv.site)}><Text style={{ color:T.accent, fontSize:12, fontWeight:"700" }}>{mEv.uni} ↗</Text></TouchableOpacity>
              </View>
            </View>
            <View style={{ backgroundColor:T.card2, borderRadius:14, padding:14, marginBottom:18, borderWidth:1, borderColor:T.border }}>
              <Text style={[lbl,{marginBottom:6}]}>ℹ️ Resumo</Text>
              <Text style={{ color:T.text, fontSize:13, lineHeight:22 }}>{mEv.desc}</Text>
            </View>
            <TouchableOpacity onPress={()=>Linking.openURL(mEv.site)} style={{ padding:14, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
              <Text style={{ color:AT, fontSize:14, fontWeight:"800" }}>🌐 Ver fonte oficial →</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>

      {/* Add grade */}
      <BottomSheet visible={mGr} onClose={()=>setMgr(false)} T={T}>
        <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"}>
          <View style={{ padding:20, paddingBottom:24 }}>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>➕ Adicionar Nota</Text>
            <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>Simulado, prova ou vestibular</Text>
            <TextInput value={ng.ex} onChangeText={v=>setNg({...ng,ex:v})} placeholder="Nome da prova (ex: FUVEST Simulado 3)" placeholderTextColor={T.muted} style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14, marginBottom:8 }} />
            <TextInput value={ng.dt} onChangeText={v=>setNg({...ng,dt:v})} placeholder="Mês/Ano (ex: Jun/2025)" placeholderTextColor={T.muted} style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14, marginBottom:14 }} />
            <Text style={[lbl,{marginBottom:10}]}>Tipo</Text>
            <View style={{ flexDirection:"row", gap:8, marginBottom:14 }}>
              {[["prova","📝 Prova"],["simulado","📋 Simulado"]].map(([v,l])=>(
                <TouchableOpacity key={v} onPress={()=>setNg({...ng,type:v})} style={{ flex:1, padding:12, borderRadius:12, backgroundColor:ng.type===v?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:ng.type===v?T.accent:T.border }}>
                  <Text style={{ color:ng.type===v?AT:T.sub, fontSize:13, fontWeight:"700" }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[lbl,{marginBottom:10}]}>Notas por área</Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginBottom:18 }}>
              {[["l","Linguagens","0–100"],["h","Humanas","0–100"],["n","Natureza","0–100"],["m","Matemática","0–100"],["r","Redação","0–1000"]].map(([k,l,ph])=>(
                <View key={k} style={{ width:k==="r"?"100%":"48%" }}>
                  <Text style={{ color:T.muted, fontSize:10, fontWeight:"700", marginBottom:4 }}>{l}</Text>
                  <TextInput value={ng[k]} onChangeText={v=>setNg({...ng,[k]:v})} placeholder={ph} placeholderTextColor={T.muted} keyboardType="numeric" style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14 }} />
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={()=>{ if(!ng.ex.trim())return; setGs([...gs,{id:Date.now(),ex:ng.ex,dt:ng.dt||"2025",type:ng.type||"prova",s:{l:+ng.l||0,h:+ng.h||0,n:+ng.n||0,m:+ng.m||0,r:+ng.r||0}}]); setNg({ex:"",dt:"",l:"",h:"",n:"",m:"",r:"",type:"prova"}); setMgr(false); }} disabled={!ng.ex.trim()} style={{ padding:14, borderRadius:16, backgroundColor:ng.ex.trim()?T.accent:T.border, alignItems:"center" }}>
              <Text style={{ color:ng.ex.trim()?AT:T.muted, fontSize:15, fontWeight:"800" }}>Salvar nota ✓</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Share */}
      <BottomSheet visible={!!mShr} onClose={()=>setMshr(null)} T={T}>
        {mShr && (
          <View style={{ padding:20, paddingBottom:24 }}>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>📤 Compartilhar</Text>
            <Text style={{ color:T.sub, fontSize:13, marginBottom:18, lineHeight:20 }}>{mShr.title}</Text>
            <View style={{ flexDirection:"row", gap:8 }}>
              {[
                {l:"WhatsApp",i:"💬",c:"#25D366",href:`https://api.whatsapp.com/send?text=${encodeURIComponent(mShr.title+"\n\nVia UniVest 🎓")}`},
                {l:"Twitter",i:"🐦",c:"#1DA1F2",href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(mShr.title)}`},
                {l:"Copiar",i:"🔗",c:T.accent,href:"copy"},
              ].map(o=>(
                <TouchableOpacity key={o.l} onPress={()=>{ if(o.href==="copy"){Alert.alert("Copiado!","Texto copiado.");}else{Linking.openURL(o.href);} setMshr(null); }} style={{ flex:1, alignItems:"center", paddingVertical:11, borderRadius:13, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}>
                  <Text style={{ fontSize:22, marginBottom:4 }}>{o.i}</Text>
                  <Text style={{ fontSize:10, fontWeight:"700", color:o.c }}>{o.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Course discovery */}
      <BottomSheet visible={mDisc} onClose={()=>{setMdisc(false);setDarea(null);}} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>🧭 Descobrir Cursos</Text>
          {!dArea ? (
            <>
              <Text style={{ color:T.sub, fontSize:13, marginBottom:14 }}>Explore por área do conhecimento</Text>
              <View style={{ flexDirection:"row", flexWrap:"wrap", gap:10, marginBottom:16 }}>
                {AREAS.map(a=>(
                  <TouchableOpacity key={a.id} onPress={()=>setDarea(a)} style={{ width:"47%", backgroundColor:isDark?a.darkBg:a.bg, borderRadius:16, padding:14, borderWidth:1, borderColor:a.cor+"40" }}>
                    <Text style={{ fontSize:26, marginBottom:6 }}>{a.emoji}</Text>
                    <Text style={{ color:a.cor, fontSize:13, fontWeight:"800" }}>{a.label}</Text>
                    <Text style={{ color:isDark?"rgba(255,255,255,.4)":a.cor+"99", fontSize:10, marginTop:2 }}>{a.courses.length} cursos</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={()=>setDarea(null)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:12, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignSelf:"flex-start", marginBottom:14 }}>
                <Text style={{ color:T.sub, fontSize:12, fontWeight:"700" }}>← Voltar</Text>
              </TouchableOpacity>
              <View style={{ backgroundColor:isDark?dArea.darkBg:dArea.bg, borderRadius:16, padding:16, borderWidth:1, borderColor:dArea.cor+"40", marginBottom:14 }}>
                <Text style={{ fontSize:30, marginBottom:6 }}>{dArea.emoji}</Text>
                <Text style={{ color:dArea.cor, fontSize:18, fontWeight:"800" }}>{dArea.label}</Text>
                <Text style={{ color:isDark?"rgba(255,255,255,.45)":dArea.cor+"99", fontSize:12, marginTop:2 }}>{dArea.courses.length} cursos</Text>
              </View>
              {dArea.courses.map(cc=>{ const ncs=NOTAS_CORTE.filter(n=>n.curso===cc); const mn=ncs.length?Math.min(...ncs.map(n=>n.nota)):null; const mx=ncs.length?Math.max(...ncs.map(n=>n.nota)):null; return (
                <TouchableOpacity key={cc} onPress={()=>{hC1(cc);setMdisc(false);setDarea(null);}} style={{ ...cd(), padding:13, marginBottom:8, flexDirection:"row", alignItems:"center", gap:12 }}>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{cc}</Text>
                    {mn?<Text style={{ color:T.sub, fontSize:11 }}>Nota: {mn===mx?mn:`${mn}–${mx}`} pts</Text>:<Text style={{ color:T.muted, fontSize:11 }}>Dados em breve</Text>}
                  </View>
                  {mn && <View style={{ backgroundColor:T.acBg, borderRadius:8, paddingHorizontal:10, paddingVertical:4, alignItems:"center" }}><Text style={{ color:T.accent, fontSize:13, fontWeight:"800" }}>{mn}</Text><Text style={{ color:T.muted, fontSize:9 }}>mín.</Text></View>}
                  <View style={{ backgroundColor:dArea.cor+"20", borderRadius:8, paddingHorizontal:10, paddingVertical:6 }}><Text style={{ color:dArea.cor, fontSize:11, fontWeight:"800" }}>Escolher →</Text></View>
                </TouchableOpacity>
              );})}
            </>
          )}
        </View>
      </BottomSheet>

      {/* Uni sort */}
      <BottomSheet visible={mUni} onClose={()=>setMUni(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>⚙️ Ordenar universidades</Text>
            <TouchableOpacity onPress={()=>setMUni(false)} style={{ padding:4 }}>
              <Text style={{ color:T.muted, fontSize:20, fontWeight:"700" }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color:T.sub, fontSize:13, marginBottom:14 }}>Escolha como ordenar</Text>
          <View style={{ flexDirection:"row", gap:8, marginBottom:16 }}>
            {[["date","📅 Por data"],["pref","⭐ Por preferência"]].map(([v,l])=>(
              <TouchableOpacity key={v} onPress={()=>setUniSort(v)} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:uniSort===v?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:uniSort===v?T.accent:T.border }}>
                <Text style={{ color:uniSort===v?AT:T.sub, fontSize:12, fontWeight:"700" }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {uniSort==="pref" && fol.map(u=>(
            <View key={u.id} style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:8 }}>
              <View style={{ width:32, height:32, borderRadius:16, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}><Text style={{ color:"#fff", fontSize:10, fontWeight:"800" }}>{u.name.slice(0,2)}</Text></View>
              <Text style={{ flex:1, color:T.text, fontSize:13, fontWeight:"600" }}>{u.name}</Text>
              <View style={{ flexDirection:"row", gap:4 }}>
                {[10,7,5,3,1].map(p=>(
                  <TouchableOpacity key={p} onPress={()=>setUniPrefs(prev=>({...prev,[u.id]:p}))} style={{ width:28, height:28, borderRadius:8, backgroundColor:(uniPrefs[u.id]||5)===p?T.accent:T.card2, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:(uniPrefs[u.id]||5)===p?T.accent:T.border }}>
                    <Text style={{ color:(uniPrefs[u.id]||5)===p?AT:T.sub, fontSize:11, fontWeight:"700" }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={()=>setMUni(false)} style={{ padding:14, borderRadius:16, backgroundColor:T.accent, alignItems:"center", marginTop:8 }}>
            <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar ✓</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet visible={!!mExam && !mExam?.isList} onClose={()=>{setMexam(null);}} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          {mExam?.status === "upcoming" ? (
            <>
              <View style={{ flexDirection:"row", alignItems:"center", marginBottom:16 }}>
                <TouchableOpacity onPress={() => setMexam(null)} style={{ marginRight:12 }}>
                  <Text style={{ color:T.accent, fontSize:24 }}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>📋 {mExam.subject}</Text>
              <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>{mExam.year} · {mExam.phase}</Text>
              <View style={{ backgroundColor:isDark?"#2a2a1a":"#fffbeb", borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderColor:isDark?"#5c4d1a":"#fcd34d" }}>
                <Text style={{ color:"#f59e0b", fontSize:14, fontWeight:"800", marginBottom:6 }}>⏳ Prova ainda não realizada</Text>
                <Text style={{ color:T.sub, fontSize:13, lineHeight:20 }}>Esta prova está prevista para {mExam.date}. Quando estiver disponível, você poderá baixar o PDF e acessar pelo site da instituição.</Text>
              </View>
              <View style={{ backgroundColor:T.card2, borderRadius:14, padding:14, marginBottom:14, borderWidth:1, borderColor:T.border }}>
                <Text style={{ color:T.text, fontSize:13, marginBottom:8 }}>⏱️ Duração: <Text style={{ fontWeight:"700" }}>{mExam.duration}</Text></Text>
                <Text style={{ color:T.text, fontSize:13 }}>❓ Questões: <Text style={{ fontWeight:"700" }}>{mExam.questions}</Text></Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(mExam.sourceUrl)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:T.accent }}>
                <Text style={{ fontSize:16, marginRight:8 }}>🌐</Text>
                <Text style={{ color:AT, fontSize:14, fontWeight:"700" }}>Acompanhar no site</Text>
              </TouchableOpacity>
            </>
          ) : mExam ? (
            <>
              <View style={{ flexDirection:"row", alignItems:"center", marginBottom:16 }}>
                <TouchableOpacity onPress={() => setMexam(null)} style={{ marginRight:12 }}>
                  <Text style={{ color:T.accent, fontSize:24 }}>✕</Text>
                </TouchableOpacity>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>{mExam.subject}</Text>
                  <Text style={{ color:T.sub, fontSize:12 }}>{mExam.year} · {mExam.phase}</Text>
                </View>
              </View>
              <View style={{ backgroundColor:T.card2, borderRadius:14, padding:14, marginBottom:14, borderWidth:1, borderColor:T.border }}>
                <View style={{ flexDirection:"row", marginBottom:10 }}>
                  <Text style={{ color:T.sub, fontSize:13, width:80 }}>📅 Data</Text>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{mExam.date}</Text>
                </View>
                <View style={{ flexDirection:"row", marginBottom:10 }}>
                  <Text style={{ color:T.sub, fontSize:13, width:80 }}>⏱️ Duração</Text>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{mExam.duration}</Text>
                </View>
                <View style={{ flexDirection:"row", marginBottom:10 }}>
                  <Text style={{ color:T.sub, fontSize:13, width:80 }}>❓ Questões</Text>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{mExam.questions}</Text>
                </View>
                {mExam.description && <Text style={{ color:T.sub, fontSize:12, marginTop:4, lineHeight:18 }}>{mExam.description}</Text>}
              </View>
              <View style={{ flexDirection:"row", gap:10 }}>
                <TouchableOpacity onPress={() => Linking.openURL(mExam.sourceUrl)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:T.accent }}>
                  <Text style={{ fontSize:16, marginRight:6 }}>🌐</Text>
                  <Text style={{ color:AT, fontSize:13, fontWeight:"700" }}>Site</Text>
                </TouchableOpacity>
                {mExam.pdfUrl ? (
                  <TouchableOpacity onPress={() => Linking.openURL(mExam.pdfUrl)} style={{ flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", padding:14, borderRadius:14, backgroundColor:isDark?"#1a2e4a":"#dbeafe", borderWidth:1, borderColor:isDark?"#3b82f6":"#93c5fd" }}>
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

      {/* Location settings - completely redesigned */}
      <BottomSheet visible={mLoc} onClose={()=>{setMloc(false);setStateSearch("");setCitySearch("");setStudyStateSearch("");setStudyCitySearch("");}} T={T}>
        <View style={{ flex:1, paddingBottom:20 }}>
          <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:T.border }}>
            <TouchableOpacity onPress={()=>{setMloc(false);setStateSearch("");setCitySearch("");setStudyStateSearch("");setStudyCitySearch("");}} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}>
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
                setStateSearch("");setCitySearch("");setStudyStateSearch("");setStudyCitySearch("");
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
      <BottomSheet visible={mSaved} onClose={()=>setMSaved(false)} T={T}>
        <View style={{ padding:20, paddingBottom:24 }}>
          <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:16 }}>
            <TouchableOpacity onPress={()=>setMSaved(false)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}><Text style={{ color:T.sub, fontSize:16 }}>←</Text></TouchableOpacity>
            <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>🔖 Salvos</Text>
          </View>
          <Text style={{ color:T.sub, fontSize:13, marginBottom:16 }}>Posts e links salvos para consultar depois</Text>
          {feedItems.filter(item=>saved[item.id]).length===0 ? (
            <View style={{ alignItems:"center", padding:30 }}>
              <Text style={{ fontSize:40, marginBottom:12 }}>🔖</Text>
              <Text style={{ color:T.text, fontSize:14, fontWeight:"700", marginBottom:4 }}>Nenhum post salvo</Text>
              <Text style={{ color:T.sub, fontSize:12, textAlign:"center" }}>Toque no 🔖 em qualquer post para salvar</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight:400 }}>
              {feedItems.filter(item=>saved[item.id]).map(item=>{
                const ui=unis.find(u=>u.id===item.uniId);
                return (
                  <TouchableOpacity key={item.id} onPress={()=>{setMSaved(false);setPost(item);}} style={{ ...cd({ padding:14, marginBottom:10 }) }}>
                    <View style={{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 }}>
                      <View style={{ width:28, height:28, borderRadius:14, backgroundColor:ui?.color||T.card2, alignItems:"center", justifyContent:"center" }}>
                        <Text style={{ color:"#fff", fontSize:9, fontWeight:"800" }}>{ui?.name?.slice(0,2)||""}</Text>
                      </View>
                      <Text style={{ color:T.text, fontSize:12, fontWeight:"700" }}>{item.uni}</Text>
                      <Text style={{ color:T.muted, fontSize:10 }}>· {item.tag}</Text>
                    </View>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:"600", marginBottom:4, lineHeight:18 }} numberOfLines={2}>{item.title}</Text>
                    <Text style={{ color:T.muted, fontSize:11 }} numberOfLines={1}>{item.body}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </BottomSheet>
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
