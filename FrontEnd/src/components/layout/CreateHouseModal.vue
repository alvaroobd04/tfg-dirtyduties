<template>
  <div class="modal-backdrop">
    <div class="modal">

      <h2>Crear Casa</h2>

      <!-- NOMBRE CASA -->
      <div class="section">
        <label>Nombre de la Casa</label>
        <input v-model="nombreCasa" type="text" />
      </div>

      <!-- TAREAS -->
      <div class="section">
        <h3>Tareas</h3>

        <div class="task-header">
          <span>Nombre</span>
          <span>Dificultad</span>
          <span>Periodicidad</span>
        </div>

        <div class="task-inputs">
          <input v-model="taskNombre" placeholder="Escribe una tarea" />

        <select v-model="newDifficulty">
            <option disabled value="">Dificultad (5 lo más difícil)</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>

        <select v-model="newPeriodicity">
            <option disabled value="">Periodicidad</option>
            <option value="1">1 vez/semana</option>
            <option value="2">2 veces/semana</option>
            <option value="3">3 veces/semana</option>
            <option value="4">4 veces/semana</option>
            <option value="5">5 veces/semana</option>
            <option value="6">6 veces/semana</option>
            <option value="7">7 veces/semana</option>
        </select>

          <button class="btn-add" @click="addTask">
            AÑADIR TAREA
          </button>
        </div>

        <!-- LISTA -->
        <div v-if="tasks.length" class="task-list">
          <div v-for="(t, i) in tasks" :key="i" class="task-item">
            {{ t.nombre }} - {{ t.dificultad }} - {{ t.periodicidad }}
          </div>
        </div>
      </div>

      <!-- MODO DE LA CASA -->
      <div class="section">
        <label>Modo de la casa</label>
        <select v-model="modo" class="modo-select">
          <option value="estricto">Modo estricto</option>
          <option value="flexible">Modo flexible</option>
        </select>
        <p class="modo-desc" v-if="modo === 'estricto'">
          <strong>Modo estricto:</strong> si una tarea no se completa antes de su fecha límite, el sistema genera automáticamente una tarea de castigo para el responsable.
        </p>
        <p class="modo-desc" v-else>
          <strong>Modo flexible:</strong> los miembros pueden proponer intercambios de tareas entre sí (hasta el día antes de la fecha límite). Si el intercambio no se acepta o la tarea sigue sin hacerse, se aplica el castigo igualmente.
        </p>
      </div>

      <!-- BOTONES -->
      <div class="actions">
        <button class="btn-cancel" @click="$emit('close')">
          CANCELAR
        </button>

        <button class="btn-save" @click="handleCreate" :disabled="loading">
          {{ loading ? "CREANDO..." : "CREAR CASA" }}
        </button>
      </div>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/services/api";

const emit = defineEmits(["close", "created"]);

const nombreCasa = ref("");
const modo = ref("estricto");

const taskNombre = ref("");
const newDifficulty = ref("");
const newPeriodicity = ref("");

const tasks = ref([]);
const nombre = null;

const loading = ref(false);
const errorMessage = ref("");

const addTask = () => {
if (!taskNombre.value || !newDifficulty.value || !newPeriodicity.value) {
  return;
}

  tasks.value.push({
    nombre: taskNombre.value,
    dificultad: Number(newDifficulty.value),
    periodicidad: Number(newPeriodicity.value)
  });


};

const handleCreate = async () => {

  loading.value = true;
  errorMessage.value = "";

  try {
    // 1. Crear casa
    const res = await api.post("/houses/create", {
      nombre: nombreCasa.value,
      modo: modo.value,
      tasks: tasks.value
    });

    const houseId = res.data.house?.id;
    emit("created");
    emit("close");

    taskNombre.value = "";
    newDifficulty.value = "";
    newPeriodicity.value = "";

  } catch (err) {
      console.error(err);

  errorMessage.value =
    err.response?.data?.message ||
    "Error al crear la casa";

  } finally {
    loading.value = false;
  }
};
</script><style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);

  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 14px;
  width: 600px;
}

.section {
  margin-top: 20px;
}

.task-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  font-weight: bold;
  margin-bottom: 10px;
}

.task-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
}

.task-list {
  margin-top: 15px;
}

.task-item {
  background: #f2f4f8;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 5px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.btn-add {
  background: #7ff2ec;
}

.btn-save {
  background: #7ff2ec;
}

.btn-cancel {
  background: #ccc;
}

.modo-select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-top: 6px;
}

.modo-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #555;
  background: #f4f6f8;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.5;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>