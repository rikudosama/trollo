<template>
  <div class="developer-todo-app">
    <div class="language-switcher">
      <button @click="changeLanguage('en')">English</button>
      <button @click="changeLanguage('fr')">Français</button>
    </div>
    <h1>{{ $t("appTitle") }}</h1>
    <div class="filters">
      <select v-model="filterPriority" class="filter-input">
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <select v-model="filterStatus" class="filter-input">
        <option value="">All Statuses</option>
        <option value="toDo">To Do</option>
        <option value="inProgress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <select v-model="filterDueDate" class="filter-input">
        <option value="">All Due Dates</option>
        <option value="overdue">Overdue</option>
        <option value="today">Today</option>
        <option value="upcoming">Upcoming</option>
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
                <button @click="deleteTask(element)" class="delete-btn">
                  {{ $t("deleteButton") }}
                </button>
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
          <button @click="addTask(column)" class="add-btn">
            {{ $t("addTaskButton") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue"; // Removed unused imports
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
        },
      ]
    );

    // Save columns to localStorage whenever they change
    watch(
      columns,
      (newColumns) => {
        localStorage.setItem("todoBoard", JSON.stringify(newColumns));
      },
      { deep: true } // Deep watch to detect changes in nested objects
    );

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
        completed: false,
      });
      column.newTaskTitle = "";
      column.newTaskDescription = "";
      column.newTaskDueDate = "";
      column.newTaskPriority = "Medium";
    };

    const toggleComplete = (task) => {
      task.completed = !task.completed;
    };

    const deleteTask = (task) => {
      columns.value.forEach((column) => {
        column.tasks = column.tasks.filter((t) => t.id !== task.id);
      });
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
      filterPriority,
      filterStatus,
      filterDueDate,
      isTaskVisible,
      addTask,
      toggleComplete,
      deleteTask,
      changeLanguage,
      formatDate,
    };
  },
};
</script>

<style>
.developer-todo-app {
  padding: 20px;
  font-family: "Arial", sans-serif;
  background-color: #f4f5f7;
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: #172b4d;
  margin-bottom: 30px;
}

.board {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;
}

.column {
  background-color: #ffffff;
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
  background-color: #ffffff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
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
  color: #172b4d;
}

.task-description {
  color: #5e6c84;
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
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-btn {
  width: 100%;
  padding: 8px;
  background-color: #5aac44;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #49852e;
}

.language-switcher {
  text-align: right;
  margin-bottom: 20px;
}

.language-switcher button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4dabf7;
  color: white;
  cursor: pointer;
}

.language-switcher button:hover {
  background-color: #3b8fd9;
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
  color: #5e6c84;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
</style>
