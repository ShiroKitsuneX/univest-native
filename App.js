import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList,
  Modal, Alert, Appearance, Linking, Platform, StatusBar,
  KeyboardAvoidingView, Keyboard, Dimensions, ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "./src/firebase/config";
import {
  collection, getDocs, doc, setDoc, getDoc, deleteDoc,
  updateDoc, increment, addDoc, serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail,
  updatePassword, deleteUser, EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

// ─── DATA ────────────────────────────────────────────────────────────────────
const USER_TYPES = [
  { id:"medio",     emoji:"📚", label:"Ensino Médio",         sub:"Cursando o ensino médio regular" },
  { id:"tecnico",   emoji:"🔧", label:"Ensino Médio Técnico", sub:"Ex: COTUCA, ETEC, SENAI, IFSP" },
  { id:"prevestu",  emoji:"🎯", label:"Pré-vestibulando",     sub:"Me preparando para vestibulares" },
  { id:"preenem",   emoji:"📝", label:"Foco no ENEM",         sub:"Estudando para o ENEM / SISU" },
  { id:"graduando", emoji:"🎓", label:"Graduando",            sub:"Cursando uma graduação" },
  { id:"premestre", emoji:"🔬", label:"Pré-mestrado",         sub:"Buscando uma vaga em mestrado" },
  { id:"mestrando", emoji:"🧪", label:"Mestrando",            sub:"Cursando o mestrado" },
  { id:"predouto",  emoji:"🏛️", label:"Pré-doutorado",        sub:"Buscando uma vaga em doutorado" },
  { id:"doutorando",emoji:"⚗️", label:"Doutorando",           sub:"Cursando o doutorado" },
  { id:"posdouto",  emoji:"🌟", label:"Pós-doutorando",       sub:"Realizando pesquisa pós-doutoral" },
  { id:"continuo",  emoji:"💼", label:"Educação Continuada",  sub:"Cursos livres, MBAs, especializações" },
];

const AREAS = [
  { id:"saude",     emoji:"🏥", label:"Saúde",          cor:"#e11d48", bg:"#fff1f2", darkBg:"#2d0814", courses:["Medicina","Enfermagem","Odontologia","Farmácia","Fisioterapia","Nutrição","Biomedicina","Veterinária"] },
  { id:"exatas",    emoji:"📐", label:"Exatas",         cor:"#2563eb", bg:"#eff6ff", darkBg:"#0c1a3a", courses:["Matemática","Física","Química","Engenharia Civil","Engenharia Elétrica","Engenharia Mecânica","Engenharia Química"] },
  { id:"tecnologia",emoji:"💻", label:"Tecnologia",    cor:"#7c3aed", bg:"#f5f3ff", darkBg:"#1a0d33", courses:["Ciências da Computação","Engenharia de Computação","Sistemas de Informação","Design"] },
  { id:"humanas",   emoji:"📖", label:"Humanas",        cor:"#d97706", bg:"#fffbeb", darkBg:"#2a1800", courses:["Direito","História","Filosofia","Sociologia","Letras","Pedagogia","Psicologia","Jornalismo"] },
  { id:"negocios",  emoji:"💼", label:"Negócios",       cor:"#059669", bg:"#ecfdf5", darkBg:"#0a2018", courses:["Administração","Economia","Contabilidade","Publicidade","Relações Internacionais"] },
  { id:"artes",     emoji:"🎨", label:"Artes & Design", cor:"#db2777", bg:"#fdf2f8", darkBg:"#2a0820", courses:["Arquitetura","Design","Música","Artes Visuais"] },
  { id:"agrarias",  emoji:"🌱", label:"Agrárias",       cor:"#65a30d", bg:"#f7fee7", darkBg:"#142010", courses:["Agronomia","Medicina Veterinária","Engenharia Florestal","Biologia"] },
];

const ALL_COURSES = [...new Set(AREAS.flatMap(a=>a.courses))].sort();

const UNIVERSITIES = [
  { id:"1",  name:"USP",     fullName:"Universidade de São Paulo",             city:"São Paulo",       state:"SP", color:"#003366", followers:"142k", type:"Estadual", description:"A maior universidade da América Latina, referência em pesquisa e inovação.",  courses:["Medicina","Direito","Engenharia Civil","Arquitetura","Psicologia"],     vestibular:"FUVEST 2026",        inscricao:"Ago–Set/2025", prova:"Jan/2026", site:"https://fuvest.br",          followed:false },
  { id:"2",  name:"UNICAMP", fullName:"Universidade Estadual de Campinas",     city:"Campinas",        state:"SP", color:"#004d2c", followers:"98k",  type:"Estadual", description:"Excelência em ciência, tecnologia e inovação no interior Paulista.",       courses:["Medicina","Engenharia de Computação","Ciências da Computação","Física"], vestibular:"COMVEST 2026",       inscricao:"Ago/2025",     prova:"Dez/2025", site:"https://comvest.unicamp.br", followed:false },
  { id:"3",  name:"UNESP",   fullName:"Universidade Estadual Paulista",        city:"São Paulo",       state:"SP", color:"#8B0000", followers:"76k",  type:"Estadual", description:"Presente em todo SP com campi em 24 cidades.",                            courses:["Medicina","Odontologia","Veterinária","Agronomia","Direito"],          vestibular:"VUNESP 2026",        inscricao:"Set/2025",     prova:"Jan/2026", site:"https://vunesp.com.br",       followed:false },
  { id:"4",  name:"UNIFESP", fullName:"Universidade Federal de São Paulo",     city:"São Paulo",       state:"SP", color:"#4B0082", followers:"54k",  type:"Federal",  description:"Referência nacional em saúde, com cursos de medicina de alto nível.",     courses:["Medicina","Enfermagem","Farmácia","Biomedicina"],                      vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://unifesp.br",          followed:false },
  { id:"5",  name:"UFMG",    fullName:"Universidade Federal de Minas Gerais",  city:"Belo Horizonte",  state:"MG", color:"#1a3a5c", followers:"89k",  type:"Federal",  description:"Uma das melhores federais do Brasil, destaque em diversas áreas.",        courses:["Medicina","Direito","Arquitetura","Engenharia Civil","Letras"],         vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://ufmg.br",             followed:false },
  { id:"6",  name:"UFRJ",    fullName:"Universidade Federal do Rio de Janeiro", city:"Rio de Janeiro", state:"RJ", color:"#003580", followers:"110k", type:"Federal",  description:"A maior universidade federal do Brasil, com tradição centenária.",        courses:["Medicina","Engenharia Civil","Arquitetura","Economia"],                vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://ufrj.br",             followed:false },
  { id:"7",  name:"COTUCA",  fullName:"Colégio Técnico da UNICAMP",            city:"Campinas",        state:"SP", color:"#1a4a3a", followers:"18k",  type:"Técnico",  description:"Escola técnica de nível médio vinculada à UNICAMP.",                      courses:["Mecânica","Eletrônica","Informática","Edificações"],                   vestibular:"Proc. Seletivo 2026",inscricao:"Out/2025",    prova:"Dez/2025", site:"https://cotuca.unicamp.br",   followed:false },
  { id:"8",  name:"ETEC",    fullName:"Escola Técnica Estadual de SP",         city:"São Paulo",       state:"SP", color:"#2d4a7a", followers:"32k",  type:"Técnico",  description:"Rede de escolas técnicas estaduais com cursos gratuitos.",               courses:["Administração","Informática","Enfermagem","Logística"],                vestibular:"Vestibulinho 2026",  inscricao:"Set/2025",     prova:"Nov/2025", site:"https://etec.sp.gov.br",      followed:false },
];

const FEED = [
  { id:"f1", uniId:"1", uni:"USP",     type:"alert",    icon:"📋", tag:"Inscrições",    title:"FUVEST 2026 — Inscrições abertas!",               body:"As inscrições para a FUVEST 2026 estão abertas. Período: 01/08 a 15/09/2025. Taxa: R$ 190,00.", time:"2h atrás",    likes:2341  },
  { id:"f2", uniId:"1", uni:"USP",     type:"lista",    icon:"📚", tag:"Lista de Obras", title:"Lista de obras literárias FUVEST 2026 divulgada", body:"A USP divulgou as 8 obras obrigatórias: Dom Casmurro, Vidas Secas, Morte e Vida Severina e outras 5.", time:"1d atrás",    likes:5820  },
  { id:"f3", uniId:"2", uni:"UNICAMP", type:"nota",     icon:"📊", tag:"Notas de Corte", title:"Notas de corte Medicina UNICAMP 2025",            body:"A nota de corte para Medicina na UNICAMP em 2025 foi de 87,3 pontos. Confira o histórico.", time:"3d atrás",    likes:8910  },
  { id:"f4", uniId:"2", uni:"UNICAMP", type:"simulado", icon:"✍️", tag:"Simulado",       title:"Simulado COMVEST 2025 disponível para download",  body:"A UNICAMP disponibilizou o simulado oficial com gabarito. Treine com a prova real!", time:"5d atrás",    likes:12400 },
  { id:"f5", uniId:"1", uni:"USP",     type:"news",     icon:"📰", tag:"Notícia",        title:"USP sobe no ranking mundial de universidades",    body:"A USP subiu 15 posições no QS World University Rankings 2025, mantendo-se a melhor da América Latina.", time:"1 sem atrás", likes:19200 },
];

const NOTAS_CORTE = [
  { curso:"Medicina",               uni:"USP (SP)",     nota:88.4, vagas:150, cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Medicina",               uni:"UNICAMP (SP)", nota:87.3, vagas:80,  cor:"#004d2c", site:"https://comvest.unicamp.br" },
  { curso:"Medicina",               uni:"UNESP (SP)",   nota:84.1, vagas:160, cor:"#8B0000", site:"https://vunesp.com.br"      },
  { curso:"Medicina",               uni:"UNIFESP (SP)", nota:89.1, vagas:80,  cor:"#4B0082", site:"https://unifesp.br"         },
  { curso:"Direito",                uni:"USP (SP)",     nota:79.2, vagas:240, cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Engenharia Civil",       uni:"USP (SP)",     nota:73.5, vagas:180, cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Ciências da Computação", uni:"UNICAMP (SP)", nota:74.8, vagas:120, cor:"#004d2c", site:"https://comvest.unicamp.br" },
  { curso:"Engenharia de Computação",uni:"UNICAMP (SP)",nota:72.1, vagas:100, cor:"#004d2c", site:"https://comvest.unicamp.br" },
  { curso:"Odontologia",            uni:"USP (SP)",     nota:76.3, vagas:100, cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Psicologia",             uni:"USP (SP)",     nota:71.8, vagas:80,  cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Arquitetura",            uni:"USP (SP)",     nota:74.2, vagas:60,  cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Farmácia",               uni:"UNIFESP (SP)", nota:68.4, vagas:80,  cor:"#4B0082", site:"https://unifesp.br"         },
  { curso:"Administração",          uni:"USP (SP)",     nota:66.1, vagas:240, cor:"#003366", site:"https://fuvest.br"          },
  { curso:"Agronomia",              uni:"UNESP (SP)",   nota:61.2, vagas:80,  cor:"#8B0000", site:"https://vunesp.com.br"      },
];

const EVENTS = [
  { id:"e1", dayLabel:"01", month:"AGO", year:"2025", event:"Abertura inscrições FUVEST 2026", uni:"USP",      site:"https://fuvest.br",          cor:"#003366", desc:"Início das inscrições para a FUVEST 2026. Taxa de R$190. Prazo final: 15/09/2025." },
  { id:"e2", dayLabel:"—",  month:"NOV", year:"2025", event:"ENEM 2025 — 1ª fase",             uni:"Nacional", site:"https://enem.inep.gov.br",   cor:"#1a3a5c", desc:"Exame Nacional do Ensino Médio 2025. Provas de Linguagens, Humanas, Natureza, Matemática e Redação." },
  { id:"e3", dayLabel:"—",  month:"JAN", year:"2026", event:"FUVEST 2026 — 1ª fase",           uni:"USP",      site:"https://fuvest.br",          cor:"#003366", desc:"Primeira fase da FUVEST 2026: 90 questões objetivas. Aprovados seguem para a 2ª fase." },
  { id:"e4", dayLabel:"—",  month:"DEZ", year:"2025", event:"COMVEST 2026 — 1ª fase",          uni:"UNICAMP",  site:"https://comvest.unicamp.br", cor:"#004d2c", desc:"Primeira fase do vestibular da UNICAMP. 72 questões objetivas sobre o ensino médio." },
];

const AVATAR_PRESETS = ["🧑‍🎓","👩‍🔬","👨‍💻","👩‍⚕️","👨‍🏫","👩‍🎨","🦊","🐬","🌟","🍀","⚡","🔥","🌙","🎯","🚀","🧠"];
const AVATAR_COLORS = [
  ["#00E5A0","#0099ff"],["#e11d48","#f97316"],["#8b5cf6","#ec4899"],["#3b82f6","#06b6d4"],
  ["#f59e0b","#ef4444"],["#10b981","#14b8a6"],["#6366f1","#8b5cf6"],["#f43f5e","#f97316"],
];

const TAG_D = { alert:{bg:"#2a1800",tx:"#fbbf24",b:"#78350f"}, lista:{bg:"#052e16",tx:"#4ade80",b:"#166534"}, nota:{bg:"#0c1f3a",tx:"#60a5fa",b:"#1e40af"}, simulado:{bg:"#1f0a33",tx:"#c084fc",b:"#6b21a8"}, news:{bg:"#2d0a18",tx:"#f9a8d4",b:"#9f1239"} };
const TAG_L = { alert:{bg:"#fff7ed",tx:"#c2410c",b:"#fed7aa"}, lista:{bg:"#f0fdf4",tx:"#15803d",b:"#bbf7d0"}, nota:{bg:"#eff6ff",tx:"#1d4ed8",b:"#bfdbfe"}, simulado:{bg:"#faf5ff",tx:"#7c3aed",b:"#e9d5ff"}, news:{bg:"#fff1f2",tx:"#be123c",b:"#fecdd3"} };
const DK = { bg:"#0d1117",card:"#161b27",card2:"#1c2333",border:"#21293d",text:"#e6edf3",sub:"#8b949e",muted:"#484f58",accent:"#00E5A0",acBg:"rgba(0,229,160,.1)",nav:"#0d1117",inp:"#1c2333",inpB:"#21293d" };
const LT = { bg:"#f0f4fb",card:"#ffffff",card2:"#f0f4ff",border:"#dde3ef",text:"#1a1f2e",sub:"#5a6478",muted:"#9aa0ad",accent:"#0077cc",acBg:"rgba(0,119,204,.08)",nav:"#ffffff",inp:"#ffffff",inpB:"#dde3ef" };

const STORAGE_KEY = "univest_onboarding";
const loadOnboardingData = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return { step:data.step||0, done:data.done||false, uTypeId:data.uTypeId||null, c1:data.c1||"", c2:data.c2||"", uType:data.uTypeId?USER_TYPES.find(t=>t.id===data.uTypeId)||null:null };
    }
  } catch {}
  return { step:0, done:false, uTypeId:null, c1:"", c2:"", uType:null };
};
const saveOnboardingData = async (step, done, uType, c1, c2) => {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ step, done, uTypeId:uType?.id||null, c1, c2 })); } catch {}
};

function SBox({ val, set, ph, T }) {
  return (
    <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.inp, borderRadius:13, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:T.inpB }}>
      <Text style={{ fontSize:14, marginRight:10 }}>🔍</Text>
      <TextInput value={val} onChangeText={set} placeholder={ph} placeholderTextColor={T.muted} style={{ flex:1, color:T.text, fontSize:14, padding:0 }} />
      {!!val && <TouchableOpacity onPress={()=>set("")}><Text style={{ color:T.muted, fontSize:13 }}>✕</Text></TouchableOpacity>}
    </View>
  );
}

function BottomSheet({ visible, onClose, children, T }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex:1, backgroundColor:"rgba(0,0,0,.72)", justifyContent:"flex-end" }}>
        <TouchableOpacity activeOpacity={1} style={{ backgroundColor:T.card, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"88%", borderTopWidth:1, borderColor:T.border }}>
          <View style={{ width:36, height:4, backgroundColor:T.border, borderRadius:2, alignSelf:"center", marginTop:12, marginBottom:4 }} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState("dark");
  const isDark = theme==="auto" ? colorScheme==="dark" : theme==="dark";
  const T = isDark ? DK : LT;
  const TG = isDark ? TAG_D : TAG_L;
  const AT = isDark ? "#000" : "#fff";

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [userData, setUserData] = useState(null);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [uType, setUType] = useState(null);
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [cSrch, setCsrch] = useState("");
  const [uSrch, setUsrch] = useState("");
  const [picking, setPick] = useState(1);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const [tab, setTab] = useState("feed");
  const [unis, setUnis] = useState(UNIVERSITIES);
  const [posts, setPosts] = useState([]);
  const [fbUnis, setFbUnis] = useState([]);
  const [fbCourses, setFbCourses] = useState([]);
  const [fbIcons, setFbIcons] = useState({});
  const [selUni, setSU] = useState(null);
  const [query, setQuery] = useState("");
  const [fSt, setFSt] = useState("Todos");
  const [nSrch, setNsrch] = useState("");
  const [saved, setSaved] = useState({});
  const [liked, setLiked] = useState({});
  const [uniSort, setUniSort] = useState("date");
  const [uniPrefs, setUniPrefs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const [gs, setGs] = useState([
    { id:1, ex:"FUVEST Simulado 1", dt:"Mar/2025", s:{l:62,h:70,n:58,m:55,r:680} },
    { id:2, ex:"FUVEST Simulado 2", dt:"Abr/2025", s:{l:68,h:74,n:65,m:60,r:720} },
    { id:3, ex:"ENEM Simulado",     dt:"Mai/2025", s:{l:72,h:78,n:69,m:64,r:760} },
  ]);
  const [ng, setNg] = useState({ ex:"",dt:"",l:"",h:"",n:"",m:"",r:"" });

  const [av, setAv] = useState("🧑‍🎓");
  const [avBgIdx, setAvBgIdx] = useState(0);
  const [tmpAv, setTmpAv] = useState("🧑‍🎓");
  const [tmpBgIdx, setTmpBgIdx] = useState(0);

  const [mCfg,  setMcfg]  = useState(false);
  const [mPho,  setMpho]  = useState(false);
  const [mEdit, setMedit] = useState(false);
  const [mEv,   setMev]   = useState(null);
  const [mGr,   setMgr]   = useState(false);
  const [mShr,  setMshr]  = useState(null);
  const [mDisc, setMdisc] = useState(false);
  const [mUni,  setMUni]  = useState(false);
  const [dArea, setDarea] = useState(null);
  const [dMax,  setDmax]  = useState(100);
  const [eC1,   setEC1]   = useState("");
  const [eC2,   setEC2]   = useState("");
  const [ePick, setEpick] = useState(1);
  const [eSrch, setEsrch] = useState("");

  const getIcon = (id, fallback) => fbIcons[id] || fallback;

  useEffect(() => {
    loadOnboardingData().then(data => {
      setStep(data.step); setDone(data.done); setUType(data.uType); setC1(data.c1); setC2(data.c2);
      setOnboardingLoaded(true);
    });
  }, []);

  const persist = useCallback((st, dn, ut, cc1, cc2) => saveOnboardingData(st, dn, ut, cc1, cc2), []);
  const hStep = (v) => { const n = typeof v==="function"?v(step):v; setStep(n); persist(n,done,uType,c1,c2); };
  const hDone = (v) => { setDone(v); persist(step,v,uType,c1,c2); };
  const hUType = (v) => { setUType(v); persist(step,done,v,c1,c2); };
  const hC1 = (v) => { setC1(v); persist(step,done,uType,v,c2); };
  const hC2 = (v) => { setC2(v); persist(step,done,uType,c1,v); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const snap = await getDoc(doc(db,"usuarios",user.uid));
          if (snap.exists()) {
            const data = snap.data(); setUserData(data);
            if (data.done===true) {
              if (data.uTypeId) { const ut=USER_TYPES.find(t=>t.id===data.uTypeId); if(ut) hUType(ut); }
              if (data.c1) hC1(data.c1);
              if (data.c2) hC2(data.c2);
              hDone(true);
            } else { hStep(1); hDone(false); }
            if (data.theme) setTheme(data.theme);
            if (data.av) setAv(data.av);
            if (data.avBgIdx!==undefined) setAvBgIdx(data.avBgIdx);
            if (data.grades) setGs(data.grades);
            if (data.saved) setSaved(data.saved);
          } else { hStep(1); hDone(false); }
        } catch {}
      } else { setCurrentUser(null); setUserData(null); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [unisSnap, coursesSnap, iconsSnap] = await Promise.all([getDocs(collection(db,"universidades")),getDocs(collection(db,"cursos")),getDocs(collection(db,"icones"))]);
        if (!unisSnap.empty) { const f=unisSnap.docs.map(d=>({id:d.id,...d.data()})); const u=[...new Map(f.map(u=>[u.name,u])).values()]; setFbUnis(u); setUnis(u); }
        if (!coursesSnap.empty) setFbCourses([...new Set(coursesSnap.docs.map(d=>d.data().name))].sort());
        if (!iconsSnap.empty) { const m={}; iconsSnap.docs.forEach(d=>{const x=d.data();m[x.id]=x.emoji;}); setFbIcons(m); }
      } catch {}
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!fbUnis.length) return;
    setUnis(fbUnis.map(u=>({...u, followed:userData?.followedUnis?.includes(u.name)||false})));
  }, [fbUnis, userData]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snap = await getDocs(collection(db,"posts"));
        const f = snap.docs.map(d=>({id:d.id,...d.data()}));
        f.sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
        setPosts(f);
        if (currentUser) { const lk={}; for(const p of f){ const ls=await getDoc(doc(db,"posts",p.id,"likes",currentUser.uid)); if(ls.exists())lk[p.id]=true; } setLiked(lk); }
      } catch { setPosts(FEED); }
    };
    fetchPosts();
  }, [currentUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [unisSnap, postsSnap] = await Promise.all([
        getDocs(collection(db,"universidades")),
        getDocs(collection(db,"posts")),
      ]);
      if (!unisSnap.empty) { const f=unisSnap.docs.map(d=>({id:d.id,...d.data()})); const u=[...new Map(f.map(u=>[u.name,u])).values()]; setFbUnis(u); setUnis(u); }
      if (!postsSnap.empty) { const f=postsSnap.docs.map(d=>({id:d.id,...d.data()})); f.sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0)); setPosts(f); }
    } catch {}
    setRefreshing(false);
  }, []);

  const getAuthError = (err, mode) => {
    const code = err.code || "";
    if (code.includes("user-not-found") || code.includes("wrong-password")) return "E-mail ou senha incorretos";
    if (code.includes("email-already-in-use")) return "E-mail já cadastrado";
    if (code.includes("invalid-email")) return "E-mail inválido";
    if (code.includes("weak-password")) return "Senha muito fraca";
    if (code.includes("network")) return "Erro de conexão. Verifique sua internet.";
    if (code.includes("too-many-requests")) return "Muitas tentativas. Tente novamente mais tarde.";
    return mode === "login" ? "Erro ao fazer login. Verifique sua conexão." : "Erro ao criar conta. Verifique sua conexão.";
  };

  const handleLogin = async () => {
    if (!authEmail||!authPassword){setAuthError("Preencha e-mail e senha");return;}
    setAuthSubmitting(true); setAuthError("");
    try { await signInWithEmailAndPassword(auth,authEmail,authPassword); setShowLogin(false); setAuthEmail(""); setAuthPassword(""); }
    catch(err){ setAuthError(getAuthError(err, "login")); }
    setAuthSubmitting(false);
  };

  const handleSignup = async () => {
    if (!authEmail||!authPassword){setAuthError("Preencha e-mail e senha");return;}
    if (authPassword.length<6){setAuthError("Senha deve ter pelo menos 6 caracteres");return;}
    setAuthSubmitting(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth,authEmail,authPassword);
      await setDoc(doc(db,"usuarios",cred.user.uid),{email:cred.user.email,tipo:"usuario",followedUnis:[],updatedAt:new Date().toISOString()});
      await sendEmailVerification(cred.user);
      setAuthEmail(""); setAuthPassword("");
    } catch(err){ setAuthError(getAuthError(err, "signup")); }
    setAuthSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!authEmail){setAuthError("Preencha seu e-mail");return;}
    setAuthSubmitting(true); setAuthError("");
    try { await sendPasswordResetEmail(auth,authEmail); setPasswordSent(true); }
    catch(err){ setAuthError(err.code==="auth/user-not-found"?"E-mail não cadastrado":"Erro ao enviar e-mail."); }
    setAuthSubmitting(false);
  };

  const handleLogout = () => {
    Alert.alert("Sair","Deseja sair da sua conta?",[{text:"Cancelar",style:"cancel"},{text:"Sair",style:"destructive",onPress:async()=>{await signOut(auth); hDone(false); hStep(0);}}]);
  };

  const saveUserPrefs = useCallback(async (data) => {
    if (!currentUser) return;
    try { 
      await setDoc(doc(db,"usuarios",currentUser.uid),{...data,updatedAt:new Date().toISOString()},{merge:true});
    } catch (e) { console.log("Save error:", e.message); }
  }, [currentUser]);

  useEffect(() => { if (currentUser) saveUserPrefs({ theme }); }, [theme, currentUser]);
  useEffect(() => { if (currentUser) saveUserPrefs({ av, avBgIdx }); }, [av, avBgIdx, currentUser]);
  useEffect(() => { if (currentUser) saveUserPrefs({ grades:gs }); }, [gs, currentUser]);
  useEffect(() => { if (currentUser) saveUserPrefs({ saved }); }, [saved, currentUser]);

  const toggleFollow = async (uni, isFollowing) => {
    if (!currentUser){Alert.alert("Atenção","Faça login para seguir universidades");return;}
    try {
      const userRef=doc(db,"usuarios",currentUser.uid);
      const snap=await getDoc(userRef); const cur=snap.data()?.followedUnis||[];
      const next=isFollowing?[...cur,uni.name]:cur.filter(n=>n!==uni.name);
      await updateDoc(userRef,{followedUnis:next});
      setUserData(p=>p?{...p,followedUnis:next}:null);
      await updateDoc(doc(db,"universidades",uni.id),{seguidores:increment(isFollowing?1:-1)});
      setUnis(prev=>prev.map(u=>u.name===uni.name?{...u,followed:isFollowing}:u));
      if(selUni?.name===uni.name) setSU(p=>({...p,followed:isFollowing}));
    } catch(err){ Alert.alert("Erro","Não foi possível seguir: "+err.message); }
  };

  const fol = unis.filter(u=>u.followed).sort((a,b)=>{
    if(uniSort==="pref") return (uniPrefs[b.id]||5)-(uniPrefs[a.id]||5);
    const months={JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12};
    const gm=s=>months[s?.match(/[A-Z]{3}/)?.[0]||"DEZ"]||12;
    return gm(a.prova)-gm(b.prova);
  });
  const last = gs[gs.length-1];
  const avg = g => Math.round((g.s.l+g.s.h+g.s.n+g.s.m)/4);
  const tgt = NOTAS_CORTE.filter(n=>n.curso===c1).reduce((a,b)=>Math.max(a,b.nota),70);
  const radar = last ? [
    {subject:"Ling.", v:last.s.l, fullMark:100},
    {subject:"Humanas", v:last.s.h, fullMark:100},
    {subject:"Nat.", v:last.s.n, fullMark:100},
    {subject:"Mat.", v:last.s.m, fullMark:100},
    {subject:"Redação", v:Math.round(last.s.r/10), fullMark:100},
  ] : [];
  const weak = radar.length ? radar.reduce((a,b)=>a.v<b.v?a:b) : null;
  const bars = gs.map(g=>({
    name: g.ex.length>12 ? g.ex.slice(0,12)+"…" : g.ex,
    Linguagens: g.s.l,
    Matemática: g.s.m,
    Natureza: g.s.n,
    Humanas: g.s.h,
  }));
  const chartConfig = {
    backgroundGradientFrom: T.card,
    backgroundGradientTo: T.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 229, 160, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "1", stroke: T.accent },
  };
  const uCourses = [c1,c2].filter(Boolean);
  const filtN = NOTAS_CORTE.filter(n=>{ if(nSrch) return n.curso.toLowerCase().includes(nSrch.toLowerCase())||n.uni.toLowerCase().includes(nSrch.toLowerCase()); return uCourses.length===0||uCourses.some(c=>c&&n.curso===c); });
  const filtU = unis.filter(u=>{ const q=query.toLowerCase(); return (u.name.toLowerCase().includes(q)||u.fullName.toLowerCase().includes(q))&&(fSt==="Todos"||u.state===fSt||(fSt==="Técnico"&&u.type==="Técnico")); });
  const coursesToUse = fbCourses.length ? fbCourses : ALL_COURSES;
  const feedItems = posts.length ? posts : FEED;

  const cd = (extra={}) => ({ backgroundColor:T.card, borderRadius:18, borderWidth:1, borderColor:T.border, ...extra });
  const lbl = { color:T.muted, fontSize:10, fontWeight:"700", textTransform:"uppercase", letterSpacing:0.8 };

  if (!onboardingLoaded || authLoading) {
    return (
      <View style={{ flex:1, backgroundColor:isDark?"#0d1117":"#f0f4fb", justifyContent:"center", alignItems:"center" }}>
        <StatusBar barStyle={isDark?"light-content":"dark-content"} />
        <Text style={{ fontSize:64, marginBottom:16 }}>🎓</Text>
        <Text style={{ fontSize:32, fontWeight:"800", color:isDark?"#e6edf3":"#1a1f2e", marginBottom:4 }}>
          Uni<Text style={{ color:"#00E5A0" }}>Vest</Text>
        </Text>
        <ActivityIndicator size="large" color="#00E5A0" style={{ marginTop:24 }} />
      </View>
    );
  }

  // ── WELCOME ──
  if (!currentUser) {
    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <StatusBar barStyle={isDark?"light-content":"dark-content"} />
        <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:"center", padding:28, paddingTop:insets.top+28, paddingBottom:insets.bottom+28 }}>
          <Text style={{ fontSize:64, textAlign:"center", marginBottom:14 }}>🎓</Text>
          <Text style={{ fontSize:34, fontWeight:"800", color:T.text, textAlign:"center", marginBottom:8 }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
          <Text style={{ color:T.sub, fontSize:14, textAlign:"center", lineHeight:24, marginBottom:32 }}>Seu portal inteligente para toda a jornada acadêmica</Text>
          <View style={{ gap:9, marginBottom:32 }}>
            {[["vestibular","🎯","Vestibulares & ENEM"],["graduacao","🎓","Graduação & Pós-graduação"],["mestrado","🔬","Mestrado & Doutorado"],["tecnico","📚","Ensino Médio & Técnico"]].map(([id,ic,l])=>(
              <View key={id} style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.card2, borderRadius:14, padding:13, borderWidth:1, borderColor:T.border }}>
                <Text style={{ fontSize:20, marginRight:14 }}>{getIcon(id,ic)}</Text>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"600" }}>{l}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={()=>setShowLogin(true)} style={{ padding:16, borderRadius:18, backgroundColor:T.accent, alignItems:"center" }}>
            <Text style={{ color:AT, fontSize:16, fontWeight:"800" }}>Entrar ou criar conta</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showLogin} transparent animationType="fade" onRequestClose={()=>setShowLogin(false)}>
          <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{ flex:1 }}>
            <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:"center", backgroundColor:T.bg, padding:20, paddingTop:insets.top+20, paddingBottom:insets.bottom+20 }} keyboardShouldPersistTaps="handled">
              <View style={{ backgroundColor:T.card, borderRadius:20, padding:24, width:"100%", maxWidth:360, alignSelf:"center" }}>
                <Text style={{ fontSize:44, textAlign:"center", marginBottom:8 }}>🎓</Text>
                <Text style={{ color:T.text, fontSize:22, fontWeight:"800", textAlign:"center", marginBottom:20 }}>UniVest</Text>
                {!forgotMode && !passwordSent && (
                  <>
                    <View style={{ flexDirection:"row", gap:8, marginBottom:20 }}>
                      {[["login","Entrar"],["signup","Criar conta"]].map(([m,l])=>(
                        <TouchableOpacity key={m} onPress={()=>setLoginMode(m)} style={{ flex:1, padding:10, borderRadius:12, backgroundColor:loginMode===m?T.accent:T.card2, alignItems:"center" }}>
                          <Text style={{ color:loginMode===m?AT:T.sub, fontWeight:"700", fontSize:13 }}>{l}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{ color:T.sub, fontSize:12, marginBottom:6 }}>E-mail</Text>
                    <TextInput value={authEmail} onChangeText={setAuthEmail} placeholder="seu@email.com" placeholderTextColor={T.muted} autoCapitalize="none" keyboardType="email-address" style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.border, backgroundColor:T.inp, color:T.text, fontSize:14, marginBottom:12 }} />
                    <Text style={{ color:T.sub, fontSize:12, marginBottom:6 }}>Senha</Text>
                    <View style={{ marginBottom:8 }}>
                      <TextInput value={authPassword} onChangeText={setAuthPassword} placeholder={loginMode==="signup"?"Mínimo 6 caracteres":"••••••••"} placeholderTextColor={T.muted} secureTextEntry={!showLoginPwd} style={{ padding:12, paddingRight:44, borderRadius:12, borderWidth:1, borderColor:T.border, backgroundColor:T.inp, color:T.text, fontSize:14 }} />
                      <TouchableOpacity onPress={()=>setShowLoginPwd(!showLoginPwd)} style={{ position:"absolute", right:12, top:12 }}><Text style={{ fontSize:16 }}>{showLoginPwd?"👁️‍🗨️":"👁️"}</Text></TouchableOpacity>
                    </View>
                    {!!authError && <Text style={{ color:"#f87171", fontSize:12, marginBottom:8, textAlign:"center" }}>{authError}</Text>}
                    <TouchableOpacity onPress={loginMode==="login"?handleLogin:handleSignup} disabled={authSubmitting} style={{ padding:14, borderRadius:14, backgroundColor:T.accent, alignItems:"center", marginTop:8 }}>
                      <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>{authSubmitting?"Aguarde...":loginMode==="login"?"Entrar":"Criar conta"}</Text>
                    </TouchableOpacity>
                    {loginMode==="login" && <TouchableOpacity onPress={()=>{setForgotMode(true);setAuthError("");}} style={{ padding:10, alignItems:"center", marginTop:8 }}><Text style={{ color:T.accent, fontSize:13, fontWeight:"600" }}>Esqueceu a senha?</Text></TouchableOpacity>}
                  </>
                )}
                {forgotMode && !passwordSent && (
                  <>
                    <TouchableOpacity onPress={()=>{setForgotMode(false);setAuthError("");}} style={{ marginBottom:16 }}><Text style={{ color:T.sub, fontSize:13 }}>← Voltar</Text></TouchableOpacity>
                    <Text style={{ color:T.text, fontSize:18, fontWeight:"800", textAlign:"center", marginBottom:4 }}>Esqueceu a senha?</Text>
                    <Text style={{ color:T.sub, fontSize:13, textAlign:"center", marginBottom:16 }}>Enviaremos um link para redefinir</Text>
                    <TextInput value={authEmail} onChangeText={setAuthEmail} placeholder="seu@email.com" placeholderTextColor={T.muted} autoCapitalize="none" keyboardType="email-address" style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.border, backgroundColor:T.inp, color:T.text, fontSize:14, marginBottom:8 }} />
                    {!!authError && <Text style={{ color:"#f87171", fontSize:12, marginBottom:8, textAlign:"center" }}>{authError}</Text>}
                    <TouchableOpacity onPress={handleForgotPassword} disabled={authSubmitting} style={{ padding:14, borderRadius:14, backgroundColor:T.accent, alignItems:"center", marginTop:8 }}>
                      <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>{authSubmitting?"Enviando...":"Enviar link"}</Text>
                    </TouchableOpacity>
                  </>
                )}
                {passwordSent && (
                  <>
                    <Text style={{ fontSize:48, textAlign:"center", marginBottom:12 }}>📧</Text>
                    <Text style={{ color:T.text, fontSize:18, fontWeight:"800", textAlign:"center", marginBottom:8 }}>E-mail enviado!</Text>
                    <Text style={{ color:T.sub, fontSize:13, textAlign:"center", lineHeight:20, marginBottom:16 }}>Verifique sua caixa de entrada.</Text>
                    <TouchableOpacity onPress={()=>{setPasswordSent(false);setForgotMode(false);setLoginMode("login");}} style={{ padding:14, borderRadius:14, backgroundColor:T.accent, alignItems:"center" }}>
                      <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Entendi</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={()=>{setShowLogin(false);setLoginMode("login");setForgotMode(false);setPasswordSent(false);setAuthError("");}} style={{ padding:10, alignItems:"center", marginTop:12 }}>
                  <Text style={{ color:T.muted, fontSize:13 }}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // ── ONBOARDING ──
  if (!done) {
    const fC = coursesToUse.filter(c=>c.toLowerCase().includes(cSrch.toLowerCase())).sort((a,b)=>{
      const la=a.toLowerCase(),lb=b.toLowerCase(),ls=cSrch.toLowerCase();
      if(la===ls&&lb!==ls)return-1; if(la!==ls&&lb===ls)return 1;
      if(la.startsWith(ls)&&!lb.startsWith(ls))return-1; if(!la.startsWith(ls)&&lb.startsWith(ls))return 1;
      return la.localeCompare(lb);
    });
    const canNext = step===1?!!uType:step===2?!!c1:true;
    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <StatusBar barStyle={isDark?"light-content":"dark-content"} />
        <View style={{ paddingHorizontal:20, paddingTop:insets.top+8, paddingBottom:8, flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
          <Text style={{ fontSize:20, fontWeight:"800", color:T.text }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
        </View>
        {step===1 && (
          <>
            <View style={{ paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.muted, fontSize:10, marginBottom:4 }}>Passo 1 de 3</Text>
              <Text style={{ color:T.text, fontSize:17, fontWeight:"800", lineHeight:23 }}>O que melhor descreve você?</Text>
              <Text style={{ color:T.sub, fontSize:11 }}>Você pode alterar depois nas configurações</Text>
            </View>
            <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:20, paddingBottom:100 }}>
              {USER_TYPES.map(ut=>(
                <TouchableOpacity key={ut.id} onPress={()=>hUType(uType?.id===ut.id?null:ut)} style={{ flexDirection:"row", alignItems:"center", padding:14, borderRadius:16, backgroundColor:uType?.id===ut.id?T.acBg:T.card2, borderWidth:1.5, borderColor:uType?.id===ut.id?T.accent:T.border, marginBottom:8 }}>
                  <Text style={{ fontSize:24, marginRight:14 }}>{getIcon("user_type_"+ut.id,ut.emoji)}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontSize:14, fontWeight:"700", color:T.text }}>{ut.label}</Text>
                    <Text style={{ fontSize:11, color:T.sub }}>{ut.sub}</Text>
                  </View>
                  {uType?.id===ut.id && <Text style={{ color:T.accent, fontSize:16, fontWeight:"800" }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        {step===2 && (
          <>
            <View style={{ paddingHorizontal:20, paddingTop:16, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.muted, fontSize:11, marginBottom:4 }}>Passo 2 de 3</Text>
              <Text style={{ color:T.text, fontSize:20, fontWeight:"800" }}>Qual curso te interessa?</Text>
              <Text style={{ color:T.sub, fontSize:12, marginTop:3, marginBottom:10 }}>Escolha 1ª e 2ª opção</Text>
              <View style={{ flexDirection:"row", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                {[1,2].map(n=>(
                  <TouchableOpacity key={n} onPress={()=>setPick(n)} style={{ paddingHorizontal:13, paddingVertical:6, borderRadius:20, backgroundColor:picking===n?T.accent:T.card2, borderWidth:1, borderColor:picking===n?T.accent:T.border }}>
                    <Text style={{ color:picking===n?AT:T.sub, fontSize:11, fontWeight:"700" }}>{n}ª: {n===1?(c1||"Escolher"):(c2||"Opcional")}</Text>
                  </TouchableOpacity>
                ))}
                {!!c2 && <TouchableOpacity onPress={()=>hC2("")}><Text style={{ color:"#f87171", fontSize:11, fontWeight:"700", paddingVertical:6 }}>✕ remover</Text></TouchableOpacity>}
              </View>
              <SBox val={cSrch} set={setCsrch} ph="Buscar curso…" T={T} />
            </View>
            <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:100 }} keyboardShouldPersistTaps="handled">
              {fC.map(cc=>{ const s1=c1===cc,s2=c2===cc; return (
                <TouchableOpacity key={cc} onPress={()=>{
                  if(picking===1){
                    if(s1){hC1("");}else{hC1(cc);hC2(s2?"":c2);}
                    setPick(2);
                  }else{
                    if(s2){hC2("");}else if(!s1){hC2(cc);}
                  }
                }} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:14, backgroundColor:(s1||s2)?T.acBg:T.card2, marginBottom:6 }}>
                  <Text style={{ color:(s1||s2)?T.accent:T.text, fontSize:13, fontWeight:(s1||s2)?"700":"500" }}>{cc}</Text>
                  <Text style={{ fontSize:11, fontWeight:"800", color:T.accent }}>{s1&&"1ª ✓"}{s2&&"2ª ✓"}</Text>
                </TouchableOpacity>
              );})}
            </ScrollView>
          </>
        )}
        {step===3 && (
          <>
            <View style={{ paddingHorizontal:20, paddingTop:16, paddingBottom:10, borderBottomWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.muted, fontSize:11, marginBottom:4 }}>Passo 3 de 3</Text>
              <Text style={{ color:T.text, fontSize:20, fontWeight:"800" }}>Quais universidades seguir?</Text>
              <Text style={{ color:T.sub, fontSize:12, marginTop:3, marginBottom:10 }}>Escolha para personalizar seu feed</Text>
              <SBox val={uSrch} set={setUsrch} ph="Buscar universidade…" T={T} />
            </View>
            <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:100 }} keyboardShouldPersistTaps="handled">
              {unis.filter(u=>!uSrch||u.name.toLowerCase().includes(uSrch.toLowerCase())||u.fullName.toLowerCase().includes(uSrch.toLowerCase())).map(u=>(
                <View key={u.id} style={{ ...cd(), flexDirection:"row", alignItems:"center", padding:15, marginBottom:8 }}>
                  <View style={{ width:46, height:46, borderRadius:23, backgroundColor:u.color, alignItems:"center", justifyContent:"center", marginRight:12 }}>
                    <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:14, fontWeight:"800" }}>{u.name}</Text>
                    <Text style={{ color:T.sub, fontSize:11 }}>{u.city} · {u.state}</Text>
                  </View>
                  <TouchableOpacity onPress={()=>setUnis(prev=>prev.map(x=>x.id===u.id?{...x,followed:!x.followed}:x))} style={{ paddingHorizontal:12, paddingVertical:7, borderRadius:11, backgroundColor:u.followed?"#dc2626":T.accent }}>
                    <Text style={{ color:u.followed?"#fff":AT, fontSize:11, fontWeight:"800" }}>{u.followed?"Seguindo":"+ Seguir"}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {unis.filter(u=>!uSrch||u.name.toLowerCase().includes(uSrch.toLowerCase())||u.fullName.toLowerCase().includes(uSrch.toLowerCase())).length===0 && (
                <Text style={{ color:T.muted, textAlign:"center", padding:30, fontSize:13 }}>Nenhuma universidade encontrada.</Text>
              )}
            </ScrollView>
          </>
        )}
        <View style={{ paddingHorizontal:20, paddingBottom:insets.bottom+10, paddingTop:10, backgroundColor:T.bg }}>
          <View style={{ flexDirection:"row", justifyContent:"center", gap:6, marginBottom:12 }}>
            {[1,2,3].map(s=><View key={s} style={{ width:s===step?22:6, height:6, borderRadius:3, backgroundColor:s===step?T.accent:T.border }} />)}
          </View>
          <View style={{ flexDirection:"row", gap:10 }}>
            {step>1 && <TouchableOpacity onPress={()=>hStep(s=>s-1)} style={{ flex:1, padding:14, borderRadius:16, backgroundColor:T.card2, alignItems:"center", borderWidth:1, borderColor:T.border }}><Text style={{ color:T.sub, fontSize:14, fontWeight:"700" }}>← Voltar</Text></TouchableOpacity>}
            <TouchableOpacity disabled={!canNext} onPress={async()=>{
              if(step<3){hStep(step+1);}
              else{
                hDone(true);
                if(currentUser){ try{ await setDoc(doc(db,"usuarios",currentUser.uid),{done:true,uTypeId:uType?.id,c1,c2,followedUnis:unis.filter(u=>u.followed).map(u=>u.name),updatedAt:new Date().toISOString()},{merge:true}); }catch{} }
              }
            }} style={{ flex:2, padding:14, borderRadius:16, backgroundColor:canNext?T.accent:T.border, alignItems:"center" }}>
              <Text style={{ color:canNext?AT:T.muted, fontSize:15, fontWeight:"800" }}>{step===3?"Entrar no app 🚀":"Continuar →"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── MAIN APP ──
  const SBar = () => (
    <View style={{ backgroundColor:T.bg, paddingHorizontal:20, paddingTop:insets.top+4, paddingBottom:8, flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
      <Text style={{ fontSize:22, fontWeight:"800", color:T.text }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
      {tab==="perfil" && (
        <TouchableOpacity onPress={()=>setMcfg(true)} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, borderWidth:1, borderColor:T.border, alignItems:"center", justifyContent:"center" }}>
          <Text style={{ color:T.sub, fontSize:13, fontWeight:"800" }}>⚙️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const BNav = () => (
    <View style={{ backgroundColor:T.nav, borderTopWidth:1, borderColor:T.border, paddingBottom:insets.bottom, flexDirection:"row" }}>
      {[{id:"feed",ic:"🏠",l:"Feed"},{id:"explorar",ic:"🔍",l:"Explorar"},{id:"notas",ic:"📊",l:"Notas"},{id:"perfil",ic:"👤",l:"Perfil"}].map(t=>(
        <TouchableOpacity key={t.id} onPress={()=>{setTab(t.id);setSU(null);}} style={{ flex:1, alignItems:"center", paddingVertical:8, backgroundColor:tab===t.id?T.acBg:"transparent" }}>
          <Text style={{ fontSize:20 }}>{getIcon("tab_"+t.id,t.ic)}</Text>
          <Text style={{ fontSize:10, fontWeight:tab===t.id?"800":"500", color:tab===t.id?T.accent:T.muted }}>{t.l}</Text>
        </TouchableOpacity>
      ))}
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
          <Text style={{ color:"rgba(255,255,255,.65)", fontSize:11 }}>👥 <Text style={{ color:"#fff", fontWeight:"800" }}>{selUni.followers}</Text> seguidores</Text>
        </View>
      </View>
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
    <ScrollView style={{ flex:1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal:20, paddingVertical:8 }}>
        {fol.map(u=>(
          <TouchableOpacity key={u.id} onPress={()=>setSU(u)} style={{ alignItems:"center", marginRight:12 }}>
            <View style={{ width:54, height:54, borderRadius:27, backgroundColor:u.color, alignItems:"center", justifyContent:"center", borderWidth:2.5, borderColor:T.accent }}>
              <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
            </View>
            <Text style={{ color:T.sub, fontSize:10, fontWeight:"600", marginTop:4 }}>{u.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={()=>setTab("explorar")} style={{ alignItems:"center" }}>
          <View style={{ width:54, height:54, borderRadius:27, backgroundColor:T.card2, alignItems:"center", justifyContent:"center", borderWidth:2, borderColor:T.border, borderStyle:"dashed" }}>
            <Text style={{ color:T.sub, fontSize:24 }}>+</Text>
          </View>
          <Text style={{ color:T.sub, fontSize:10, fontWeight:"600", marginTop:4 }}>Seguir</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={{ height:1, backgroundColor:T.border, marginBottom:8 }} />
      <View style={{ paddingHorizontal:16, paddingBottom:16, gap:12 }}>
        {feedItems.map(item=>{
          const tc=TG[item.type]||TG.news; const isL=liked[item.id]; const isS=saved[item.id];
          const ui=unis.find(u=>u.id===item.uniId);
          return (
            <View key={item.id} style={cd({ overflow:"hidden" })}>
              <View style={{ flexDirection:"row", alignItems:"center", gap:10, padding:14, paddingBottom:10 }}>
                <View style={{ width:36, height:36, borderRadius:18, backgroundColor:ui?.color||T.card2, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontSize:11, fontWeight:"800" }}>{ui?.name?.slice(0,2)||""}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"700" }}>{item.uni}</Text>
                  <Text style={{ color:T.muted, fontSize:11 }}>{item.time}</Text>
                </View>
                <View style={{ backgroundColor:tc.bg, paddingHorizontal:9, paddingVertical:3, borderRadius:20, borderWidth:1, borderColor:tc.b }}>
                  <Text style={{ color:tc.tx, fontSize:10, fontWeight:"700" }}>{item.icon} {item.tag}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal:16, paddingBottom:12 }}>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"700", marginBottom:5, lineHeight:18 }}>{item.title}</Text>
                <Text style={{ color:T.sub, fontSize:12, lineHeight:20 }}>{item.body}</Text>
              </View>
              <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingBottom:13, paddingTop:9, borderTopWidth:1, borderColor:T.border }}>
                <TouchableOpacity onPress={()=>{
                  if(!currentUser){Alert.alert("Atenção","Faça login para curtir");return;}
                  const newLiked=!liked[item.id];
                  setLiked(p=>({...p,[item.id]:newLiked}));
                  setPosts(prev=>prev.map(p=>p.id===item.id?{...p,likesCount:(p.likesCount||p.likes||0)+(newLiked?1:-1)}:p));
                  (async()=>{
                    try{
                      const postRef=doc(db,"posts",item.id); const lkRef=doc(db,"posts",item.id,"likes",currentUser.uid);
                      if(newLiked){await setDoc(lkRef,{timestamp:serverTimestamp()});await updateDoc(postRef,{likesCount:increment(1)});}
                      else{await deleteDoc(lkRef);await updateDoc(postRef,{likesCount:increment(-1)});}
                    }catch{}
                  })();
                }} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4, marginRight:2 }}>
                  <Text style={{ fontSize:14, marginRight:4 }}>{isL?"❤️":"🤍"}</Text>
                  <Text style={{ color:isL?"#f87171":T.muted, fontSize:11, fontWeight:"600" }}>{(item.likesCount||item.likes||0).toLocaleString("pt-BR")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setMshr(item)} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4, marginRight:2 }}>
                  <Text style={{ fontSize:14, marginRight:4 }}>📤</Text>
                  <Text style={{ color:T.muted, fontSize:11, fontWeight:"600" }}>{(item.sharesCount||0).toLocaleString("pt-BR")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>Alert.alert("Reportar","Deseja reportar esta publicação?\n\nNosso time irá analisar.",[{text:"Cancelar",style:"cancel"},{text:"Reportar",style:"destructive",onPress:()=>Alert.alert("Obrigado!","Report enviado para análise.")}])} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4 }}>
                  <Text style={{ fontSize:14, marginRight:4 }}>🚩</Text>
                  <Text style={{ color:T.muted, fontSize:11, fontWeight:"600" }}>Reportar</Text>
                </TouchableOpacity>
                <View style={{ flex:1 }} />
                <TouchableOpacity onPress={()=>setSaved(p=>({...p,[item.id]:!p[item.id]}))} style={{ paddingHorizontal:4 }}>
                  <Text style={{ fontSize:18 }}>{isS?"🔖":"🏷️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderExplorar = () => (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:16 }} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />}>
      <TouchableOpacity onPress={()=>setMdisc(true)} style={{ backgroundColor:isDark?"#0c1f3a":"#dbeafe", borderRadius:16, padding:14, flexDirection:"row", alignItems:"center", gap:12, marginBottom:12, borderWidth:1, borderColor:isDark?"#1e40af40":"#bfdbfe" }}>
        <Text style={{ fontSize:28 }}>🧭</Text>
        <View style={{ flex:1 }}>
          <Text style={{ color:T.text, fontSize:13, fontWeight:"800" }}>Ainda não sabe qual curso?</Text>
          <Text style={{ color:T.sub, fontSize:11 }}>Explore por área, nota de corte e mercado</Text>
        </View>
        <Text style={{ color:T.accent, fontWeight:"800", fontSize:18 }}>›</Text>
      </TouchableOpacity>
      <SBox val={query} set={setQuery} ph="Buscar universidade…" T={T} />
      <View style={{ height:10 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
        {["Todos","SP","RJ","MG","RS","Técnico"].map(s=>(
          <TouchableOpacity key={s} onPress={()=>setFSt(s)} style={{ paddingHorizontal:13, paddingVertical:7, borderRadius:20, backgroundColor:fSt===s?T.accent:T.card2, marginRight:7, borderWidth:1, borderColor:fSt===s?T.accent:T.border }}>
            <Text style={{ color:fSt===s?AT:T.sub, fontSize:12, fontWeight:"700" }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ gap:9 }}>
        {filtU.map(u=>(
          <TouchableOpacity key={u.id} onPress={()=>setSU(u)} style={{ ...cd(), flexDirection:"row", alignItems:"center", gap:12, padding:15 }}>
            <View style={{ width:50, height:50, borderRadius:25, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:T.text, fontSize:15, fontWeight:"800" }}>{u.name}</Text>
              <Text style={{ color:T.sub, fontSize:11 }} numberOfLines={1}>{u.fullName}</Text>
              <View style={{ flexDirection:"row", gap:5, marginTop:5 }}>
                {[u.state,u.type].map(x=><View key={x} style={{ backgroundColor:T.card2, borderRadius:8, paddingHorizontal:7, paddingVertical:2 }}><Text style={{ color:T.muted, fontSize:9, fontWeight:"600" }}>{x}</Text></View>)}
                <Text style={{ color:T.sub, fontSize:10 }}>👥 {u.followers}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={()=>toggleFollow(u,!u.followed)} style={{ paddingHorizontal:12, paddingVertical:7, borderRadius:11, backgroundColor:u.followed?"#C62828":T.accent }}>
              <Text style={{ color:u.followed?"#fff":AT, fontSize:11, fontWeight:"800" }}>{u.followed?"Deixar de seguir":"+ Seguir"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {filtU.length===0 && <Text style={{ color:T.muted, textAlign:"center", padding:40, fontSize:13 }}>Nenhuma universidade encontrada.</Text>}
      </View>
    </ScrollView>
  );

  const renderNotas = () => (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:24 }} keyboardShouldPersistTaps="handled">
      <Text style={[lbl,{marginBottom:8}]}>📊 Notas de Corte</Text>
      <View style={{ ...cd(), padding:10, marginBottom:8, flexDirection:"row", alignItems:"center" }}>
        <Text style={{ color:T.accent, fontSize:12, marginRight:8 }}>🎯</Text>
        <Text style={{ color:T.text, fontSize:12, fontWeight:"700" }}>{c1||"Nenhum curso selecionado"}</Text>
        {!!c2 && <Text style={{ color:T.sub, fontSize:11, marginLeft:6 }}>· {c2} (2ª)</Text>}
        <TouchableOpacity onPress={()=>setTab("perfil")} style={{ marginLeft:"auto" }}><Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>editar</Text></TouchableOpacity>
      </View>
      <SBox val={nSrch} set={setNsrch} ph="Buscar outro curso ou universidade…" T={T} />
      <View style={{ height:10 }} />
      <View style={{ gap:8, marginBottom:20 }}>
        {filtN.map((n,i)=>(
          <View key={i} style={cd({ padding:14 })}>
            <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
              <View style={{ width:42, height:42, borderRadius:21, backgroundColor:n.cor, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:"#fff", fontSize:9, fontWeight:"800" }}>{n.uni.split(" ")[0]}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:13, fontWeight:"800" }}>{n.curso}</Text>
                <Text style={{ color:T.sub, fontSize:11 }}>{n.uni}</Text>
              </View>
              <View style={{ alignItems:"flex-end" }}>
                <Text style={{ color:T.accent, fontSize:20, fontWeight:"800" }}>{n.nota}</Text>
                <Text style={{ color:T.muted, fontSize:9 }}>nota corte</Text>
              </View>
            </View>
            <View style={{ marginTop:10, backgroundColor:T.card2, borderRadius:6, height:5 }}>
              <View style={{ width:n.nota+"%", height:"100%", backgroundColor:T.accent, borderRadius:6 }} />
            </View>
            <View style={{ flexDirection:"row", justifyContent:"space-between", marginTop:4 }}>
              <Text style={{ color:T.muted, fontSize:9 }}>{n.vagas} vagas</Text>
              <TouchableOpacity onPress={()=>Linking.openURL(n.site)}><Text style={{ color:T.accent, fontSize:10, fontWeight:"700" }}>Site oficial ↗</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        {filtN.length===0 && <Text style={{ color:T.muted, textAlign:"center", padding:20, fontSize:13 }}>Nenhum resultado.</Text>}
      </View>
      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <Text style={lbl}>📈 Minhas Notas</Text>
        <TouchableOpacity onPress={()=>setMgr(true)} style={{ paddingHorizontal:14, paddingVertical:6, borderRadius:10, backgroundColor:T.accent }}>
          <Text style={{ color:AT, fontSize:12, fontWeight:"800" }}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>
      {gs.length===0 ? (
        <View style={{ ...cd(), padding:24, alignItems:"center" }}>
          <Text style={{ fontSize:32, marginBottom:10 }}>📝</Text>
          <Text style={{ color:T.text, fontSize:14, fontWeight:"700", marginBottom:4 }}>Nenhuma nota ainda</Text>
          <Text style={{ color:T.sub, fontSize:12, textAlign:"center" }}>Adicione notas de simulados para ver gráficos e análises.</Text>
        </View>
      ) : (
        <>
          {weak && (
            <View style={{ backgroundColor:isDark?"#2a1800":"#fff7ed", borderRadius:14, padding:12, borderWidth:1, borderColor:isDark?"#78350f":"#fed7aa", marginBottom:12, flexDirection:"row", alignItems:"center", gap:10 }}>
              <Text style={{ fontSize:18 }}>⚠️</Text>
              <View>
                <Text style={{ color:"#f59e0b", fontSize:11, fontWeight:"800" }}>Área para melhorar</Text>
                <Text style={{ color:isDark?"#fbbf24":"#c2410c", fontSize:13, fontWeight:"700" }}>{weak.subject} — {weak.v} pts</Text>
              </View>
            </View>
          )}
          <View style={cd({ padding:16, marginBottom:12 })}>
            <Text style={{ color:T.sub, fontSize:11, fontWeight:"700", marginBottom:10 }}>Evolução por área</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{ labels: bars.map(b=>b.name), datasets: [{ data: bars.length > 0 ? [1] : [0] }] }}
                width={Dimensions.get("window").width - 64}
                height={148}
                chartConfig={{
                  ...chartConfig,
                  barColors: ["#60a5fa", "#f87171", "#4ade80", "#fbbf24"],
                }}
                verticalLabelRotation={0}
                xAxisLabel=""
                yAxisSuffix=""
                style={{ marginLeft: -16 }}
                fromZero
                showValuesOnTopOfBars
              />
            </ScrollView>
          </View>
          <View style={cd({ padding:16, marginBottom:12 })}>
            <Text style={{ color:T.sub, fontSize:11, fontWeight:"700", marginBottom:6 }}>Perfil da última prova</Text>
            <View style={{ flexDirection:"row", gap:14, marginBottom:6 }}>
              <Text style={{ fontSize:10, color:"#22c55e", fontWeight:"700" }}>🟢 Meta {c1} ({tgt} pts)</Text>
              <Text style={{ fontSize:10, color:"#60a5fa", fontWeight:"700" }}>🔵 Você</Text>
            </View>
            <View style={{ flexDirection:"row", flexWrap:"wrap", justifyContent:"space-between", marginTop:8 }}>
              {radar.map((r,i)=>(
                <View key={i} style={{ width:"48%", marginBottom:12, alignItems:"center" }}>
                  <View style={{ width:60, height:60, borderRadius:30, borderWidth:3, borderColor:T.border, alignItems:"center", justifyContent:"center", position:"relative" }}>
                    <View style={{ position:"absolute", width:60, height:60, borderRadius:30, borderWidth:1, borderColor:"#60a5fa40" }} />
                    <View style={{ position:"absolute", width:40, height:40, borderRadius:20, borderWidth:1, borderColor:"#60a5fa40" }} />
                    <Text style={{ color:T.text, fontSize:11, fontWeight:"800" }}>{r.v}</Text>
                  </View>
                  <Text style={{ color:T.muted, fontSize:10, marginTop:4 }}>{r.subject}</Text>
                  <Text style={{ color:"#60a5fa", fontSize:10 }}>Você</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={cd({ padding:14 })}>
            <Text style={{ color:T.sub, fontSize:11, fontWeight:"700", marginBottom:10 }}>Histórico</Text>
            {gs.map((g,i)=>(
              <View key={g.id} style={{ flexDirection:"row", alignItems:"center", gap:10, paddingVertical:9, borderBottomWidth:i<gs.length-1?1:0, borderColor:T.border }}>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"700" }}>{g.ex}</Text>
                  <Text style={{ color:T.muted, fontSize:10 }}>{g.dt} · L{g.s.l} H{g.s.h} N{g.s.n} M{g.s.m} R{g.s.r}</Text>
                </View>
                <View style={{ alignItems:"flex-end", marginRight:6 }}>
                  <Text style={{ color:T.accent, fontSize:15, fontWeight:"800" }}>{avg(g)}</Text>
                  <Text style={{ color:T.muted, fontSize:9 }}>média</Text>
                </View>
                <TouchableOpacity onPress={()=>setGs(gs.filter(x=>x.id!==g.id))}><Text style={{ color:"#f87171", fontSize:14 }}>✕</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderPerfil = () => (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:24 }}>
      <View style={{ ...cd(), padding:22, alignItems:"center", marginBottom:12 }}>
        <TouchableOpacity onPress={()=>{setTmpAv(av);setTmpBgIdx(avBgIdx);setMpho(true);}} style={{ width:72, height:72, borderRadius:36, backgroundColor:AVATAR_COLORS[avBgIdx][0], alignItems:"center", justifyContent:"center", marginBottom:4, borderWidth:3, borderColor:T.accent+"40" }}>
          <Text style={{ fontSize:30 }}>{av}</Text>
        </TouchableOpacity>
        <Text style={{ color:T.muted, fontSize:10, marginBottom:10 }}>Toque para alterar foto</Text>
        <Text style={{ color:T.text, fontSize:17, fontWeight:"800" }}>{currentUser?.email?.split("@")[0]||"Usuário"}</Text>
        <View style={{ flexDirection:"row", alignItems:"center", gap:6, marginTop:4, marginBottom:10 }}>
          <Text>{uType?.emoji}</Text>
          <Text style={{ color:T.sub, fontSize:12 }}>{uType?.label}</Text>
        </View>
        <View style={{ flexDirection:"row", gap:8, marginBottom:14, flexWrap:"wrap", justifyContent:"center" }}>
          {!!c1 && <View style={{ backgroundColor:T.acBg, paddingHorizontal:12, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:T.accent+"40" }}><Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>1ª {c1}</Text></View>}
          {!!c2 && <View style={{ backgroundColor:T.card2, paddingHorizontal:12, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:T.border }}><Text style={{ color:T.sub, fontSize:11, fontWeight:"700" }}>2ª {c2}</Text></View>}
        </View>
        <View style={{ flexDirection:"row", justifyContent:"center", gap:28 }}>
          {[{v:fol.length,l:"seguindo"},{v:gs.length,l:"provas"},{v:Object.values(saved).filter(Boolean).length,l:"salvos"}].map(({v,l})=>(
            <View key={l} style={{ alignItems:"center" }}>
              <Text style={{ color:T.accent, fontSize:19, fontWeight:"800" }}>{v}</Text>
              <Text style={{ color:T.muted, fontSize:10 }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor:isDark?"#0a1f0d":"#f0fdf4", borderRadius:16, padding:14, borderWidth:1, borderColor:T.accent+"30", marginBottom:12 }}>
        <Text style={[lbl,{color:T.accent,marginBottom:8}]}>🎯 Meu Objetivo</Text>
        <Text style={{ color:T.text, fontSize:14, fontWeight:"700" }}>{c1||"Sem curso definido"}</Text>
        {!!c1 && <Text style={{ color:T.sub, fontSize:12, marginBottom:c2?4:10 }}>Nota de corte: {tgt}</Text>}
        {!!c2 && <Text style={{ color:T.sub, fontSize:12, marginBottom:10 }}>2ª opção: {c2}</Text>}
        {last ? (
          <>
            <View style={{ flexDirection:"row", justifyContent:"space-between", marginBottom:5 }}>
              <Text style={{ color:T.muted, fontSize:11 }}>Última média: {avg(last)}</Text>
              <Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>{Math.round(avg(last)/tgt*100)}% da meta</Text>
            </View>
            <View style={{ backgroundColor:T.card2, borderRadius:6, height:6 }}>
              <View style={{ width:Math.min(100,Math.round(avg(last)/tgt*100))+"%", height:"100%", backgroundColor:T.accent, borderRadius:6 }} />
            </View>
          </>
        ) : (
          <TouchableOpacity onPress={()=>setTab("notas")} style={{ padding:9, borderRadius:12, backgroundColor:T.acBg, alignItems:"center", borderWidth:1, borderColor:T.accent+"40" }}>
            <Text style={{ color:T.accent, fontSize:12, fontWeight:"700" }}>+ Adicionar minhas notas</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ ...cd(), padding:15, marginBottom:12 }}>
        <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <Text style={lbl}>🏛️ Universidades que sigo</Text>
          {fol.length>0 && <TouchableOpacity onPress={()=>setMUni(true)} style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:8, backgroundColor:T.card2, borderWidth:1, borderColor:T.border }}><Text style={{ color:T.sub, fontSize:10, fontWeight:"700" }}>⚙️</Text></TouchableOpacity>}
        </View>
        {fol.length===0 ? (
          <Text style={{ color:T.muted, fontSize:13, textAlign:"center", padding:10 }}>Nenhuma ainda.</Text>
        ) : (
          <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
            {fol.map(u=>(
              <TouchableOpacity key={u.id} onPress={()=>{setSU(u);setTab("explorar");}} style={{ alignItems:"center", gap:3, minWidth:56, padding:8, backgroundColor:T.card2, borderRadius:12, borderWidth:1, borderColor:T.border }}>
                <View style={{ width:40, height:40, borderRadius:20, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontSize:11, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
                </View>
                <Text style={{ color:T.sub, fontSize:9, fontWeight:"600", textAlign:"center" }}>{u.name}</Text>
                <Text style={{ color:T.muted, fontSize:8 }}>{u.prova}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={cd({ padding:15 })}>
        <Text style={[lbl,{marginBottom:12}]}>⏰ Próximos Eventos</Text>
        {EVENTS.map((ev,i)=>(
          <TouchableOpacity key={ev.id} onPress={()=>setMev(ev)} style={{ flexDirection:"row", alignItems:"center", gap:10, paddingVertical:9, borderBottomWidth:i<EVENTS.length-1?1:0, borderColor:T.border }}>
            <View style={{ backgroundColor:ev.cor, borderRadius:10, width:52, height:52, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"rgba(255,255,255,.55)", fontSize:8, fontWeight:"700" }}>{ev.month}</Text>
              <Text style={{ color:"#fff", fontSize:ev.dayLabel==="—"?18:15, fontWeight:"800" }}>{ev.dayLabel}</Text>
              <Text style={{ color:"rgba(255,255,255,.45)", fontSize:8 }}>{ev.year}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:T.text, fontSize:12, fontWeight:"700" }} numberOfLines={1}>{ev.event}</Text>
              <Text style={{ color:T.muted, fontSize:10 }}>{ev.uni}</Text>
            </View>
            <Text style={{ color:T.muted }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={isDark?"light-content":"dark-content"} />
      <SBar />
      <View style={{ paddingHorizontal:20, paddingTop:2, paddingBottom:4 }}>
        {!selUni && <Text style={{ color:T.sub, fontSize:11 }}>{tab==="feed"?"Novidades para você":tab==="explorar"?"Encontre sua universidade":tab==="notas"?"Notas de corte & suas provas":`${uType?.emoji||"👤"} ${uType?.label||"Meu Perfil"}`}</Text>}
      </View>
      {selUni ? renderUniDetail() : (
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
                  setDoc(doc(db,"usuarios",currentUser.uid),{theme:v,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{});
                }
              }} style={{ flex:1, padding:12, borderRadius:12, backgroundColor:theme===v?T.accent:T.card2, alignItems:"center", borderWidth:1, borderColor:theme===v?T.accent:T.border }}>
                <Text style={{ color:theme===v?AT:T.sub, fontSize:12, fontWeight:"700" }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[lbl,{marginBottom:10}]}>Conta</Text>
          {[
            ["📷","Alterar foto de perfil","Ícone e cor",()=>{setTmpAv(av);setTmpBgIdx(avBgIdx);setMcfg(false);setMpho(true);}],
            ["✏️","Editar opções de curso","Altere suas preferências",()=>{setEC1(c1);setEC2(c2);setEpick(1);setEsrch("");setMcfg(false);setMedit(true);}],
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
            {AVATAR_COLORS.map(([c1c,c2c],idx)=>(
              <TouchableOpacity key={idx} onPress={()=>setTmpBgIdx(idx)} style={{ width:52, height:52, borderRadius:26, backgroundColor:c1c, borderWidth:tmpBgIdx===idx?3:1, borderColor:tmpBgIdx===idx?"#fff":c1c+"40" }} />
            ))}
          </View>
          <TouchableOpacity onPress={()=>{
            setAv(tmpAv);
            setAvBgIdx(tmpBgIdx);
            setMpho(false);
            if (currentUser) {
              setDoc(doc(db,"usuarios",currentUser.uid),{av:tmpAv,avBgIdx:tmpBgIdx,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{});
            }
          }} style={{ padding:14, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
            <Text style={{ color:AT, fontSize:15, fontWeight:"800" }}>Salvar</Text>
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
            {!!eC2 && <TouchableOpacity onPress={()=>setEC2("")}><Text style={{ color:"#f87171", fontSize:11, fontWeight:"700", paddingVertical:6 }}>✕ remover</Text></TouchableOpacity>}
          </View>
          <SBox val={eSrch} set={setEsrch} ph="Buscar curso…" T={T} />
          <ScrollView style={{ maxHeight:280, marginTop:10 }} keyboardShouldPersistTaps="handled">
            {(fbCourses.length?fbCourses:ALL_COURSES).filter(cc=>cc.toLowerCase().includes(eSrch.toLowerCase())).map(cc=>{
              const s1=eC1===cc,s2=eC2===cc;
              return (
                <TouchableOpacity key={cc} onPress={()=>{ if(ePick===1){setEC1(cc);setEpick(2);}else{setEC2(cc);} }} style={{ flexDirection:"row", justifyContent:"space-between", padding:12, borderRadius:14, backgroundColor:(s1||s2)?T.acBg:T.card2, marginBottom:6 }}>
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
            <Text style={[lbl,{marginBottom:10}]}>Notas por área</Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginBottom:18 }}>
              {[["l","Linguagens","0–100"],["h","Humanas","0–100"],["n","Natureza","0–100"],["m","Matemática","0–100"],["r","Redação","0–1000"]].map(([k,l,ph])=>(
                <View key={k} style={{ width:k==="r"?"100%":"48%" }}>
                  <Text style={{ color:T.muted, fontSize:10, fontWeight:"700", marginBottom:4 }}>{l}</Text>
                  <TextInput value={ng[k]} onChangeText={v=>setNg({...ng,[k]:v})} placeholder={ph} placeholderTextColor={T.muted} keyboardType="numeric" style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:T.inpB, backgroundColor:T.inp, color:T.text, fontSize:14 }} />
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={()=>{ if(!ng.ex.trim())return; setGs([...gs,{id:Date.now(),ex:ng.ex,dt:ng.dt||"2025",s:{l:+ng.l||0,h:+ng.h||0,n:+ng.n||0,m:+ng.m||0,r:+ng.r||0}}]); setNg({ex:"",dt:"",l:"",h:"",n:"",m:"",r:""}); setMgr(false); }} disabled={!ng.ex.trim()} style={{ padding:14, borderRadius:16, backgroundColor:ng.ex.trim()?T.accent:T.border, alignItems:"center" }}>
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
          <Text style={{ color:T.text, fontSize:17, fontWeight:"800", marginBottom:4 }}>⚙️ Ordenar universidades</Text>
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
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}
