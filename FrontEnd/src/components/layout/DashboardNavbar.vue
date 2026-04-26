<template>
  <header class="navbar">

    <!-- IZQUIERDA -->
    <div class="left">
      <img src="@/assets/logo.png" class="logo" />
      <span class="brand">DirtyDuties</span>
    </div>

    <!-- CENTRO -->
    <nav class="center">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="$emit('change-tab', tab.key)"
      >
        {{ tab.label }}

        <span 
          v-if="tab.key === 'notificaciones' && notificationCount > 0" 
          class="badge"
        >
          {{ notificationCount }}
        </span>
      </button>
    </nav>

    <!-- DERECHA -->
    <div class="right">

      <div v-if="auth.isReady" class="user-menu" @click.stop="toggleMenu">
        👤 {{ username }}
      </div>

      <!-- DROPDOWN -->
      <div v-if="showMenu" class="dropdown">
        <button @click="openProfile">Mi perfil</button>
        <button @click="handleLogout">Cerrar sesión</button>
      </div>

    </div>

    <!-- MODAL PERFIL -->
    <ProfileView 
      v-if="showProfile" 
      @close="showProfile = false" 
    />

  </header>
</template>

<script setup>
import { useAuthStore } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ProfileView from "@/views/ProfileView.vue"

const auth = useAuthStore();
const router = useRouter();
const showProfile = ref(false);
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

defineProps({
  activeTab: String,
  notificationCount: {
    type: Number,
    default: 0
  }
});

const username = computed(() => {
  if (!auth.isReady) return ""
  return auth.user?.user_apodo || "Tú"
})

const tabs = [
  { key: "mi-casa", label: "Mi casa" },
  { key: "tareas", label: "Mis tareas" },
  { key: "calendario", label: "Mi calendario" },
  { key: "notificaciones", label: "Mis notificaciones" }
];

const loading = ref(false);

const openProfile = async () => {
  showProfile.value = true;

  if (!auth.user) {
    await auth.loadProfile();
  }
};

const closeMenu = () => {
  showMenu.value = false
}

onMounted(() => {
  window.addEventListener("click", closeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeMenu)
})

const handleLogout = async () => {
  if (loading.value) return;
  loading.value = true;

  await auth.logout();
  router.push("/login");
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

.user {
  cursor: pointer;
}

.user-menu {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.user-menu:hover {
  background: rgba(255,255,255,0.1);
}
/* CONTENEDOR */
.dropdown {
  position: absolute;
  top: 65px;
  right: 30px;

  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  min-width: 180px;
  z-index: 999;
}

/* BOTONES (igual que añadir casa) */
.dropdown button {
  background: #7ed1c6;
  border: none;

  padding: 10px;
  border-radius: 6px;

  font-weight: bold;
  color: #1f2937;

  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

/* HOVER (como el de tu botón) */
.dropdown button:hover {
  background: #66bfb4;
}

/* LOGOUT (diferenciado pero consistente) */
.dropdown button:last-child {
  background: #e57373;
  color: white;
}

.dropdown button:last-child:hover {
  background: #d9534f;
}

.dropdown {
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>