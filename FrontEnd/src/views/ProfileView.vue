<template>
  <div class="profile-overlay" @click.self="close">

    <div class="profile-modal">

      <h2>Mi Perfil</h2>

      <!-- LOADING -->
      <div v-if="loading" class="loading">
        Cargando...
      </div>

      <!-- CONTENIDO -->
      <div v-else-if="user" class="profile-content">

        <!-- AVATAR -->
        <div class="avatar">
            {{ user?.nombre?.[0] || "" }}{{ user?.apellidos?.[0] || "" }}
        </div>

        <!-- =========================
             MODO VISUALIZACIÓN
        ========================= -->
        <div v-if="!isEditing">

          <div class="info">
            <label>Nombre</label>
            <p>{{ user?.nombre }} {{ user?.apellidos }}</p>
          </div>

          <div class="info">
            <label>Apodo</label>
            <p>{{ user?.user_apodo }}</p>
          </div>

          <div class="info">
            <label>Email</label>
            <p>{{ user?.email }}</p>
          </div>

        </div>

        <!-- =========================
             MODO EDICIÓN
        ========================= -->
        <div v-else class="edit-form">

          <div class="info">
            <label>Nombre</label>
            <input v-model="form.nombre" />
          </div>

          <div class="info">
            <label>Apellidos</label>
            <input v-model="form.apellidos" />
          </div>

          <div class="info">
            <label>Apodo</label>
            <input v-model="form.user_apodo" />
          </div>

          <div class="info">
            <label>Email</label>
            <input v-model="form.email" />
          </div>

        </div>

      </div>

      <!-- ERROR -->
      <div v-else class="error">
        No se pudo cargar el perfil
      </div>

      <!-- ACCIONES -->
      <div class="actions">

        <!-- MODO NORMAL -->
        <template v-if="!isEditing">
          <button class="btn-cancel" @click="close">Cerrar</button>

          <button class="btn" @click="startEdit">
            Editar perfil
          </button>
        </template>

        <!-- MODO EDICIÓN -->
        <template v-else>
          <button class="btn-cancel" @click="cancelEdit">
            Cancelar
          </button>

          <button class="btn" :disabled="saving" @click="saveProfile">
            {{ saving ? "Guardando..." : "Guardar" }}
          </button>
        </template>

      </div>

    </div>
  </div>
</template>
<script setup>
import { useAuthStore } from "@/composables/useAuth";
import { computed, onMounted, watch, ref } from "vue";
import api from "@/services/api";


const auth = useAuthStore();
const user = computed(() => auth.user);
const isEditing = ref(false)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  nombre: "",
  apellidos: "",
  user_apodo: "",
  email: ""
});

const startEdit = () => {
  isEditing.value = true;

  form.value = {
    nombre: user.value.nombre,
    apellidos: user.value.apellidos,
    user_apodo: user.value.user_apodo,
    email: user.value.email
  };
};

const saveProfile = async () => {
  try {
    const res = await api.put("/auth/profile", form.value);

    auth.user = res.data.user;
    isEditing.value = false;

  } catch (err) {
    console.error("Error actualizando perfil");
  }
};

const emit = defineEmits(["close"]);
console.log(user.value)
const close = () => {
  emit("close");
};

onMounted(async () => {
  if (!auth.user)
    await auth.loadProfile()
})

watch(() => auth.user, (val) => {
  console.log("USER UPDATED:", val)
})
</script>

<style scoped>
/* OVERLAY */
.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999; /* 🔥 CLAVE */
}

/* MODAL */
.profile-modal {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 400px;

  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  text-align: center;
}

/* AVATAR */
.avatar {
  width: 70px;
  height: 70px;
  background: #7ed1c6;
  color: white;
  font-weight: bold;
  font-size: 24px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

/* BOTONES */
.actions {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
}

.btn {
  background: #7ed1c6;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel {
  background: #ccc;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.profile-modal p {
  color: #333;
}

.profile-modal label {
  color: #666;
}
</style>