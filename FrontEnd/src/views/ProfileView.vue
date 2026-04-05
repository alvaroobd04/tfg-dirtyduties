<template>
  <div class="profile-page">

    <div class="card">
      <h2>Mi Perfil</h2>

      <div class="info">
        <label>Nombre de usuario</label>
        <p>{{ user?.userId || "Usuario" }}</p>
      </div>

      <div class="info">
        <label>Email</label>
        <p>{{ user?.email || "email@ejemplo.com" }}</p>
      </div>

      <div class="actions">
        <button class="btn">Editar perfil</button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from "@/composables/useAuth";

const auth = useAuthStore();
const user = auth.user;
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 40px;
  background: #f4f4f4;
  min-height: 100vh;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
}

.info {
  margin-top: 20px;
}

label {
  font-weight: bold;
  font-size: 14px;
}

.actions {
  margin-top: 30px;
}

.btn {
  background: #7ed1c6;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}
</style>