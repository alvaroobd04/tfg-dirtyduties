<template>
  <header class="navbar">
    <!-- IZQUIERDA -->
    <div class="left">
      <img src="@/assets/logo.png" class="logo" />
      <span class="brand">DirtyDuties</span>
    </div>

    <!-- CENTRO (TABS) -->
    <nav class="center">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="$emit('change-tab', tab.key)"
      >
        {{ tab.label }}

        <!-- NOTIFICACIONES -->
        <span v-if="tab.key === 'notificaciones' && notificationCount > 0" class="badge">
          {{ notificationCount }}
        </span>
      </button>
    </nav>

    <!-- DERECHA -->
    <div class="right">
      <span class="user" @click="goToProfile">👤 {{ username }}</span>

      <button class="logout" @click="handleLogout">
        CERRAR SESIÓN
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const auth = useAuthStore();
const router = useRouter();

defineProps({
  activeTab: String,
  notificationCount: {
    type: Number,
    default: 0
  },
  username: {
    type: String,
    default: "Tú"
  }
});

const tabs = [
  { key: "mi-casa", label: "Mi casa" },
  { key: "tareas", label: "Mis tareas" },
  { key: "calendario", label: "Mi calendario" },
  { key: "notificaciones", label: "Mis notificaciones" }
];

const loading = ref(false);

const handleLogout = async () => {
  if (loading.value) return;
  loading.value = true;

  await auth.logout();
  router.push("/login");
};


const goToProfile = () => {
  router.push("/profile");
};
</script>

<style scoped>
/* =========================
   NAVBAR
========================= */
.navbar {
  height: 70px;
  background: #2f4858;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}

/* IZQUIERDA */
.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 35px;
}

.brand {
  font-weight: bold;
  font-size: 18px;
}

/* CENTRO */
.center {
  display: flex;
  gap: 30px;
}

.tab {
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 15px;
  cursor: pointer;
  position: relative;
  padding: 5px 0;
}

.tab:hover {
  color: white;
}

.tab.active {
  color: white;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #7ed1c6;
  border-radius: 2px;
}

/* BADGE */
.badge {
  background: #ff4d4f;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

/* DERECHA */
.right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user {
  color: #cbd5e1;
}

.logout {
  background: #7ed1c6;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  color: #1f2937;
}
</style>