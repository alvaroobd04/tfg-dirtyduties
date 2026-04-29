<template>
  <div class="login-page">
    <header>
      <div class="header-logo">
        <img src="@/assets/logo.png" alt="Logo DirtyDuties" class="logo1" />
        <button class="menu-toggle" aria-label="Toggle menu">☰</button>
      </div>
      <span class="header-title">DirtyDuties</span>
      <RouterLink to="/" class="btn-nav">Salir</RouterLink>
    </header>

    <div class="login-container">
      <h2>Inicia sesión</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Correo electrónico" autocomplete="email" />
        <input v-model="password" type="password" placeholder="Contraseña" autocomplete="current-password" />
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? "Entrando..." : "Acceder" }}
        </button>
      </form>

      <p @click="openResetPasswordModal" class="reset-password-link">¿Olvidaste tu contraseña?</p>
      <ResetPasswordModal :isVisible="showResetPasswordModal" @close="closeResetPasswordModal" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="separator">o</div>

      <div class="social-login">
        <button class="btn-social btn-google" @click="handleGoogleLogin" :disabled="loading">
          <span class="icon">G</span>Continuar con Google
        </button>
        <button class="btn-social btn-apple" @click="handleAppleLogin" :disabled="loading">
          <span class="icon">🍎</span>Continuar con Apple
        </button>
      </div>

      <p>¿No tienes cuenta? <RouterLink to="/register">Regístrate</RouterLink></p>
    </div>

    <footer class="footer">© 2025 DirtyDuties - Todos los derechos reservados</footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/composables/useAuth.js";
import api from "@/services/api.js";
import ResetPasswordModal from "@/components/layout/ResetPasswordModal.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const showResetPasswordModal = ref(false);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;

onMounted(() => {
  if (window.AppleID && APPLE_CLIENT_ID) {
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: window.location.origin + '/login',
      usePopup: true
    });
  }
});

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  errorMessage.value = "";

  const result = await auth.login(email.value, password.value);

  if (!result.success) {
    errorMessage.value = result.message;
    loading.value = false;
    return;
  }

  const redirect = route.query.redirect;
  router.push(redirect || "/principal");
};

const handleGoogleLogin = () => {
  if (!window.google) {
    errorMessage.value = 'Google no disponible, recarga la página e inténtalo de nuevo';
    return;
  }
  if (!GOOGLE_CLIENT_ID) {
    errorMessage.value = 'Login con Google no configurado';
    return;
  }

  errorMessage.value = "";

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      try {
        loading.value = true;
        const res = await api.post('/auth/google', { idToken: response.credential });
        await auth.socialLogin(res.data.accessToken);
        router.push(route.query.redirect || '/principal');
      } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Error al iniciar sesión con Google';
        loading.value = false;
      }
    }
  });

  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn-fallback'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  });
};

const handleAppleLogin = async () => {
  if (!window.AppleID) {
    errorMessage.value = 'Apple Sign In no disponible, recarga la página';
    return;
  }
  if (!APPLE_CLIENT_ID) {
    errorMessage.value = 'Login con Apple no configurado';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = "";

    const response = await window.AppleID.auth.signIn();
    const idToken = response.authorization.id_token;

    const res = await api.post('/auth/apple', { idToken });
    await auth.socialLogin(res.data.accessToken);
    router.push(route.query.redirect || '/principal');
  } catch (err) {
    if (err.error !== 'popup_closed_by_user') {
      errorMessage.value = err.response?.data?.message || 'Error al iniciar sesión con Apple';
    }
    loading.value = false;
  }
};

const openResetPasswordModal = () => { showResetPasswordModal.value = true; };
const closeResetPasswordModal = () => { showResetPasswordModal.value = false; };
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.login-page { margin: 0; font-family: 'Montserrat', sans-serif; background: #f4f4f4; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
header { display: flex; align-items: center; justify-content: space-between; background: #344f59; width: 100%; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.header-logo { display: flex; align-items: center; }
.logo1 { height: 80px; width: auto; object-fit: contain; margin-right: 1rem; }
.header-title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 2px; color: #ffffff; }
.btn-nav, .btn-login, .btn-social { background: #7ff2ec; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; text-decoration: none; color: #000000; font-weight: 600; font-size: 1rem; transition: background 0.2s ease; cursor: pointer; text-transform: uppercase; }
.btn-nav:hover, .btn-login:hover, .btn-social:hover { background: #5ab8b2; }
.btn-nav:hover, .btn-login:disabled, .btn-social:disabled { opacity: 0.6; cursor: not-allowed; }
.menu-toggle { display: none; font-size: 1.5rem; color: #ffffff; background: none; border: none; cursor: pointer; }
.login-container { margin-top: 3rem; margin-bottom: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
.login-container h2 { text-align: center; margin-bottom: 1.5rem; font-weight: 600; }
.login-container form { display: flex; flex-direction: column; }
.login-container input { width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 8px; font-family: 'Montserrat', sans-serif; }
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

.error { color: #d32f2f; background: #fdecea; padding: 10px; border-radius: 6px; font-size: 0.9rem; margin-top: 10px; text-align: center; }

@media (max-width: 768px) {
  header { flex-direction: column; padding: 1rem; }
  .header-logo { width: 100%; justify-content: space-between; align-items: center; }
  .logo1 { height: 40px; }
  .header-title { font-size: 2rem; }
  .btn-nav { margin-top: 1rem; width: 100%; text-align: center; }
  .menu-toggle { display: block; }
}

.reset-password-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}
</style>
