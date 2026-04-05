<template>
  <div class="join-container">
    <div class="card">

      <h2>Unirse a una casa</h2>

      <p v-if="loading">Uniéndote a la casa...</p>

      <p v-if="success" class="success">
        Te has unido correctamente 🎉
      </p>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import { useAuthStore } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  const token = route.params.token;

  // 🔴 SI NO ESTÁ LOGUEADO → REDIRECT A LOGIN
  if (!auth.accessToken) {
    router.push(`/login?redirect=/join/${token}`);
    return;
  }

  try {
    await api.post("/houses/invitations/join", { token });

    success.value = true;

    // Espera 1.5s y redirige
    setTimeout(() => {
      router.push("/principal");
    }, 1500);

  } catch (err) {
    errorMessage.value =
      err.response?.data?.message ||
      "Error al unirse a la casa";

  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f4f4f4;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  text-align: center;
}

.success {
  color: green;
  margin-top: 15px;
}

.error {
  color: #b71c1c;
  background: #fdecea;
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
}
</style>