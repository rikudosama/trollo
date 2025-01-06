import { createI18n } from "vue-i18n";

// English translations
const en = {
  appTitle: "Developer To-Do Board",
  toDo: "To Do",
  inProgress: "In Progress",
  done: "Done",
  taskTitlePlaceholder: "Task title",
  taskDescriptionPlaceholder: "Task description",
  addTaskButton: "Add Task",
  completeButton: "Complete",
  undoButton: "Undo",
  deleteButton: "Delete",
  bugTag: "Bug",
  featureTag: "Feature",
  refactorTag: "Refactor",
};

// French translations
const fr = {
  appTitle: "Tableau de tâches pour développeurs",
  toDo: "À faire",
  inProgress: "En cours",
  done: "Terminé",
  taskTitlePlaceholder: "Titre de la tâche",
  taskDescriptionPlaceholder: "Description de la tâche",
  addTaskButton: "Ajouter une tâche",
  completeButton: "Terminer",
  undoButton: "Annuler",
  deleteButton: "Supprimer",
  bugTag: "Bug",
  featureTag: "Fonctionnalité",
  refactorTag: "Refactorisation",
};

// Create the i18n instance
const i18n = createI18n({
  legacy: false, // Enable Composition API Mode
  locale: "en", // Default language
  fallbackLocale: "en", // Fallback language
  messages: { en, fr }, // Translations
});

export default i18n;
