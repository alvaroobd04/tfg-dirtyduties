<template>
  <div class="form-page">
    <div class="title-container">
      <h1>Formulario para Conocerte Mejor</h1>
    </div>

    <div class="main-container">
      <form class="input-section" @submit.prevent="submitForm">
        <div v-for="step in steps" :key="step.id" class="pregunta" v-show="currentStep === step.id">
          <label :for="step.field">{{ step.label }}</label>

          <input
            v-if="step.type === 'text' || step.type === 'number'"
            :id="step.field"
            :type="step.type"
            v-model="form[step.field]"
            :min="step.min"
            :placeholder="step.placeholder"
            :required="step.required"
          />

          <select v-else-if="step.type === 'select'" :id="step.field" v-model="form[step.field]" :required="step.required">
            <option value="">Selecciona una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>

          <textarea
            v-else
            :id="step.field"
            v-model="form[step.field]"
            :rows="4"
            :placeholder="step.placeholder"
          />

          <button v-if="step.id < steps.length" type="button" @click="nextStep">Siguiente</button>
          <button v-else type="submit">Enviar</button>
        </div>

        <button type="button" class="skip-btn" @click="goPrincipal">Omitir Formulario</button>
      </form>
    </div>

    <footer>
      <p>© 2025 DirtyDuties - Todos los derechos reservados</p>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/styleFormulario.css'

const router = useRouter()
const currentStep = ref(1)
const form = reactive({
  nombre: '',
  edad: '',
  estudiante: '',
  trabaja: '',
  vive_con_estudiantes: '',
  mascotas: '',
  hobbies: '',
  comentarios: ''
})

const steps = [
  { id: 1, field: 'nombre', label: 'Nombre:', type: 'text', required: true },
  { id: 2, field: 'edad', label: 'Edad:', type: 'number', min: 10, required: true },
  { id: 3, field: 'estudiante', label: '¿Eres estudiante?', type: 'select', required: true },
  { id: 4, field: 'trabaja', label: '¿Trabajas actualmente?', type: 'select', required: true },
  { id: 5, field: 'vive_con_estudiantes', label: '¿Vives con estudiantes?', type: 'select', required: true },
  { id: 6, field: 'mascotas', label: '¿Tienes mascotas?', type: 'select', required: false },
  { id: 7, field: 'hobbies', label: '¿Qué hobbies tienes?', type: 'text', placeholder: 'Ej: leer, deporte, música', required: false },
  { id: 8, field: 'comentarios', label: '¿Algo más que quieras contarnos?', type: 'textarea', placeholder: 'Escribe aquí...', required: false }
]

function nextStep() {
  currentStep.value += 1
}

function submitForm() {
  router.push('/principal')
}

function goPrincipal() {
  router.push('/principal')
}
</script>
