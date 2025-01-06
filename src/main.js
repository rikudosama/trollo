import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n"; // Import the i18n configuration

// Create the app and use the i18n plugin
const app = createApp(App);
app.use(i18n); // Register i18n globally
app.mount("#app");
