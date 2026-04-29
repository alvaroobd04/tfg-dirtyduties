<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')">✕</button>
      <h3>Recuperar contraseña</h3>
      <p class="subtitle">Introduce tu correo y te enviaremos una contraseña temporal.</p>

      <input
        v-model="email"
        type="email"
        placeholder="Correo electrónico"
        :class="{ 'input-error': emailError }"
        @keyup.enter="submit"
      />
      <p v-if="emailError" class="error-msg">{{ emailError }}</p>

      <button class="btn-submit" :disabled="loading" @click="submit">
        {{ loading ? 'Enviando...' : 'Enviar contraseña temporal' }}
      </button>

      <div v-if="success" class="success-msg">
        ✅ Si el correo existe, recibirás la contraseña en breve.
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/services/api.js';

defineProps({ isVisible: Boolean });
defineEmits(['close']);

const email = ref('');
const loading = ref(false);
const success = ref(false);
const emailError = ref('');
const errorMsg = ref('');

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const submit = async () => {
  emailError.value = '';
  errorMsg.value = '';
  success.value = false;

  if (!isValidEmail(email.value)) {
    emailError.value = 'Introduce un correo válido.';
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    success.value = true;
    email.value = '';
  } catch {
    errorMsg.value = 'Error al enviar el correo. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #666;
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2f4858;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.input-error {
  border-color: #ef4444;
}

.btn-submit {
  background: #7ff2ec;
  color: #000;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #5ab8b2;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-msg {
  background: #dcfce7;
  color: #166534;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
}
</style>
