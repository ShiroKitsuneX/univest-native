import { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, Alert, Appearance, Linking, Platform, StatusBar,
  KeyboardAvoidingView, Dimensions, ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "./src/firebase/config";
import {
  collection, getDocs, doc, setDoc, getDoc, deleteDoc,
  updateDoc, increment, addDoc, serverTimestamp, arrayUnion, arrayRemove,
} from "firebase/firestore";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail,
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
  { id:"1",  name:"USP",     fullName:"Universidade de São Paulo",             city:"São Paulo",       state:"SP", color:"#003366", followers:"142k", type:"Estadual", description:"A maior universidade da América Latina, referência em pesquisa e inovação.",  courses:["Medicina","Direito","Engenharia Civil","Arquitetura","Psicologia"],     vestibular:"FUVEST 2026",        inscricao:"Ago–Set/2025", prova:"Jan/2026", site:"https://fuvest.br",          followed:false, books:["Dom Casmurro - Machado de Assis","Vidas Secas - Graciliano Ramos","Memórias Póstulas de Brás Cubas - Machado de Assis","O Cortiço - Aluísio Azevedo","Quarto de Despejo - Carolina Maria de Jesus","A Hora da Estrela - Clarice Lispector","O Mundo de Sofia - Jostein Gaarden","Auto da Compadecida - Ariano Suassuna"],
    exams:[
      {id:"e1",year:2026,phase:"1ª fase",subject:"Prova Comum",date:"2026-01-12",status:"upcoming",pdfUrl:"",sourceUrl:"https://fuvest.br",description:"Primeira fase - 90 questões de múltipla escolha",duration:"5h",questions:90},
      {id:"e2",year:2026,phase:"2ª fase",subject:"Prova de Português",date:"2026-01-19",status:"upcoming",pdfUrl:"",sourceUrl:"https://fuvest.br",description:"Redação + Questões de Português",duration:"4h",questions:60},
      {id:"e3",year:2025,phase:"1ª fase",subject:"Prova Comum",date:"2025-01-12",status:"past",pdfUrl:"https://fuvest.br/2025/fase1.pdf",sourceUrl:"https://fuvest.br/provas/2025",description:"Primeira fase - 90 questões",duration:"5h",questions:90},
      {id:"e4",year:2025,phase:"2ª fase",subject:"Prova de Português",date:"2025-01-19",status:"past",pdfUrl:"https://fuvest.br/2025/fase2.pdf",sourceUrl:"https://fuvest.br/provas/2025",description:"Redação + Português",duration:"4h",questions:60},
      {id:"e5",year:2025,phase:"3ª fase",subject:"Provas Específicas",date:"2025-01-22",status:"past",pdfUrl:"https://fuvest.br/2025/fase3.pdf",sourceUrl:"https://fuvest.br/provas/2025",description:"Provas por curso",duration:"4h",questions:30},
      {id:"e6",year:2024,phase:"1ª fase",subject:"Prova Comum",date:"2024-01-14",status:"past",pdfUrl:"https://fuvest.br/2024/fase1.pdf",sourceUrl:"https://fuvest.br/provas/2024",description:"Primeira fase - 90 questões",duration:"5h",questions:90},
    ]},
  { id:"2",  name:"UNICAMP", fullName:"Universidade Estadual de Campinas",     city:"Campinas",        state:"SP", color:"#004d2c", followers:"98k",  type:"Estadual", description:"Excelência em ciência, tecnologia e inovação no interior Paulista.",       courses:["Medicina","Engenharia de Computação","Ciências da Computação","Física"], vestibular:"COMVEST 2026",       inscricao:"Ago/2025",     prova:"Dez/2025", site:"https://comvest.unicamp.br", followed:false, books:["Mrs. Dalloway - Virginia Woolf","A Metamorfose - Franz Kafka","A Piada Mortal - Milan Kundera","O Poço - José Saramago","O Inspetor Geral - Nikolai Gogol","Os Lusíadas - Luís de Camões","A Arte da Guerra - Sun Tzu","A República - Platão"],
    exams:[
      {id:"e1",year:2026,phase:"1ª fase",subject:"Prova Comum",date:"2026-11-16",status:"upcoming",pdfUrl:"",sourceUrl:"https://comvest.unicamp.br",description:"Primeira fase - 72 questões",duration:"4h",questions:72},
      {id:"e2",year:2025,phase:"1ª fase",subject:"Prova Comum",date:"2025-11-17",status:"past",pdfUrl:"https://comvest.unicamp.br/2025/fase1.pdf",sourceUrl:"https://comvest.unicamp.br/provas",description:"72 questões de múltipla escolha",duration:"4h",questions:72},
      {id:"e3",year:2024,phase:"1ª fase",subject:"Prova Comum",date:"2024-11-17",status:"past",pdfUrl:"https://comvest.unicamp.br/2024/fase1.pdf",sourceUrl:"https://comvest.unicamp.br/provas",description:"72 questões",duration:"4h",questions:72},
    ]},
  { id:"3",  name:"UNESP",   fullName:"Universidade Estadual Paulista",        city:"São Paulo",       state:"SP", color:"#8B0000", followers:"76k",  type:"Estadual", description:"Presente em todo SP com campi em 24 cidades.",                            courses:["Medicina","Odontologia","Veterinária","Agronomia","Direito"],          vestibular:"VUNESP 2026",        inscricao:"Set/2025",     prova:"Jan/2026", site:"https://vunesp.com.br",       followed:false, books:["O Alienista - Machado de Assis","Sagarana - João Guimarães Rosa","Tereza de Ângelos - Rachel de Queiroz","A Barca dos Am排除dos - Gil Vicente","Os Meninos da Rua Larga - Emilio Salgari","Mayombe - Pepetela","O Seminarista - Bernardo Élis","O Tempo e o Vento - Érico Veríssimo"],
    exams:[
      {id:"e1",year:2026,phase:"1ª fase",subject:"Prova Objetiva",date:"2026-10-05",status:"upcoming",pdfUrl:"",sourceUrl:"https://vunesp.com.br",description:"100 questões de múltipla escolha",duration:"5h",questions:100},
      {id:"e2",year:2025,phase:"1ª fase",subject:"Prova Objetiva",date:"2025-10-05",status:"past",pdfUrl:"https://vunesp.com.br/2025/fase1.pdf",sourceUrl:"https://vunesp.com.br/provas",description:"100 questões",duration:"5h",questions:100},
    ]},
  { id:"4",  name:"UNIFESP", fullName:"Universidade Federal de São Paulo",     city:"São Paulo",       state:"SP", color:"#4B0082", followers:"54k",  type:"Federal",  description:"Referência nacional em saúde, com cursos de medicina de alto nível.",     courses:["Medicina","Enfermagem","Farmácia","Biomedicina"],                      vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://unifesp.br",          followed:false, books:[], exams:[] },
  { id:"5",  name:"UFMG",    fullName:"Universidade Federal de Minas Gerais",  city:"Belo Horizonte",  state:"MG", color:"#1a3a5c", followers:"89k",  type:"Federal",  description:"Uma das melhores federais do Brasil, destaque em diversas áreas.",        courses:["Medicina","Direito","Arquitetura","Engenharia Civil","Letras"],         vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://ufmg.br",             followed:false, books:["Grande Sertão: Veredas - João Guimarães Rosa","Cem Anos de Solidão - Gabriel García Márquez","O Seminarista - Bernardo Élis","Angústia - Graciliano Ramos","Trezentos Réis - Afonso Arinos"], exams:[] },
  { id:"6",  name:"UFRJ",    fullName:"Universidade Federal do Rio de Janeiro", city:"Rio de Janeiro", state:"RJ", color:"#003580", followers:"110k", type:"Federal",  description:"A maior universidade federal do Brasil, com tradição centenária.",        courses:["Medicina","Engenharia Civil","Arquitetura","Economia"],                vestibular:"ENEM (SISU)",        inscricao:"Nov/2025",     prova:"Nov/2025", site:"https://ufrj.br",             followed:false, books:["O Crime do Padre Amaro - Eça de Queirós","Os Bruzundangas - Lima Barreto","Lição de Coisas - Caio Fernando Abreu","A Noite da Espera - Ferreira Gullar"], exams:[] },
  { id:"7",  name:"COTUCA",  fullName:"Colégio Técnico da UNICAMP",            city:"Campinas",        state:"SP", color:"#1a4a3a", followers:"18k",  type:"Técnico",  description:"Escola técnica de nível médio vinculada à UNICAMP.",                      courses:["Mecânica","Eletrônica","Informática","Edificações"],                   vestibular:"Proc. Seletivo 2026",inscricao:"Out/2025",    prova:"Dez/2025", site:"https://cotuca.unicamp.br",   followed:false, books:[], exams:[] },
  { id:"8",  name:"ETEC",    fullName:"Escola Técnica Estadual de SP",         city:"São Paulo",       state:"SP", color:"#2d4a7a", followers:"32k",  type:"Técnico",  description:"Rede de escolas técnicas estaduais com cursos gratuitos.",               courses:["Administração","Informática","Enfermagem","Logística"],                vestibular:"Vestibulinho 2026",  inscricao:"Set/2025",     prova:"Nov/2025", site:"https://etec.sp.gov.br",      followed:false, books:[], exams:[] },
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

const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const ms = typeof timestamp === "number" ? timestamp : timestamp?.toMillis?.() || timestamp?.seconds ? timestamp.seconds*1000 : new Date(timestamp).getTime();
  if (!ms || isNaN(ms)) return "";
  const diff = now - ms;
  const mins = Math.floor(diff/60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs/24);
  if (days < 2) return `${days}d atrás`;
  const d = new Date(ms);
  const pad = n => n.toString().padStart(2,"0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtCount = (n) => {
  if (typeof n === "string") return n;
  if (!n || isNaN(n)) return "0";
  if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1000) return (n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,"")+"k";
  return n.toString();
};

const STORAGE_KEY = "univest_user";
const loadLocalUserData = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};
const saveLocalUserData = async (data) => {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
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
  const [mExam, setMexam] = useState(null);
  const [examYear, setExamYear] = useState(null);
  const [showExamsPage, setShowExamsPage] = useState(false);
  const [expandedYears, setExpandedYears] = useState({});
  const [examSearch, setExamSearch] = useState("");
  const [examSort, setExamSort] = useState("newest");
  const [mGr,   setMgr]   = useState(false);
  const [mShr,  setMshr]  = useState(null);
  const [mDisc, setMdisc] = useState(false);
  const [mUni,  setMUni]  = useState(false);
  const [dArea, setDarea] = useState(null);
  const [eC1,   setEC1]   = useState("");
  const [eC2,   setEC2]   = useState("");
  const [ePick, setEpick] = useState(1);
  const [eSrch, setEsrch] = useState("");

  const getIcon = (id, fallback) => fbIcons[id] || fallback;

  const currentData = () => ({
    step, done, uTypeId:uType?.id, c1, c2, theme, av, avBgIdx, 
    grades:gs, saved, liked, followedUnis: unis.filter(u=>u.followed).map(u=>u.name)
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
        if (localData.liked) setLiked(localData.liked);
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const snap = await getDoc(doc(db,"usuarios",user.uid));
          if (snap.exists()) {
            const fbData = snap.data(); 
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
          } else { 
            setStep(1); setDone(false);
          }
        } catch (e) { console.log("Error loading user data:", e.message); }
      } else { setCurrentUser(null); setUserData(null); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [unisSnap, coursesSnap, iconsSnap] = await Promise.all([getDocs(collection(db,"universidades")),getDocs(collection(db,"cursos")),getDocs(collection(db,"icones"))]);
        if (!unisSnap.empty) { 
          const f=unisSnap.docs.map(d=>({id:d.id,...d.data()})); 
          const u=[...new Map(f.map(u=>[u.name,u])).values()];
          const withBooksAndExams = u.map(fbU => {
            const localU = UNIVERSITIES.find(lU => lU.name === fbU.name);
            return localU ? { ...fbU, books: localU.books || [], exams: localU.exams || [] } : fbU;
          });
          setFbUnis(withBooksAndExams); setUnis(withBooksAndExams); 
        }
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
        // Batch all like checks in parallel instead of sequential N+1
        if (currentUser && f.length) {
          const likeChecks = await Promise.all(
            f.map(p => getDoc(doc(db,"posts",p.id,"likes",currentUser.uid)))
          );
          const lk={};
          likeChecks.forEach((snap,i) => { if(snap.exists()) lk[f[i].id]=true; });
          setLiked(lk);
        }
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
      if (!unisSnap.empty) { 
        const f=unisSnap.docs.map(d=>({id:d.id,...d.data()})); 
        const u=[...new Map(f.map(u=>[u.name,u])).values()];
        const withBooksAndExams = u.map(fbU => {
          const localU = UNIVERSITIES.find(lU => lU.name === fbU.name);
          return localU ? { ...fbU, books: localU.books || [], exams: localU.exams || [] } : fbU;
        });
        setFbUnis(withBooksAndExams); 
      }
      if (!postsSnap.empty) {
        const f=postsSnap.docs.map(d=>({id:d.id,...d.data()}));
        f.sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
        setPosts(f);
        // Refresh like state
        if (currentUser && f.length) {
          const likeChecks = await Promise.all(
            f.map(p => getDoc(doc(db,"posts",p.id,"likes",currentUser.uid)))
          );
          const lk={};
          likeChecks.forEach((snap,i) => { if(snap.exists()) lk[f[i].id]=true; });
          setLiked(lk);
        }
      }
    } catch {}
    setRefreshing(false);
  }, [currentUser]);

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
      await setDoc(doc(db,"usuarios",cred.user.uid),{email:cred.user.email,tipo:"usuario",done:false,followedUnis:[],updatedAt:new Date().toISOString()});
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
    saveLocalUserData(currentData());
    try {
      const userRef=doc(db,"usuarios",currentUser.uid);
      await updateDoc(userRef,{
        followedUnis: isFollowing ? arrayUnion(uni.name) : arrayRemove(uni.name),
        updatedAt: new Date().toISOString(),
      });
      const uniRef=doc(db,"universidades",uni.id);
      await updateDoc(uniRef,{followersCount:increment(isFollowing?1:-1)}).catch(()=>{});
    } catch(err){
      setUnis(prev=>prev.map(u=>u.name===uni.name?{...u,followed:!isFollowing,followersCount:(u.followersCount||0)+(isFollowing?-1:1)}:u));
      if(selUni?.name===uni.name) setSU(p=>({...p,followed:!isFollowing}));
      Alert.alert("Erro","Não foi possível seguir.");
    }
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
  if (!currentUser) {
    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <StatusBar barStyle={isDark?"light-content":"dark-content"} />
        <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:"center", padding:28, paddingTop:insets.top+28, paddingBottom:insets.bottom+28 }}>
          <Text style={{ fontSize:64, textAlign:"center", marginBottom:14 }}>🎓</Text>
          <Text style={{ fontSize:34, fontWeight:"800", color:T.text, textAlign:"center", marginBottom:8 }}>Uni<Text style={{ color:T.accent }}>Vest</Text></Text>
          <Text style={{ color:T.sub, fontSize:14, textAlign:"center", lineHeight:24, marginBottom:32 }}>Seu portal inteligente para toda a jornada acadêmica</Text>
          <View style={{ gap:10, marginBottom:32 }}>
            {[["vestibular","🎯","Vestibulares & ENEM","#e11d48"],["graduacao","🎓","Graduação & Pós-graduação","#7c3aed"],["mestrado","🔬","Mestrado & Doutorado","#2563eb"],["tecnico","📚","Ensino Médio & Técnico","#059669"]].map(([id,ic,l,cor])=>(
              <View key={id} style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.card, borderRadius:16, padding:14, borderWidth:1, borderColor:T.border, gap:14 }}>
                <View style={{ width:44, height:44, borderRadius:22, backgroundColor:cor+"22", alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ fontSize:22 }}>{getIcon(id,ic)}</Text>
                </View>
                <Text style={{ color:T.text, fontSize:14, fontWeight:"600", flex:1 }}>{l}</Text>
                <Text style={{ color:T.muted, fontSize:18 }}>›</Text>
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
                {(!!c1 || !!c2) && <TouchableOpacity onPress={()=>{hC1("");hC2("");setPick(1);}} style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:16, backgroundColor:"#f8717130", borderWidth:1, borderColor:"#f87171" }}>
                  <Text style={{ color:"#f87171", fontSize:11, fontWeight:"700" }}>Limpar</Text>
                </TouchableOpacity>}
              </View>
              <SBox val={cSrch} set={setCsrch} ph="Buscar curso…" T={T} />
            </View>
            <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:100 }} keyboardShouldPersistTaps="handled">
              {fC.map(cc=>{ const s1=c1===cc,s2=c2===cc; return (
                <TouchableOpacity key={cc} onPress={()=>{
                  if(s1){hC1("");setPick(1);}
                  else if(s2){hC2("");}
                  else if(picking===1){hC1(cc);hC2(s2?"":c2);setPick(2);}
                  else{hC2(cc);}
                  if(!c1&&!c2){setPick(1);}
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
          <View style={{ height:3, backgroundColor:T.border, borderRadius:2, marginBottom:14, overflow:"hidden" }}>
            <View style={{ width:((step/3)*100)+"%", height:"100%", backgroundColor:T.accent, borderRadius:2 }} />
          </View>
          <View style={{ flexDirection:"row", gap:10 }}>
            {step>1 && <TouchableOpacity onPress={()=>hStep(s=>s-1)} style={{ flex:1, padding:14, borderRadius:16, backgroundColor:T.card2, alignItems:"center", borderWidth:1, borderColor:T.border }}><Text style={{ color:T.sub, fontSize:14, fontWeight:"700" }}>← Voltar</Text></TouchableOpacity>}
            <TouchableOpacity disabled={!canNext} onPress={async()=>{
              if(step<3){hStep(step+1);}
              else{
                hDone(true);
                if(currentUser){ 
                  try{ 
                    const dataToSave = {done:true,uTypeId:uType?.id,c1,c2,followedUnis:unis.filter(u=>u.followed).map(u=>u.name),updatedAt:new Date().toISOString()};
                    console.log("Saving onboarding data:", JSON.stringify(dataToSave));
                    await setDoc(doc(db,"usuarios",currentUser.uid),dataToSave,{merge:true});
                    console.log("Onboarding data saved successfully!");
                  } catch(e){ console.log("Error saving onboarding:", e.message); }
                }
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
          <TouchableOpacity key={t.id} onPress={()=>{setTab(t.id);setSU(null);}} style={{ flex:1, alignItems:"center", paddingVertical:6 }}>
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
            <Text style={[lbl,{marginBottom:10}]}>📚 Livros Obrigatórios {selUni.vestibular?.includes("2026") ? "2026" : ""}</Text>
            {selUni.books.map((book, i)=>(
              <View key={i} style={{ flexDirection:"row", alignItems:"flex-start", paddingVertical:8, borderBottomWidth:i<selUni.books.length-1?1:0, borderColor:T.border }}>
                <Text style={{ fontSize:14, marginRight:10, marginTop:2 }}>📖</Text>
                <Text style={{ color:T.text, fontSize:12, flex:1, lineHeight:18 }}>{book}</Text>
              </View>
            ))}
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
      {feedItems.length===0 && fol.length===0 && (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:40 }}>
          <Text style={{ fontSize:48, marginBottom:16 }}>📰</Text>
          <Text style={{ color:T.text, fontSize:16, fontWeight:"800", marginBottom:8, textAlign:"center" }}>Seu feed está vazio</Text>
          <Text style={{ color:T.sub, fontSize:13, textAlign:"center", lineHeight:20, marginBottom:20 }}>Siga universidades para ver novidades, datas e notas de corte.</Text>
          <TouchableOpacity onPress={()=>setTab("explorar")} style={{ paddingHorizontal:24, paddingVertical:12, borderRadius:20, backgroundColor:T.accent }}>
            <Text style={{ color:AT, fontWeight:"800", fontSize:14 }}>Explorar universidades</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ paddingHorizontal:16, paddingBottom:16, gap:12 }}>
        {feedItems.map(item=>{
          const tc=TG[item.type]||TG.news; const isL=liked[item.id]; const isS=saved[item.id];
          const ui=unis.find(u=>u.id===item.uniId);
          return (
            <View key={item.id} style={{ ...cd({ overflow:"hidden" }), borderLeftWidth:3, borderLeftColor:ui?.color||T.accent }}>
              <View style={{ flexDirection:"row", alignItems:"center", gap:10, padding:14, paddingBottom:10 }}>
                <View style={{ width:36, height:36, borderRadius:18, backgroundColor:ui?.color||T.card2, alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ color:"#fff", fontSize:11, fontWeight:"800" }}>{ui?.name?.slice(0,2)||""}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:13, fontWeight:"700" }}>{item.uni}</Text>
                  <Text style={{ color:T.muted, fontSize:11 }}>{item.time || timeAgo(item.createdAt)}</Text>
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
                  setPosts(prev=>prev.map(p=>p.id===item.id?{...p,likesCount:(p.likesCount??p.likes??0)+(newLiked?1:-1)}:p));
                  saveLocalUserData(currentData());
                  (async()=>{
                    try{
                      const postRef=doc(db,"posts",item.id); const lkRef=doc(db,"posts",item.id,"likes",currentUser.uid);
                      if(newLiked){await setDoc(lkRef,{timestamp:serverTimestamp()});await updateDoc(postRef,{likesCount:increment(1)});}
                      else{await deleteDoc(lkRef);await updateDoc(postRef,{likesCount:increment(-1)});}
                    }catch{}
                  })();
                }} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4, marginRight:2 }}>
                  <Text style={{ fontSize:14, marginRight:4 }}>{isL?"❤️":"🤍"}</Text>
                  <Text style={{ color:isL?"#f87171":T.muted, fontSize:11, fontWeight:"600" }}>{fmtCount(Math.max(0, item.likesCount??item.likes??0))}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{
                  setMshr(item);
                  // Increment share count optimistically + in Firebase
                  setPosts(prev=>prev.map(p=>p.id===item.id?{...p,sharesCount:(p.sharesCount||0)+1}:p));
                  updateDoc(doc(db,"posts",item.id),{sharesCount:increment(1)}).catch(()=>{});
                }} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4, marginRight:2 }}>
                  <Text style={{ fontSize:14, marginRight:4 }}>📤</Text>
                  <Text style={{ color:T.muted, fontSize:11, fontWeight:"600" }}>{fmtCount(item.sharesCount||0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>Alert.alert("Reportar","Deseja reportar esta publicação?\n\nNosso time irá analisar.",[{text:"Cancelar",style:"cancel"},{text:"Reportar",style:"destructive",onPress:async()=>{
                  try {
                    await addDoc(collection(db,"reports"),{
                      postId:item.id, postTitle:item.title, reportedBy:currentUser?.uid||"anon",
                      reason:"user_report", createdAt:serverTimestamp(),
                    });
                  } catch {}
                  Alert.alert("Obrigado!","Report enviado para análise.");
                }}])} style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:7, paddingVertical:4 }}>
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
      <TouchableOpacity onPress={()=>setMdisc(true)} style={{ backgroundColor:isDark?"#0c1f3a":"#dbeafe", borderRadius:18, padding:16, flexDirection:"row", alignItems:"center", gap:14, marginBottom:14, borderWidth:1, borderColor:isDark?"#1e40af40":"#bfdbfe" }}>
        <View style={{ width:52, height:52, borderRadius:26, backgroundColor:isDark?"#1e3a6a":"#bfdbfe", alignItems:"center", justifyContent:"center" }}>
          <Text style={{ fontSize:28 }}>🧭</Text>
        </View>
        <View style={{ flex:1 }}>
          <Text style={{ color:T.text, fontSize:14, fontWeight:"800" }}>Ainda não sabe qual curso?</Text>
          <Text style={{ color:T.sub, fontSize:11, marginTop:2, lineHeight:15 }}>Explore por área, nota de corte e mercado de trabalho</Text>
        </View>
        <View style={{ backgroundColor:T.accent, borderRadius:12, width:32, height:32, alignItems:"center", justifyContent:"center" }}>
          <Text style={{ color:AT, fontWeight:"800", fontSize:16 }}>›</Text>
        </View>
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
          <TouchableOpacity key={u.id} onPress={()=>setSU(u)} style={{ ...cd(), flexDirection:"row", alignItems:"center", gap:12, padding:15, borderLeftWidth:u.followed?3:0, borderLeftColor:u.color }}>
            <View style={{ width:50, height:50, borderRadius:25, backgroundColor:u.color, alignItems:"center", justifyContent:"center" }}>
              <Text style={{ color:"#fff", fontSize:14, fontWeight:"800" }}>{u.name.slice(0,2)}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:T.text, fontSize:15, fontWeight:"800" }}>{u.name}</Text>
              <Text style={{ color:T.sub, fontSize:11 }} numberOfLines={1}>{u.fullName}</Text>
              <View style={{ flexDirection:"row", gap:5, marginTop:5 }}>
                {[u.state,u.type].map(x=><View key={x} style={{ backgroundColor:T.card2, borderRadius:8, paddingHorizontal:7, paddingVertical:2 }}><Text style={{ color:T.muted, fontSize:9, fontWeight:"600" }}>{x}</Text></View>)}
                <Text style={{ color:T.sub, fontSize:10 }}>👥 {fmtCount(u.followersCount??u.followers)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={()=>toggleFollow(u,!u.followed)} style={{ paddingHorizontal:12, paddingVertical:7, borderRadius:11, backgroundColor:u.followed?"transparent":T.accent, borderWidth:u.followed?1.5:0, borderColor:"#C62828" }}>
              <Text style={{ color:u.followed?"#C62828":AT, fontSize:11, fontWeight:"800" }}>{u.followed?"✓ Seguindo":"+ Seguir"}</Text>
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
      <View style={{ gap:10, marginBottom:20 }}>
        {filtN.map((n,i)=>{
          const pct = Math.round((n.nota/100)*100);
          const diff = last ? (avg(last) - n.nota) : null;
          const diffColor = diff===null ? T.muted : diff>=0 ? "#22c55e" : "#f87171";
          return (
            <View key={i} style={{ ...cd(), overflow:"hidden", borderLeftWidth:4, borderLeftColor:n.cor }}>
              <View style={{ padding:14 }}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
                  <View style={{ width:44, height:44, borderRadius:22, backgroundColor:n.cor+"22", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:n.cor+"44" }}>
                    <Text style={{ color:n.cor, fontSize:10, fontWeight:"800" }}>{n.uni.split(" ")[0]}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:"800" }}>{n.curso}</Text>
                    <Text style={{ color:T.sub, fontSize:11 }}>{n.uni} · {n.vagas} vagas</Text>
                  </View>
                  <View style={{ alignItems:"flex-end", gap:2 }}>
                    <View style={{ backgroundColor:n.cor+"18", borderRadius:10, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:n.cor+"44" }}>
                      <Text style={{ color:n.cor, fontSize:18, fontWeight:"800" }}>{n.nota}</Text>
                    </View>
                    {diff!==null && <Text style={{ color:diffColor, fontSize:9, fontWeight:"700", textAlign:"right" }}>{diff>=0?"+"+(diff.toFixed(1)):diff.toFixed(1)} pts</Text>}
                  </View>
                </View>
                <View style={{ marginTop:10, backgroundColor:T.card2, borderRadius:6, height:4 }}>
                  <View style={{ width:pct+"%", height:"100%", backgroundColor:n.cor, borderRadius:6, opacity:0.8 }} />
                </View>
                <TouchableOpacity onPress={()=>Linking.openURL(n.site)} style={{ marginTop:8, alignSelf:"flex-start" }}>
                  <Text style={{ color:T.accent, fontSize:10, fontWeight:"700" }}>Site oficial ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
            <View style={{ backgroundColor:isDark?"#2a1800":"#fff7ed", borderRadius:16, padding:14, borderWidth:1, borderColor:isDark?"#78350f":"#fed7aa", marginBottom:14, flexDirection:"row", alignItems:"center", gap:12 }}>
              <View style={{ width:44, height:44, borderRadius:22, backgroundColor:isDark?"#78350f":"#fed7aa", alignItems:"center", justifyContent:"center" }}>
                <Text style={{ fontSize:22 }}>⚠️</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ color:"#f59e0b", fontSize:10, fontWeight:"800", textTransform:"uppercase", letterSpacing:0.5 }}>Área para melhorar</Text>
                <Text style={{ color:isDark?"#fbbf24":"#c2410c", fontSize:14, fontWeight:"800", marginTop:2 }}>{weak.subject}</Text>
                <Text style={{ color:isDark?"#fbbf24":"#c2410c", fontSize:11, opacity:0.8 }}>{weak.v} pts na última prova</Text>
              </View>
              <View style={{ backgroundColor:isDark?"#78350f":"#fed7aa", borderRadius:10, paddingHorizontal:10, paddingVertical:6 }}>
                <Text style={{ color:isDark?"#fbbf24":"#92400e", fontSize:13, fontWeight:"800" }}>{weak.v}</Text>
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
      <View style={{ ...cd(), overflow:"hidden", marginBottom:12 }}>
        {/* Banner */}
        <View style={{ height:80, backgroundColor:AVATAR_COLORS[avBgIdx][0]+"44", borderBottomWidth:1, borderColor:T.border }} />
        <View style={{ alignItems:"center", marginTop:-40, paddingBottom:20, paddingHorizontal:22 }}>
          <TouchableOpacity onPress={()=>{setTmpAv(av);setTmpBgIdx(avBgIdx);setMpho(true);}} style={{ width:80, height:80, borderRadius:40, backgroundColor:AVATAR_COLORS[avBgIdx][0], alignItems:"center", justifyContent:"center", borderWidth:4, borderColor:T.card }}>
            <Text style={{ fontSize:36 }}>{av}</Text>
          </TouchableOpacity>
          <Text style={{ color:T.muted, fontSize:10, marginTop:4, marginBottom:8 }}>Toque para alterar foto</Text>
          <Text style={{ color:T.text, fontSize:18, fontWeight:"800" }}>{currentUser?.email?.split("@")[0]||"Usuário"}</Text>
          <View style={{ flexDirection:"row", alignItems:"center", gap:6, marginTop:4, marginBottom:12 }}>
            <Text>{uType?.emoji}</Text>
            <Text style={{ color:T.sub, fontSize:12 }}>{uType?.label}</Text>
          </View>
          <View style={{ flexDirection:"row", gap:8, marginBottom:16, flexWrap:"wrap", justifyContent:"center" }}>
            {!!c1 && <View style={{ backgroundColor:T.acBg, paddingHorizontal:12, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:T.accent+"40" }}><Text style={{ color:T.accent, fontSize:11, fontWeight:"700" }}>1ª {c1}</Text></View>}
            {!!c2 && <View style={{ backgroundColor:T.card2, paddingHorizontal:12, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:T.border }}><Text style={{ color:T.sub, fontSize:11, fontWeight:"700" }}>2ª {c2}</Text></View>}
          </View>
          <View style={{ flexDirection:"row", justifyContent:"center", gap:0, width:"100%", borderTopWidth:1, borderColor:T.border, paddingTop:14 }}>
            {[{v:fol.length,l:"seguindo"},{v:gs.length,l:"provas"},{v:Object.values(saved).filter(Boolean).length,l:"salvos"}].map(({v,l},i,arr)=>(
              <View key={l} style={{ flex:1, alignItems:"center", borderRightWidth:i<arr.length-1?1:0, borderColor:T.border }}>
                <Text style={{ color:T.accent, fontSize:20, fontWeight:"800" }}>{v}</Text>
                <Text style={{ color:T.muted, fontSize:10 }}>{l}</Text>
              </View>
            ))}
          </View>
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
      {!showExamsPage && <SBar />}
      {!selUni && !showExamsPage && (
        <View style={{ paddingHorizontal:20, paddingTop:0, paddingBottom:6 }}>
          <Text style={{ color:T.sub, fontSize:11 }}>{tab==="feed"?"Novidades para você":tab==="explorar"?"Encontre sua universidade":tab==="notas"?"Notas de corte & suas provas":`${uType?.emoji||"👤"} ${uType?.label||"Meu Perfil"}`}</Text>
        </View>
      )}
      {showExamsPage && selUni ? renderExamsPage() : selUni ? renderUniDetail() : (
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
                  if(s1){setEC1("");setEpick(1);}
                  else if(s2){setEC2("");}
                  else if(ePick===1){setEC1(cc);setEC2(s2?"":eC2);setEpick(2);}
                  else{setEC2(cc);}
                  if(!eC1&&!eC2){setEpick(1);}
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
