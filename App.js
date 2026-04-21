import { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity,
  Alert, Appearance, StatusBar,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { db } from "./src/firebase/config";
import { doc, setDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";

import { DK, LT } from "./src/theme/palette";
import { AVATAR_COLORS } from "./src/theme/avatar";
import { logout } from "./src/services/auth";
import { useCoursesStore } from "./src/stores/coursesStore";
import { usePostsStore } from "./src/stores/postsStore";
import { useUniversitiesStore } from "./src/stores/universitiesStore";
import { useOnboardingStore } from "./src/stores/onboardingStore";
import { useProfileStore } from "./src/stores/profileStore";
import { useAuthStore } from "./src/stores/authStore";
import { RootNavigator } from "./src/navigation/RootNavigator";
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
  const isDark = theme==="auto" ? colorScheme==="dark" : theme==="dark";
  const T = isDark ? DK : LT;

  const currentUser = useAuthStore(s => s.currentUser);
  const setUserData = useAuthStore(s => s.setUserData);

  const setStep = useOnboardingStore(s => s.setStep);
  const setDone = useOnboardingStore(s => s.setDone);
  const uType = useOnboardingStore(s => s.uType);
  const setC1 = useOnboardingStore(s => s.setC1);
  const setC2 = useOnboardingStore(s => s.setC2);

  const [tab, setTab] = useState("feed");
  const unis = useUniversitiesStore(s => s.unis);
  const setUnis = useUniversitiesStore(s => s.setUnis);
  const fbIcons = useCoursesStore(s => s.fbIcons);
  const selUni = useUniversitiesStore(s => s.selUni);
  const setSU = useUniversitiesStore(s => s.setSelUni);
  const [goalsModal, setGoalsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const av = useProfileStore(s => s.av);
  const avBgIdx = useProfileStore(s => s.avBgIdx);

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

  const getIcon = (id, fallback) => fbIcons[id] || fallback;

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
    Alert.alert("Sair","Deseja sair da sua conta?",[{text:"Cancelar",style:"cancel"},{text:"Sair",style:"destructive",onPress:async()=>{await logout(); setDone(false); setStep(0);}}]);
  };

  const toggleFollow = async (uni, isFollowing) => {
    if (!currentUser){Alert.alert("Atenção","Faça login para seguir universidades");return;}
    setUnis(prev=>prev.map(u=>u.name===uni.name?{...u,followed:isFollowing,followersCount:(u.followersCount||0)+(isFollowing?1:-1)}:u));
    if(selUni?.name===uni.name) setSU(p=>({...p,followed:isFollowing,followersCount:(p.followersCount||0)+(isFollowing?1:-1)}));
    setUserData(prev => {
      const cur = prev?.followedUnis || [];
      const next = isFollowing ? [...new Set([...cur, uni.name])] : cur.filter(n=>n!==uni.name);
      return { ...(prev||{}), followedUnis: next };
    });
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

  // ── MAIN APP ──
  const SBar = () => (
    <View style={{ backgroundColor:T.bg, paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:10, flexDirection:"row", alignItems:"center" }}>
      <View style={{ width:36 }} />
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize:22, fontWeight:"800", color:T.text }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
      </View>
      {tab==="perfil" ? (
        <TouchableOpacity onPress={()=>setMcfg(true)} style={{ width:36, height:36, borderRadius:18, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:14 }}>⚙️</Text>
        </TouchableOpacity>
      ) : tab==="feed" ? (
        <View style={{ width:36, height:36, borderRadius:18, backgroundColor:AVATAR_COLORS[avBgIdx][0], alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:18 }}>{av}</Text>
        </View>
      ) : <View style={{ width:36 }} />}
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
    />
  );

  const renderFeed = () => (
    <FeedScreen
      refreshing={refreshing}
      onRefresh={onRefresh}
      goExplorar={() => setTab("explorar")}
      onSelectUni={(u) => { setSU(u); setTab("explorar"); }}
      onShare={(item) => setMshr(item)}
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
    />
  );

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={isDark?"light-content":"dark-content"} />
      {!showExamsPage && !showBooksPage && <SBar />}
      {!selUni && !showExamsPage && !showBooksPage && (
        <View style={{ paddingHorizontal:20, paddingTop:0, paddingBottom:6 }}>
          <Text style={{ color:T.sub, fontSize:11 }}>{tab==="explorar"?"Encontre sua universidade":tab==="notas"?"Notas de corte & suas provas":`${uType?.emoji||"👤"} ${uType?.label||"Meu Perfil"}`}</Text>
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

      <SettingsModal visible={mCfg} onClose={()=>setMcfg(false)} onOpenName={()=>setMnome(true)} onOpenPhoto={()=>setMpho(true)} onOpenEditCourses={()=>setMedit(true)} onOpenLocation={()=>setMloc(true)} onOpenGoals={()=>setGoalsModal(true)} onLogout={handleLogout} />

      <AvatarPickerModal visible={mPho} onClose={()=>setMpho(false)} />

      <EditNameModal visible={mNome} onClose={()=>setMnome(false)} />

      {/* Edit course */}
      <EditCoursesModal visible={mEdit} onClose={()=>setMedit(false)} onSave={(a,b)=>{setC1(a);setC2(b);}} />

      <EventDetailModal event={mEv} onClose={()=>setMev(null)} />

      <AddGradeModal visible={mGr} onClose={()=>setMgr(false)} />

      <ShareModal item={mShr} onClose={()=>setMshr(null)} />

      <DiscoverCoursesModal visible={mDisc} onClose={()=>setMdisc(false)} onPickCourse={setC1} />

      <UniSortModal visible={mUni} onClose={()=>setMUni(false)} />

      <ExamDetailModal exam={mExam} onClose={()=>setMexam(null)} />

      <LocationSettingsModal visible={mLoc} onClose={()=>setMloc(false)} />

      <GoalsModal visible={goalsModal} onClose={()=>setGoalsModal(false)} />

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
