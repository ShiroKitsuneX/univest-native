import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

const PerfilScreen = () => {
  const { 
    theme: T, isDark, cd, lbl,
    currentUser, nome, sobrenome, av, avBgIdx, uType, c1, c2,
    tmpAv, setTmpAv, tmpBgIdx, setTmpBgIdx, setMpho,
    tmpNome, setTmpNome, tmpSobrenome, setTmpSobrenome, setMcfg, setMnome, setMedit,
    saved, gs, Unis, setSU, setTab, readBooks, setReadBooks,
    goalsUnis, completedTodos, setCompletedTodos, setGoalsModal,
    bookMenu, setBookMenu, EVENTS, AVATAR_COLORS,
    loadLocalUserData, saveLocalUserData, currentData,
    setShowBooksPage, setShowFollowingPage, setMSaved,
  } = useApp();
  const { toggleTheme } = useTheme();
  const { logout } = useAuth();

  const fol = Unis.filter(u => u.followed).sort((a, b) => {
    if (a.followedAt && b.followedAt) return b.followedAt - a.followedAt;
    return 0;
  });

  const last = gs[gs.length - 1];
  const avg = (g) => {
    const s = g.s;
    return Math.round((s.l + s.h + s.n + s.m + s.r) / 5);
  };
  const tgt = c1 ? 700 : 0;
  const AT = isDark ? "#fff" : "#000";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const handleToggleTodo = (todoId) => {
    const newCompleted = { ...completedTodos, [todoId]: !completedTodos[todoId] };
    setCompletedTodos(newCompleted);
    saveLocalUserData({ ...currentData(), goalsUnis, completedTodos: newCompleted });
    if (currentUser) {
      setDoc(doc(db, "usuarios", currentUser.uid), { completedTodos: newCompleted, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }
  };

  const handleBookMenu = (bookKey, status) => {
    const newRead = { ...readBooks, [bookKey]: status };
    setReadBooks(newRead);
    saveLocalUserData({ ...currentData(), readBooks: newRead });
    if (currentUser) {
      setDoc(doc(db, "usuarios", currentUser.uid), { readBooks: newRead, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }
    setBookMenu(null);
  };

  const handleEditCourse = () => {
    // Navigate to notas screen to edit courses
    setTab("notas");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={{ ...cd(), overflow: "hidden", marginBottom: 12 }}>
          <View style={{ height: 80, backgroundColor: AVATAR_COLORS[avBgIdx][0] + "44", borderBottomWidth: 1, borderColor: T.border }} />
          <View style={{ alignItems: "center", marginTop: -40, paddingBottom: 20, paddingHorizontal: 22 }}>
            <TouchableOpacity onPress={() => { setTmpAv(av); setTmpBgIdx(avBgIdx); setMpho(true); }} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: AVATAR_COLORS[avBgIdx][0], alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: T.card }}>
              <Text style={{ fontSize: 36 }}>{av}</Text>
            </TouchableOpacity>
            <Text style={{ color: T.muted, fontSize: 10, marginTop: 4, marginBottom: 8 }}>Toque para alterar foto</Text>
            <TouchableOpacity onPress={() => { setTmpNome(nome); setTmpSobrenome(sobrenome); setMcfg(false); setMnome(true); }}>
              <Text style={{ color: T.text, fontSize: 18, fontWeight: "800" }}>{nome}{sobrenome ? " " + sobrenome : ""}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 12 }}>
              <Text>{uType?.emoji}</Text>
              <Text style={{ color: T.sub, fontSize: 12 }}>{uType?.label}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 4, flexWrap: "wrap", justifyContent: "center" }}>
              {!!c1 && (
                <TouchableOpacity onPress={handleEditCourse} style={{ backgroundColor: T.acBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: T.accent + "40" }}>
                  <Text style={{ color: T.accent, fontSize: 11, fontWeight: "700" }}>1ª {c1}</Text>
                </TouchableOpacity>
              )}
              {!!c2 && (
                <TouchableOpacity onPress={handleEditCourse} style={{ backgroundColor: T.card2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: T.border }}>
                  <Text style={{ color: T.sub, fontSize: 11, fontWeight: "700" }}>2ª {c2}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleEditCourse} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: T.card2, borderWidth: 1, borderColor: T.border }}>
                <Text style={{ color: T.sub, fontSize: 10 }}>✏️</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 0, width: "100%", borderTopWidth: 1, borderColor: T.border, paddingTop: 14 }}>
              {[
                { v: fol.length, l: "seguindo", isFollowing: true },
                { v: gs.filter(g => g.type !== "simulado").length, l: "provas" },
                { v: gs.filter(g => g.type === "simulado").length, l: "simulados" },
                { v: Object.values(saved).filter(Boolean).length, l: "salvos", isSaved: true }
              ].map(({ v, l, isFollowing, isSaved }, i, arr) => (
                <TouchableOpacity 
                  key={l} 
                  onPress={() => { if (isFollowing && v > 0) setShowFollowingPage(true); else if (isSaved && v > 0) setMSaved(true); }} 
                  style={{ flex: 1, alignItems: "center", borderRightWidth: i < arr.length - 1 ? 1 : 0, borderColor: T.border, paddingVertical: 4 }}
                >
                  <Text style={{ color: T.accent, fontSize: 18, fontWeight: "800" }}>{v}</Text>
                  <Text style={{ color: T.muted, fontSize: 9 }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: isDark ? "#0a1f0d" : "#f0fdf4", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: T.accent + "30", marginBottom: 12 }}>
          <Text style={[lbl, { color: T.accent, marginBottom: 8 }]}>🎯 Meu Objetivo</Text>
          <Text style={{ color: T.text, fontSize: 14, fontWeight: "700" }}>{c1 || "Sem curso definido"}</Text>
          {!!c1 && <Text style={{ color: T.sub, fontSize: 12, marginBottom: c2 ? 4 : 10 }}>Nota de corte: {tgt}</Text>}
          {!!c2 && <Text style={{ color: T.sub, fontSize: 12, marginBottom: 10 }}>2ª opção: {c2}</Text>}
          {last ? (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                <Text style={{ color: T.muted, fontSize: 11 }}>Última média: {avg(last)}</Text>
                <Text style={{ color: T.accent, fontSize: 11, fontWeight: "700" }}>{Math.round(avg(last) / tgt * 100)}% da meta</Text>
              </View>
              <View style={{ backgroundColor: T.card2, borderRadius: 6, height: 6 }}>
                <View style={{ width: Math.min(100, Math.round(avg(last) / tgt * 100)) + "%", height: "100%", backgroundColor: T.accent, borderRadius: 6 }} />
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setTab("notas")} style={{ padding: 9, borderRadius: 12, backgroundColor: T.acBg, alignItems: "center", borderWidth: 1, borderColor: T.accent + "40" }}>
              <Text style={{ color: T.accent, fontSize: 12, fontWeight: "700" }}>+ Adicionar minhas notas</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ ...cd(), padding: 15, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={lbl}>📚 Livros</Text>
            {Object.keys(readBooks).length > 0 && (
              <TouchableOpacity onPress={() => setShowBooksPage(true)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: T.card2, borderWidth: 1, borderColor: T.border }}>
                <Text style={{ color: T.sub, fontSize: 10, fontWeight: "700" }}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>
          {Object.keys(readBooks).length === 0 ? (
            <TouchableOpacity onPress={() => setShowBooksPage(true)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, backgroundColor: T.card2, borderRadius: 12, borderWidth: 1, borderColor: T.border }}>
              <Text style={{ color: T.sub, fontSize: 12 }}>Adicione livros das universidades que você segue</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {(() => {
                const lend = Object.values(readBooks).filter(s => s === "reading").length;
                const lido = Object.values(readBooks).filter(s => s === "read").length;
                return (
                  <>
                    {lend > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f59e0b20", borderRadius: 16, borderWidth: 1, borderColor: "#f59e0b40" }}>
                        <Text style={{ fontSize: 11 }}>📖</Text>
                        <Text style={{ color: "#f59e0b", fontSize: 11, fontWeight: "700" }}>{lend}</Text>
                      </View>
                    )}
                    {lido > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: T.accent + "20", borderRadius: 16, borderWidth: 1, borderColor: T.accent + "40" }}>
                        <Text style={{ fontSize: 11 }}>✓</Text>
                        <Text style={{ color: T.accent, fontSize: 11, fontWeight: "700" }}>{lido}</Text>
                      </View>
                    )}
                    {lend === 0 && lido === 0 && <Text style={{ color: T.sub, fontSize: 12 }}>Adicione livros das universidades que você segue</Text>}
                  </>
                );
              })()}
            </View>
          )}
        </View>

        <View style={{ ...cd({ padding: 15, marginBottom: 12, backgroundColor: isDark ? "#1a1a2e" : "#f5f5ff" }), borderWidth: 1, borderColor: T.accent + "30", borderRadius: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={[lbl, { color: T.accent, marginBottom: 0 }]}>📋 Tarefas</Text>
            <TouchableOpacity onPress={() => setGoalsModal(true)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: T.acBg }}>
              <Text style={{ color: T.accent, fontSize: 10, fontWeight: "700" }}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
          {goalsUnis.length === 0 ? (
            <Text style={{ color: T.sub, fontSize: 12 }}>Adicione universidades que você pretende fazer vestibular</Text>
          ) : (
            <View>
              {goalsUnis.map(goal => {
                const nextExam = goal.exams?.find(e => e.status === "upcoming");
                const daysUntil = nextExam ? Math.max(0, Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24))) : null;
                const goalTodos = [
                  ...(goal.books?.map((book, i) => ({ 
                    id: `${goal.id}-${book}`, 
                    bookKey: `${goal.id}-${book}`,
                    text: `Ler "${book.split(" - ")[0]}"`, 
                    type: "book" 
                  })) || []),
                  { id: `${goal.id}-inscricao`, text: "Fazer inscrição", type: "inscricao" },
                  { id: `${goal.id}-taxa`, text: "Pagar taxa de inscrição", type: "taxa" },
                ];
                const completedCount = goalTodos.filter(t => t.type === "book" ? readBooks[t.bookKey] === "read" : completedTodos[t.id]).length;
                
                return (
                  <View key={goal.id} style={{ marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => { const u = Unis.find(x => x.id === goal.id); if (u) setSU(u); setTab("explorar"); }} style={{ flexDirection: "row", alignItems: "center", backgroundColor: T.card2, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: goal.color, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{goal.name.slice(0, 2)}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ color: T.text, fontSize: 13, fontWeight: "700" }}>{goal.name}</Text>
                        <Text style={{ color: T.muted, fontSize: 10 }}>{goal.vestibular}</Text>
                      </View>
                      {daysUntil !== null && (
                        <View style={{ backgroundColor: daysUntil <= 30 ? "#dc2626" : T.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={{ color: AT, fontSize: 10, fontWeight: "800" }}>{daysUntil}d</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ backgroundColor: T.card, borderRadius: 8, marginTop: 6, padding: 8, borderWidth: 1, borderColor: T.border }}>
                      {goalTodos.map(todo => {
                        const status = todo.type === "book" ? readBooks[todo.bookKey] || "none" : "none";
                        const isCompleted = todo.type === "book" ? status === "read" : completedTodos[todo.id];
                        const isReading = todo.type === "book" && status === "reading";
                        const showMenu = todo.type === "book" && bookMenu === todo.bookKey;
                        return (
                          <View key={todo.id}>
                            <TouchableOpacity onPress={() => {
                              if (todo.type === "book") {
                                setBookMenu(showMenu ? null : todo.bookKey);
                              } else {
                                handleToggleTodo(todo.id);
                              }
                            }} activeOpacity={0.7} style={{ 
                              paddingVertical: 6, 
                              paddingHorizontal: (isCompleted || isReading) ? 6 : 0, 
                              marginHorizontal: (isCompleted || isReading) ? -6 : 0, 
                              borderRadius: (isCompleted || isReading) ? 6 : 0, 
                              backgroundColor: isCompleted ? T.accent + "10" : isReading ? "#f59e0b10" : "transparent" 
                            }}>
                              {showMenu ? (
                                <View style={{ flexDirection: "row", gap: 4 }}>
                                  <TouchableOpacity 
                                    onPress={(e) => { e.stopPropagation(); handleBookMenu(todo.bookKey, null); }} 
                                    style={{ flex: 1, padding: 4, borderRadius: 6, backgroundColor: T.card, borderWidth: 1, borderColor: T.border }}
                                  >
                                    <Text style={{ color: T.muted, fontSize: 9, fontWeight: "700", textAlign: "center" }}>○</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                    onPress={(e) => { e.stopPropagation(); handleBookMenu(todo.bookKey, "reading"); }} 
                                    style={{ flex: 1, padding: 4, borderRadius: 6, backgroundColor: "#f59e0b30", borderWidth: 1, borderColor: "#f59e0b" }}
                                  >
                                    <Text style={{ color: "#f59e0b", fontSize: 9, fontWeight: "700", textAlign: "center" }}>📖</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                    onPress={(e) => { e.stopPropagation(); handleBookMenu(todo.bookKey, "read"); }} 
                                    style={{ flex: 1, padding: 4, borderRadius: 6, backgroundColor: T.accent + "20", borderWidth: 1, borderColor: T.accent }}
                                  >
                                    <Text style={{ color: T.accent, fontSize: 9, fontWeight: "700", textAlign: "center" }}>✓</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: isCompleted ? T.accent : isReading ? "#f59e0b" : T.card2, borderWidth: 2, borderColor: isCompleted ? T.accent : isReading ? "#f59e0b" : T.border, alignItems: "center", justifyContent: "center" }}>
                                    {isCompleted && <Text style={{ color: AT, fontSize: 10, fontWeight: "800" }}>✓</Text>}
                                    {isReading && <Text style={{ color: "#fff", fontSize: 8 }}>📖</Text>}
                                    {!isCompleted && !isReading && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.muted }} />}
                                  </View>
                                  <Text style={{ color: T.text, fontSize: 11, flex: 1 }}>{todo.type === "book" ? "📚" : todo.type === "inscricao" ? "📝" : "💳"} {todo.text}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: T.border }}>
                        <Text style={{ color: T.sub, fontSize: 10 }}>{completedCount}/{goalTodos.length} tarefas</Text>
                        <Text style={{ color: T.accent, fontSize: 10, fontWeight: "700" }}>{Math.round(completedCount / goalTodos.length * 100)}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {goalsUnis.length > 0 && goalsUnis.some(g => g.exams?.some(e => e.status === "upcoming")) && (
          <View style={cd({ padding: 15, marginBottom: 12 })}>
            <Text style={[lbl, { marginBottom: 12 }]}>📅 Provas das suas metas</Text>
            {goalsUnis.flatMap(g => {
              const upcomingExams = g.exams?.filter(e => e.status === "upcoming") || [];
              return upcomingExams.map((exam, idx) => {
                const daysUntil = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
                return (
                  <View key={`${g.id}-${exam.id}-${idx}`} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: T.border }}>
                    <View style={{ backgroundColor: g.color, borderRadius: 10, width: 52, height: 52, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "rgba(255,255,255,.55)", fontSize: 8, fontWeight: "700" }}>{new Date(exam.date).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}</Text>
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{new Date(exam.date).getDate()}</Text>
                      <Text style={{ color: "rgba(255,255,255,.45)", fontSize: 8 }}>{new Date(exam.date).getFullYear()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontSize: 12, fontWeight: "700" }} numberOfLines={1}>{exam.subject}</Text>
                      <Text style={{ color: T.muted, fontSize: 10 }}>{g.name} • {exam.phase}</Text>
                    </View>
                    <View style={{ backgroundColor: daysUntil <= 7 ? "#dc2626" : daysUntil <= 30 ? "#f59e0b" : T.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: AT, fontSize: 10, fontWeight: "800" }}>{daysUntil}d</Text>
                    </View>
                  </View>
                );
              });
            }).slice(0, 5)}
          </View>
        )}

        <View style={cd({ padding: 15 })}>
          <Text style={[lbl, { marginBottom: 12 }]}>⏰ Próximos Eventos</Text>
          {EVENTS.map((ev, i) => (
            <TouchableOpacity key={ev.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: i < EVENTS.length - 1 ? 1 : 0, borderColor: T.border }}>
              <View style={{ backgroundColor: ev.cor, borderRadius: 10, width: 52, height: 52, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "rgba(255,255,255,.55)", fontSize: 8, fontWeight: "700" }}>{ev.month}</Text>
                <Text style={{ color: "#fff", fontSize: ev.dayLabel === "—" ? 18 : 15, fontWeight: "800" }}>{ev.dayLabel}</Text>
                <Text style={{ color: "rgba(255,255,255,.45)", fontSize: 8 }}>{ev.year}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontSize: 12, fontWeight: "700" }} numberOfLines={1}>{ev.event}</Text>
                <Text style={{ color: T.muted, fontSize: 10 }}>{ev.uni}</Text>
              </View>
              <Text style={{ color: T.muted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerfilScreen;