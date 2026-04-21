import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const fetchUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? snap.data() : null;
};

export const fetchUniversities = async () => {
  const snap = await getDocs(collection(db, "universidades"));
  if (snap.empty) return [];
  const f = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return [...new Map(f.map(u => [u.name, u])).values()];
};

export const fetchCourses = async () => {
  const snap = await getDocs(collection(db, "cursos"));
  if (snap.empty) return [];
  return [...new Set(snap.docs.map(d => d.data().name))].sort();
};

export const fetchIcons = async () => {
  const snap = await getDocs(collection(db, "icones"));
  if (snap.empty) return {};
  const m = {};
  snap.docs.forEach(d => { const x = d.data(); m[x.id] = x.emoji; });
  return m;
};

export const fetchPosts = async () => {
  const snap = await getDocs(collection(db, "posts"));
  if (snap.empty) return [];
  const f = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  f.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  return f;
};

export const fetchPostLikes = async (posts, uid) => {
  if (!posts?.length || !uid) return {};
  const checks = await Promise.all(
    posts.map(p => getDoc(doc(db, "posts", String(p.id), "likes", uid))),
  );
  const lk = {};
  checks.forEach((snap, i) => { if (snap.exists()) lk[posts[i].id] = true; });
  return lk;
};
