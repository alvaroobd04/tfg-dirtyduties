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
      <input v-model="email" type="email" placeholder="Correo electrónico" />
      <input v-model="password" type="password" placeholder="Contraseña" />
      <button type="submit" class="btn-login" v-on:click="handleLogin" :disabled="loading">
        {{ loading ? "Entrando..." : "Acceder" }}
      </button>

      <p @click="openResetPasswordModal" class="reset-password-link">¿Olvidaste tu contraseña?</p>
      <ResetPasswordModal :isVisible="showResetPasswordModal" @close="closeResetPasswordModal" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="separator">o</div>

      <div class="social-login">
        <button class="btn-social btn-google" @click="goToPrincipal"><span class="icon">G</span>Continuar con Google</button>
        <button class="btn-social btn-facebook" @click="goToPrincipal"><span class="icon">f</span>Continuar con Facebook</button>
        <button class="btn-social btn-apple" @click="goToPrincipal"><span class="icon">🍎</span>Continuar con Apple</button>
      </div>

      <p>¿No tienes cuenta? <RouterLink to="/register">Regístrate</RouterLink></p>
    </div>

    <footer class="footer">© 2025 DirtyDuties - Todos los derechos reservados</footer>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/composables/useAuth.js";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const showForgotModal = ref(false); // Variable reactiva para mostrar el modal de reset
const forgotEmail = ref("");
const forgotEmailError = ref("");
const forgotErrorMessage = ref("");
const forgotLoading = ref(false);
const showSuccessPopup = ref(false);

// Lógica de Login
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

  if (redirect) {
    router.push(redirect);
  } else {
    router.push("/principal");
  }
};

// Función para abrir el modal de olvido de contraseña
const openForgotPasswordModal = () => {
  showForgotModal.value = true;
};

// Función para cerrar el modal de olvido de contraseña
const closeForgotModal = () => {
  showForgotModal.value = false;
};

// Validación de email
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Lógica para el reset de contraseña
const handleForgotPassword = async () => {
  forgotEmailError.value = "";
  forgotErrorMessage.value = "";

  if (!forgotEmail.value || !isValidEmail(forgotEmail.value)) {
    forgotEmailError.value = "Ingresa un correo electrónico válido.";
    return;
  }

  forgotLoading.value = true;

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.value }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "error");
    }

    closeForgotModal();
    showSuccessPopup.value = true;
    setTimeout(() => (showSuccessPopup.value = false), 4000);
  } catch {
    forgotErrorMessage.value = "Ocurrió un error, por favor intenta de nuevo.";
  } finally {
    forgotLoading.value = false;
  }
};
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
.menu-toggle { display: none; font-size: 1.5rem; color: #ffffff; background: none; border: none; cursor: pointer; }
.login-container { margin-top: 3rem; margin-bottom: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
.login-container h2 { text-align: center; margin-bottom: 1.5rem; font-weight: 600; }
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
.forgot-link { display: block; text-align: center; margin-top: 0.75rem; color: #0000FF; text-decoration: underline; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
 
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); width: 90%; max-width: 400px; position: relative; }
.modal-container h3 { text-align: center; margin-bottom: 0.5rem; font-weight: 600; font-size: 1.2rem; }
.modal-subtitle { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
.modal-container input { width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 8px; font-family: 'Montserrat', sans-serif; }
.modal-close { position: absolute; top: 0.75rem; right: 1rem; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666; }
.modal-close:hover { color: #000; }
.input-error { border-color: #d32f2f !important; }
 
/* Popup */
.popup-success { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #344f59; color: #7ff2ec; padding: 0.9rem 1.8rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1100; animation: fadeInUp 0.3s ease; }
@keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
 
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
