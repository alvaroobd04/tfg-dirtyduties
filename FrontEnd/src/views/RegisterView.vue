<template>
  <div class="login-page">
    <header>
      <div class="header-logo">
        <img src="@/assets/logo.png" alt="Logo DirtyDuties" class="logo1" />
        <button class="menu-toggle" aria-label="Toggle menu">☰</button>
      </div>
      <span class="header-title">DirtyDuties</span>
      <RouterLink to="/login" class="btn-nav">Salir</RouterLink>
    </header>

    <div class="login-container">
      <h2>Crear cuenta</h2>

      <form @submit.prevent="handleRegister">

        <div class="form-group">
          <label>Nombre</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Tu nombre"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label>Apellidos</label>
          <input
            v-model="apellidos"
            type="text"
            placeholder="Tus apellidos"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label>Apodo</label>
          <input
            v-model="user_apodo"
            type="text"
            placeholder="Ej: juan123"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="ejemplo@correo.com"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="form-control"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? "Creando..." : "Registrarse" }}
        </button>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>
      </form>

      <p class="switch-text">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </div>

    <footer class="footer">© 2025 DirtyDuties - Todos los derechos reservados</footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useAuthStore } from "@/composables/useAuth.js";

const router = useRouter();
const auth = useAuthStore();

const nombre = ref("");
const apellidos = ref("");
const user_apodo = ref("");
const email = ref("");
const password = ref("");

const loading = ref(false);
const errorMessage = ref("");

const handleRegister = async () => {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    // 1. Registro
    await api.post("/auth/register", {
      nombre: nombre.value,
      apellidos: apellidos.value,
      user_apodo: user_apodo.value,
      email: email.value,
      password: password.value
    });

    // 2. Login automático
    await auth.login(email.value, password.value);

    // 3. Redirección
    router.push("/principal");

  } catch (err) {
    console.error(err);

    errorMessage.value =
      err.response?.data?.message || "Error al registrarse";
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.login-page { margin: 0; 
    font-family: 'Montserrat', sans-serif; 
    background: #f4f4f4; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    min-height: 100vh; }

header { display: flex; align-items: center; justify-content: space-between; background: #344f59; width: 100%; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.header-logo { display: flex; align-items: center; }
.logo1 { height: 80px; width: auto; object-fit: contain; margin-right: 1rem; }
.header-title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; color: #ffffff; }
.btn-nav, .btn-login, .btn-social { background: #7ff2ec; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; text-decoration: none; color: #000000; font-weight: 600; font-size: 1rem; transition: background 0.2s ease; cursor: pointer; text-transform: uppercase; }
.btn-nav:hover, .btn-login:hover, .btn-social:hover { background: #5ab8b2; }
.menu-toggle { display: none; font-size: 1.5rem; color: #ffffff; background: none; border: none; cursor: pointer; }

.login-container { margin-top: 3rem; margin-bottom: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
.login-container h2 { text-align: center; margin-bottom: 1.5rem; font-weight: 600; }
.login-container input { width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 8px; font-family: 'Montserrat', sans-serif; }
.login-page h2 { text-align: center; margin-bottom: 1.5rem; 
font-weight: 600; }
.login-page input { width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 8px; font-family: 'Montserrat', sans-serif; }
.btn-login { display: block; width: 100%; margin-top: 1rem; }
.separator { display: flex; align-items: center; text-align: center; margin: 1.5rem 0; color: #777; }
.separator::before, .separator::after { content: ''; flex: 1; border-bottom: 1px solid #ddd; }
.separator::before { margin-right: .5em; }
.separator::after { margin-left: .5em; }
.social-login { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1rem; }
.btn-social { display: flex; align-items: center; justify-content: center; width: 100%; }
.login-container p { text-align: center; margin-top: 1rem; color: #666; }
.login-container p a { color: #0000FF; text-decoration: underline; font-weight: 600; }
.icon { margin-right: 8px; font-size: 1.2rem; }
.footer { margin-top: auto; width: 100%; background: #344f59; padding: 1rem; text-align: center; font-size: 0.8rem; color: #ffffff; }
@media (max-width: 768px) {
  header { flex-direction: column; padding: 1rem; }
  .header-logo { width: 100%; justify-content: space-between; align-items: center; }
  .logo1 { height: 40px; }
  .header-title { font-size: 2rem; }
  .btn-nav { margin-top: 1rem; width: 100%; text-align: center; }
  .menu-toggle { display: block; }
}
.card {
  width: 100%;
  max-width: 360px; /* 👈 clave */
}

.switch-text {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.btn-primary {
  width: 100%;
  padding: 0.8rem;
  font-size: 0.95rem;
}
</style>