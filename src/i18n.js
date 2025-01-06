import { createI18n } from "vue-i18n";

// English translations
const en = {
  appTitle: "Developer To-Do Board",
  toDo: "To Do",
  inProgress: "In Progress",
  done: "Done",
  taskTitlePlaceholder: "Task title",
  taskDescriptionPlaceholder: "Task description",
  taskAssigneePlaceholder: "Assignee",
  taskCommentPlaceholder: "Add a comment...",
  addTaskButton: "Add Task",
  addCommentButton: "Add Comment",
  completeButton: "Complete",
  undoButton: "Undo",
  deleteButton: "Delete",
  bugTag: "Bug",
  featureTag: "Feature",
  refactorTag: "Refactor",

  // Filtering translations
  filterPriorityPlaceholder: "All Priorities",
  filterPriorityHigh: "High",
  filterPriorityMedium: "Medium",
  filterPriorityLow: "Low",
  filterStatusPlaceholder: "All Statuses",
  filterStatusToDo: "To Do",
  filterStatusInProgress: "In Progress",
  filterStatusDone: "Done",
  filterDueDatePlaceholder: "All Due Dates",
  filterDueDateOverdue: "Overdue",
  filterDueDateToday: "Today",
  filterDueDateUpcoming: "Upcoming",
};

// French translations
const fr = {
  appTitle: "Tableau de tâches pour développeurs",
  toDo: "À faire",
  inProgress: "En cours",
  done: "Terminé",
  taskTitlePlaceholder: "Titre de la tâche",
  taskDescriptionPlaceholder: "Description de la tâche",
  taskAssigneePlaceholder: "Assigné à",
  taskCommentPlaceholder: "Ajouter un commentaire...",
  addTaskButton: "Ajouter une tâche",
  addCommentButton: "Ajouter un commentaire",
  completeButton: "Terminer",
  undoButton: "Annuler",
  deleteButton: "Supprimer",
  bugTag: "Bug",
  featureTag: "Fonctionnalité",
  refactorTag: "Refactorisation",

  // Filtering translations
  filterPriorityPlaceholder: "Toutes les priorités",
  filterPriorityHigh: "Haute",
  filterPriorityMedium: "Moyenne",
  filterPriorityLow: "Basse",
  filterStatusPlaceholder: "Tous les statuts",
  filterStatusToDo: "À faire",
  filterStatusInProgress: "En cours",
  filterStatusDone: "Terminé",
  filterDueDatePlaceholder: "Toutes les dates d'échéance",
  filterDueDateOverdue: "En retard",
  filterDueDateToday: "Aujourd'hui",
  filterDueDateUpcoming: "À venir",
};

// Create the i18n instance
const i18n = createI18n({
  legacy: false, // Enable Composition API Mode
  locale: "en", // Default language
  fallbackLocale: "en", // Fallback language
  messages: { en, fr }, // Translations
});

export default i18n;
