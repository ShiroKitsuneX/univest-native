export const buildGoalTodos = (goal) => {
  if (!goal) return [];
  
  return [
    ...(goal.books?.map((book, i) => ({ 
      id: `${goal.id}-${book}`, 
      bookKey: `${goal.id}-${book}`,
      text: `Ler "${book.split(" - ")[0]}"`, 
      type: "book" 
    })) || []),
    { id: `${goal.id}-inscricao`, text: "Fazer inscrição", type: "inscricao" },
    { id: `${goal.id}-taxa`, text: "Pagar taxa de inscrição", type: "taxa" },
  ];
};

export const isTodoCompleted = (todo, readBooks, completedTodos) => {
  if (todo.type === "book") {
    return readBooks[todo.bookKey] === "read";
  }
  return completedTodos[todo.id];
};

export const getTodoStatus = (todo, readBooks, completedTodos) => {
  if (todo.type === "book") {
    return readBooks[todo.bookKey] || "none";
  }
  return completedTodos[todo.id] ? "completed" : "none";
};

export const getUpcomingExam = (goal) => {
  if (!goal?.exams) return null;
  return goal.exams.find(e => e.status === "upcoming");
};

export const getDaysUntilExam = (exam) => {
  if (!exam?.date) return null;
  const target = new Date(exam.date);
  const now = new Date();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
};

export const getGoalProgress = (goalTodos, readBooks, completedTodos) => {
  const total = goalTodos.length;
  if (total === 0) return 0;
  
  const completed = goalTodos.filter(t => {
    if (t.type === "book") {
      return readBooks[t.bookKey] === "read";
    }
    return completedTodos[t.id];
  }).length;
  
  return Math.round((completed / total) * 100);
};