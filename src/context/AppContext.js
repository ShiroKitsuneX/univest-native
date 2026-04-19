import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Appearance, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../firebase/config";
import {
  collection, getDocs, doc, setDoc, getDoc, deleteDoc,
  updateDoc, increment, addDoc, serverTimestamp, arrayUnion, arrayRemove,
  writeBatch,
} from "firebase/firestore";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail,
} from "firebase/auth";

import { UNIVERSITIES, FEED, NOTAS_CORTE, EVENTS, USER_TYPES, AREAS, ALL_COURSES, AVATAR_PRESETS, AVATAR_COLORS, TAG_TYPES, TAG_TYPES_LIGHT } from "../constants";
import { DK, LT } from "../theme";
import { timeAgo, fmtCount, removeAccents } from "../utils";

const AppContext = createContext(null);

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

const seedGeoData = async () => {
  try {
    const countriesSnap = await getDocs(collection(db, "countries"));
    if (!countriesSnap.empty) return;
    const batch = writeBatch(db);
    batch.set(doc(db, "countries", "BR"), { id: "BR", name: "Brasil" });
    await batch.commit();
    console.log("Geo data seeded!");
  } catch (e) {
    console.log("Error seeding geo data:", e.message);
  }
};

export const AppProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "auto" ? colorScheme === "dark" : theme === "dark";
  const T = isDark ? DK : LT;
  const TG = isDark ? TAG_TYPES : TAG_TYPES_LIGHT;
  const AT = isDark ? "#000" : "#fff";

  const cd = (extra = {}) => ({
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    ...extra,
  });

  const lbl = {
    color: T.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authBirthdate, setAuthBirthdate] = useState("");
  const [authAcceptTerms, setAuthAcceptTerms] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authSobrenome, setAuthSobrenome] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [authTouched, setAuthTouched] = useState({email:false,nome:false,sobrenome:false,senha:false,confirmarSenha:false,nascimento:false});
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
  const [posts, setPosts] = useState(FEED);
  const [fbUnis, setFbUnis] = useState([]);
  const [fbCourses, setFbCourses] = useState([]);
  const [fbIcons, setFbIcons] = useState({});
  const [selUni, setSU] = useState(null);
  const [selectedBookYear, setSelectedBookYear] = useState(null);
  const [goalsUnis, setGoalsUnis] = useState([]);
  const [goalsModal, setGoalsModal] = useState(false);
  const [goalsSearch, setGoalsSearch] = useState("");
  const [completedTodos, setCompletedTodos] = useState({});
  const [readBooks, setReadBooks] = useState({});
  const [readingBooks, setReadingBooks] = useState([]);
  const [requirementsModal, setRequirementsModal] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState(null);
  const [query, setQuery] = useState("");
  const [fSt, setFSt] = useState("Todos");
  const [nSrch, setNsrch] = useState("");
  const [saved, setSaved] = useState({});
  const loginBtnScale = useRef(new Animated.Value(1)).current;
  const loginBtnOpacity = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState({});
  const [uniSort, setUniSort] = useState("date");
  const [uniPrefs, setUniPrefs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const [gs, setGs] = useState([
    { id:1, ex:"FUVEST Simulado 1", dt:"Mar/2025", type:"simulado", s:{l:62,h:70,n:58,m:55,r:680} },
    { id:2, ex:"FUVEST Simulado 2", dt:"Abr/2025", type:"simulado", s:{l:68,h:74,n:65,m:60,r:720} },
    { id:3, ex:"ENEM Prova",         dt:"Mai/2025", type:"prova", s:{l:72,h:78,n:69,m:64,r:760} },
  ]);
  const [ng, setNg] = useState({ ex:"",dt:"",l:"",h:"",n:"",m:"",r:"",type:"prova" });

  const [av, setAv] = useState("🧑‍🎓");
  const [avBgIdx, setAvBgIdx] = useState(0);
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

  useEffect(() => {
    const init = async () => {
      const unsubAuth = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const snap = await getDoc(doc(db, "usuarios", user.uid));
            if (snap.exists()) {
              const data = snap.data();
              setUserData(data);
              setNome(data.nome || "");
              setSobrenome(data.sobrenome || "");
              setAv(data.av || "🧑‍🎓");
              setAvBgIdx(data.avBgIdx || 0);
              setUType(USER_TYPES.find(t => t.id === data.uType) || null);
              setC1(data.c1 || "");
              setC2(data.c2 || "");
              setGoalsUnis(data.goalsUnis || []);
              setReadBooks(data.readBooks || {});
              setReadingBooks(data.readingBooks || []);
              setCompletedTodos(data.completedTodos || {});
            }
            const savedData = await loadLocalUserData();
            if (savedData) {
              if (savedData.theme) setTheme(savedData.theme);
              if (savedData.tab) setTab(savedData.tab);
            }
          } catch (e) { console.log("Error loading user:", e); }
        }
        setAuthLoading(false);
      });
      await seedGeoData();
      return () => unsubAuth();
    };
    init();
  }, []);

  const currentData = () => ({
    nome, sobrenome, av, avBgIdx, uType: uType?.id, c1, c2,
    goalsUnis, readBooks, readingBooks, completedTodos, theme, tab
  });

  const value = {
    theme, setTheme, isDark, T, TG, AT, cd, lbl,
    currentUser, setCurrentUser, authLoading, showLogin, setShowLogin,
    loginMode, setLoginMode, authEmail, setAuthEmail, authPassword, setAuthPassword,
    authConfirmPassword, setAuthConfirmPassword, authBirthdate, setAuthBirthdate,
    authAcceptTerms, setAuthAcceptTerms, authName, setAuthName, authSobrenome, setAuthSobrenome,
    nome, setNome, sobrenome, setSobrenome, authError, setAuthError,
    authSubmitting, setAuthSubmitting, forgotMode, setForgotMode, passwordSent, setPasswordSent,
    showLoginPwd, setShowLoginPwd, showTerms, setShowTerms, authTouched, setAuthTouched,
    userData, setUserData, step, setStep, done, setDone, uType, setUType,
    c1, setC1, c2, setC2, cSrch, setCsrch, uSrch, setUsrch, picking, setPick,
    onboardingLoaded, setOnboardingLoaded, tab, setTab, unis, setUnis, posts, setPosts,
    fbUnis, setFbUnis, fbCourses, setFbCourses, fbIcons, setFbIcons, selUni, setSU,
    selectedBookYear, setSelectedBookYear, goalsUnis, setGoalsUnis, goalsModal, setGoalsModal,
    goalsSearch, setGoalsSearch, completedTodos, setCompletedTodos, readBooks, setReadBooks,
    readingBooks, setReadingBooks, requirementsModal, setRequirementsModal,
    selectedRequirements, setSelectedRequirements, query, setQuery, fSt, setFSt, nSrch, setNsrch,
    saved, setSaved, loginBtnScale, loginBtnOpacity, liked, setLiked, uniSort, setUniSort,
    uniPrefs, setUniPrefs, refreshing, setRefreshing, gs, setGs, ng, setNg,
    av, setAv, avBgIdx, setAvBgIdx, tmpAv, setTmpAv, tmpBgIdx, setTmpBgIdx,
    mCfg, setMcfg, mPho, setMpho, mEdit, setMedit, mNome, setMnome,
    tmpNome, setTmpNome, tmpSobrenome, setTmpSobrenome, mEv, setMev, mExam, setMexam,
    examYear, setExamYear, showExamsPage, setShowExamsPage, showBooksPage, setShowBooksPage,
    booksSearch, setBooksSearch, expandedYears, setExpandedYears, examSearch, setExamSearch,
    examSort, setExamSort, bookMenu, setBookMenu, showFollowingPage, setShowFollowingPage,
    mGr, setMgr, mShr, setMshr, mDisc, setMdisc, mUni, setMUni, dArea, setDarea,
    timeAgo, fmtCount, removeAccents,
    loadLocalUserData, saveLocalUserData, currentData,
    seedGeoData,
    UNIVERSITIES, FEED, NOTAS_CORTE, EVENTS, USER_TYPES, AREAS, ALL_COURSES,
    AVATAR_PRESETS, AVATAR_COLORS, TAG_TYPES, TAG_TYPES_LIGHT,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export default AppContext;