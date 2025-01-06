<template>
  <div class="developer-todo-app" :class="{ 'dark-mode': isDarkMode }">
    <div class="header">
      <div class="language-switcher">
        <button @click="changeLanguage('en')">English</button>
        <button @click="changeLanguage('fr')">Français</button>
      </div>
      <button @click="toggleDarkMode" class="dark-mode-toggle">
        {{ isDarkMode ? "🌙" : "☀️" }}
      </button>
    </div>
    <h1>{{ $t("appTitle") }}</h1>
    <div class="filters">
      <select v-model="filterPriority" class="filter-input">
        <option value="">{{ $t("filterPriorityPlaceholder") }}</option>
        <option value="High">{{ $t("filterPriorityHigh") }}</option>
        <option value="Medium">{{ $t("filterPriorityMedium") }}</option>
        <option value="Low">{{ $t("filterPriorityLow") }}</option>
      </select>
      <select v-model="filterStatus" class="filter-input">
        <option value="">{{ $t("filterStatusPlaceholder") }}</option>
        <option value="toDo">{{ $t("filterStatusToDo") }}</option>
        <option value="inProgress">{{ $t("filterStatusInProgress") }}</option>
        <option value="done">{{ $t("filterStatusDone") }}</option>
      </select>
      <select v-model="filterDueDate" class="filter-input">
        <option value="">{{ $t("filterDueDatePlaceholder") }}</option>
        <option value="overdue">{{ $t("filterDueDateOverdue") }}</option>
        <option value="today">{{ $t("filterDueDateToday") }}</option>
        <option value="upcoming">{{ $t("filterDueDateUpcoming") }}</option>
      </select>
    </div>
    <div class="board">
      <div
        v-for="column in columns"
        :key="column.id"
        class="column"
        :class="column.class"
      >
        <h2>{{ $t(column.title) }}</h2>
        <draggable
          v-model="column.tasks"
          group="tasks"
          @start="drag = true"
          @end="drag = false"
          class="task-list"
          item-key="id"
        >
          <template #item="{ element }">
            <div
              class="task-card"
              :class="{ 'task-completed': element.completed }"
              v-if="isTaskVisible(element, column.title)"
            >
              <div class="task-header">
                <span class="task-title">{{ element.title }}</span>
                <button @click="toggleComplete(element)" class="complete-btn">
                  {{
                    element.completed ? $t("undoButton") : $t("completeButton")
                  }}
                </button>
              </div>
              <p class="task-description">{{ element.description }}</p>
              <div class="task-footer">
                <span class="task-tag" :class="element.tag">{{
                  $t(element.tag + "Tag")
                }}</span>
                <span
                  class="task-priority"
                  :class="element.priority.toLowerCase()"
                >
                  {{ element.priority }}
                </span>
                <span class="task-due-date" v-if="element.dueDate">
                  📅 {{ formatDate(element.dueDate) }}
                </span>
                <span class="task-assignee" v-if="element.assignee">
                  👤 {{ element.assignee }}
                </span>
                <button @click="deleteTask(element)" class="delete-btn">
                  {{ $t("deleteButton") }}
                </button>
              </div>
              <div class="task-comments">
                <div
                  v-for="(comment, index) in element.comments"
                  :key="index"
                  class="comment"
                >
                  <span class="comment-text">💬 {{ comment }}</span>
                </div>
                <div class="add-comment">
                  <input
                    v-model="element.newComment"
                    :placeholder="$t('taskCommentPlaceholder')"
                    class="comment-input"
                  />
                  <button @click="addComment(element)" class="comment-btn">
                    {{ $t("addCommentButton") }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
        <div class="add-task">
          <input
            v-model="column.newTaskTitle"
            :placeholder="$t('taskTitlePlaceholder')"
            class="task-input"
          />
          <input
            v-model="column.newTaskDescription"
            :placeholder="$t('taskDescriptionPlaceholder')"
            class="task-input"
          />
          <select v-model="column.newTaskTag" class="task-input">
            <option value="bug">{{ $t("bugTag") }}</option>
            <option value="feature">{{ $t("featureTag") }}</option>
            <option value="refactor">{{ $t("refactorTag") }}</option>
          </select>
          <input
            type="date"
            v-model="column.newTaskDueDate"
            class="task-input"
          />
          <select v-model="column.newTaskPriority" class="task-input">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            v-model="column.newTaskAssignee"
            :placeholder="$t('taskAssigneePlaceholder')"
            class="task-input"
          />
          <button @click="addTask(column)" class="add-btn">
            {{ $t("addTaskButton") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import { useI18n } from "vue-i18n";

export default {
  components: {
    draggable,
  },
  setup() {
    const { locale } = useI18n();

    // Load columns from localStorage or initialize with default values
    const columns = ref(
      JSON.parse(localStorage.getItem("todoBoard")) || [
        {
          id: 1,
          title: "toDo",
          class: "todo-column",
          tasks: [],
          newTaskTitle: "",
          newTaskDescription: "",
          newTaskTag: "bug",
          newTaskDueDate: "",
          newTaskPriority: "Medium",
          newTaskAssignee: "",
        },
        {
          id: 2,
          title: "inProgress",
          class: "in-progress-column",
          tasks: [],
          newTaskTitle: "",
          newTaskDescription: "",
          newTaskTag: "bug",
          newTaskDueDate: "",
          newTaskPriority: "Medium",
          newTaskAssignee: "",
        },
        {
          id: 3,
          title: "done",
          class: "done-column",
          tasks: [],
          newTaskTitle: "",
          newTaskDescription: "",
          newTaskTag: "bug",
          newTaskDueDate: "",
          newTaskPriority: "Medium",
          newTaskAssignee: "",
        },
      ]
    );

    // Ensure all tasks have a comments array
    columns.value.forEach((column) => {
      column.tasks.forEach((task) => {
        if (!task.comments) {
          task.comments = []; // Initialize comments array if it doesn't exist
        }
        if (!task.newComment) {
          task.newComment = ""; // Initialize newComment field if it doesn't exist
        }
      });
    });

    // Save columns to localStorage whenever they change
    watch(
      columns,
      (newColumns) => {
        localStorage.setItem("todoBoard", JSON.stringify(newColumns));
      },
      { deep: true } // Deep watch to detect changes in nested objects
    );

    // Dark mode
    const isDarkMode = ref(localStorage.getItem("darkMode") === "true");

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem("darkMode", isDarkMode.value);
    };

    // Filter options
    const filterPriority = ref("");
    const filterStatus = ref("");
    const filterDueDate = ref("");

    // Check if a task should be visible based on filters
    const isTaskVisible = (task, columnTitle) => {
      const today = new Date().toISOString().split("T")[0];
      const dueDate = task.dueDate;

      // Priority filter
      if (filterPriority.value && task.priority !== filterPriority.value) {
        return false;
      }

      // Status filter
      if (
        filterStatus.value &&
        columnTitle.toLowerCase() !== filterStatus.value
      ) {
        return false;
      }

      // Due date filter
      if (filterDueDate.value) {
        if (
          filterDueDate.value === "overdue" &&
          (!dueDate || dueDate >= today)
        ) {
          return false;
        }
        if (filterDueDate.value === "today" && dueDate !== today) {
          return false;
        }
        if (
          filterDueDate.value === "upcoming" &&
          (!dueDate || dueDate <= today)
        ) {
          return false;
        }
      }

      return true;
    };

    const addTask = (column) => {
      if (column.newTaskTitle.trim() === "") return;
      column.tasks.push({
        id: Date.now(),
        title: column.newTaskTitle,
        description: column.newTaskDescription,
        tag: column.newTaskTag,
        dueDate: column.newTaskDueDate,
        priority: column.newTaskPriority,
        assignee: column.newTaskAssignee,
        comments: [], // Ensure comments array is initialized
        newComment: "", // Ensure newComment field is initialized
        completed: false,
      });
      column.newTaskTitle = "";
      column.newTaskDescription = "";
      column.newTaskDueDate = "";
      column.newTaskPriority = "Medium";
      column.newTaskAssignee = "";
    };

    const toggleComplete = (task) => {
      task.completed = !task.completed;
    };

    const deleteTask = (task) => {
      columns.value.forEach((column) => {
        column.tasks = column.tasks.filter((t) => t.id !== task.id);
      });
    };

    const addComment = (task) => {
      if (!task.comments) {
        task.comments = []; // Initialize comments array if it doesn't exist
      }
      if (task.newComment.trim() === "") return;
      task.comments.push(task.newComment);
      task.newComment = "";
    };

    const changeLanguage = (lang) => {
      locale.value = lang;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Format the date as needed
    };

    return {
      columns,
      isDarkMode,
      toggleDarkMode,
      filterPriority,
      filterStatus,
      filterDueDate,
      isTaskVisible,
      addTask,
      toggleComplete,
      deleteTask,
      addComment,
      changeLanguage,
      formatDate,
    };
  },
};
</script>

<style>
/* Light mode (default) */
:root {
  --background-color: #f4f5f7;
  --text-color: #172b4d;
  --column-bg: #ffffff;
  --task-card-bg: #ffffff;
  --task-card-border: transparent;
  --button-bg: #4dabf7;
  --button-hover-bg: #3b8fd9;
  --filter-input-bg: #ffffff;
  --filter-input-border: #ccc;
}

/* Dark mode */
.dark-mode {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --column-bg: #2d2d2d;
  --task-card-bg: #3d3d3d;
  --task-card-border: #4d4d4d;
  --button-bg: #5aac44;
  --button-hover-bg: #49852e;
  --filter-input-bg: #3d3d3d;
  --filter-input-border: #4d4d4d;
}

.developer-todo-app {
  padding: 20px;
  font-family: "Arial", sans-serif;
  background-color: var(--background-color);
  min-height: 100vh;
  color: var(--text-color);
}

h1 {
  text-align: center; /* Center the title */
  color: var(--text-color);
  margin-bottom: 30px;
}

.language-switcher {
  display: flex;
  justify-content: center; /* Center the language switcher buttons */
  gap: 10px; /* Add spacing between buttons */
  margin-bottom: 20px;
}

.language-switcher button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: var(--button-bg);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.language-switcher button:hover {
  background-color: var(--button-hover-bg);
}

.board {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;
}

.column {
  background-color: var(--column-bg);
  border-radius: 8px;
  padding: 15px;
  width: 300px;
  min-height: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.column h2 {
  margin: 0 0 15px;
  color: #ffffff;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.todo-column h2 {
  background-color: #ff6b6b; /* Red for To Do */
}

.in-progress-column h2 {
  background-color: #4dabf7; /* Blue for In Progress */
}

.done-column h2 {
  background-color: #51cf66; /* Green for Done */
}

.task-list {
  min-height: 300px;
}

.task-card {
  background-color: var(--task-card-bg);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--task-card-border);
}

.task-card.task-completed {
  opacity: 0.7;
  text-decoration: line-through;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-weight: bold;
  color: var(--text-color);
}

.task-description {
  color: var(--text-color);
  opacity: 0.8;
  margin: 10px 0;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.task-tag.bug {
  background-color: #ffebe6;
  color: #cf513d;
}

.task-tag.feature {
  background-color: #e3fcef;
  color: #1f845a;
}

.task-tag.refactor {
  background-color: #e9f2ff;
  color: #1d7afc;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.task-priority.high {
  background-color: #ff6b6b;
  color: white;
}

.task-priority.medium {
  background-color: #4dabf7;
  color: white;
}

.task-priority.low {
  background-color: #51cf66;
  color: white;
}

.task-due-date {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
}

.complete-btn,
.delete-btn {
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}

.complete-btn {
  background-color: #5aac44;
  color: white;
}

.delete-btn {
  background-color: #ff5c5c;
  color: white;
}

.add-task {
  margin-top: 10px;
}

.task-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid var(--filter-input-border);
  border-radius: 4px;
  background-color: var(--filter-input-bg);
  color: var(--text-color);
}

.add-btn {
  width: 100%;
  padding: 8px;
  background-color: var(--button-bg);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: var(--button-hover-bg);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-input {
  padding: 8px;
  border: 1px solid var(--filter-input-border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--filter-input-bg);
  color: var(--text-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .board {
    flex-direction: column; /* Stack columns vertically on small screens */
    align-items: center; /* Center columns */
    gap: 20px;
  }

  .column {
    width: 100%; /* Full width for columns on small screens */
    max-width: 400px; /* Limit maximum width */
  }

  .filters {
    flex-direction: column; /* Stack filter inputs vertically */
    align-items: center; /* Center filter inputs */
  }

  .language-switcher {
    flex-direction: column; /* Stack language buttons vertically */
    align-items: center; /* Center language buttons */
  }

  .language-switcher button {
    width: 100%; /* Full width for buttons on small screens */
    max-width: 200px; /* Limit maximum width */
  }
}

.task-assignee {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
}

.task-comments {
  margin-top: 10px;
}

.comment {
  margin-bottom: 5px;
}

.comment-text {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
}

.add-comment {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.comment-input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--filter-input-border);
  border-radius: 4px;
  background-color: var(--filter-input-bg);
  color: var(--text-color);
}

.comment-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: var(--button-bg);
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.comment-btn:hover {
  background-color: var(--button-hover-bg);
}
</style>
