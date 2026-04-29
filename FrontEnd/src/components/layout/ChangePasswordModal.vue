<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3>Cambia tu contraseña</h3>
      <p class="subtitle">
        Has iniciado sesión con una contraseña temporal.<br />
        Debes establecer una nueva contraseña para continuar.
      </p>

      <input
        v-model="newPassword"
        type="password"
        placeholder="Nueva contraseña"
        :class="{ 'input-error': errors.newPassword }"
      />
      <p v-if="errors.newPassword" class="error-msg">{{ errors.newPassword }}</p>

      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirmar contraseña"
        :class="{ 'input-error': errors.confirm }"
        @keyup.enter="submit"
      />
      <p v-if="errors.confirm" class="error-msg">{{ errors.confirm }}</p>

      <ul class="rules">
        <li :class="{ ok: checks.length }">Mínimo 8 caracteres</li>
        <li :class="{ ok: checks.upper }">Al menos una mayúscula</li>
        <li :class="{ ok: checks.lower }">Al menos una minúscula</li>
        <li :class="{ ok: checks.number }">Al menos un número</li>
        <li :class="{ ok: checks.special }">Al menos un carácter especial</li>
      </ul>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="btn-submit" :disabled="loading" @click="submit">
        {{ loading ? 'Guardando...' : 'GUARDAR CONTRASEÑA' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import api from '@/services/api.js';
import { useAuthStore } from '@/composables/useAuth.js';

const emit = defineEmits(['done']);
const auth = useAuthStore();

const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');
const errors = reactive({ newPassword: '', confirm: '' });

const checks = computed(() => ({
  length:  newPassword.value.length >= 8,
  upper:   /[A-Z]/.test(newPassword.value),
  lower:   /[a-z]/.test(newPassword.value),
  number:  /[0-9]/.test(newPassword.value),
  special: /[^A-Za-z0-9]/.test(newPassword.value),
}));

const validate = () => {
  if (!checks.value.length)  return 'La contraseña debe tener al menos 8 caracteres';
  if (!checks.value.upper)   return 'Debe contener al menos una mayúscula';
  if (!checks.value.lower)   return 'Debe contener al menos una minúscula';
  if (!checks.value.number)  return 'Debe contener al menos un número';
  if (!checks.value.special) return 'Debe contener al menos un caracter especial';
  return null;
};

const submit = async () => {
  errors.newPassword = '';
  errors.confirm = '';
  errorMsg.value = '';

  const validationError = validate();
  if (validationError) {
    errors.newPassword = validationError;
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errors.confirm = 'Las contraseñas no coinciden.';
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/change-password', { newPassword: newPassword.value });
    auth.mustChangePassword = false;
    emit('done');
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al cambiar la contraseña.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2f4858;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.input-error { border-color: #ef4444; }

.rules {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rules li {
  font-size: 0.82rem;
  color: #999;
  padding-left: 18px;
  position: relative;
}

.rules li::before {
  content: '✕';
  position: absolute;
  left: 0;
  color: #ef4444;
}

.rules li.ok { color: #16a34a; }
.rules li.ok::before { content: '✓'; color: #16a34a; }

.btn-submit {
  background: #7ff2ec;
  color: #000;
  border: none;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) { background: #5ab8b2; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg { color: #ef4444; font-size: 0.85rem; }
</style>
