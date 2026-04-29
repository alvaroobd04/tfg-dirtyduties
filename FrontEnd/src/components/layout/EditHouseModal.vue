<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <h2>Editar Casa</h2>

      <!-- NOMBRE -->
      <label>Nombre de la Casa</label>
      <input v-model="nombre" class="input" />

      <!-- TAREAS -->
      <h3>Tareas</h3>
      <div class="tasks-table">

  <!-- HEADER -->
  <div class="tasks-header">
    <span>Nombre</span>
    <span>Dificultad</span>
    <span>Periodicidad</span>
    <span></span>
  </div>

      <!-- FILAS -->
      <div v-for="task in tasks" :key="task.id" class="task-row">

  <!-- MODO NORMAL -->
  <template v-if="editingTaskId !== task.id">
    <span>{{ task.nombre }}</span>
    <span>{{ task.dificultad }}</span>
    <span>{{ task.periodicidad }}x/sem</span>

    <div class="task-actions">
      <button @click="startEditTask(task)">✏️</button>
      <button @click="deleteTask(task)">🗑️</button>
    </div>
  </template>

  <!-- MODO EDICIÓN -->
  <template v-else>
    <input v-model="editNombre" />

    <select v-model="editDificultad">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>

    <select v-model="editPeriodicidad">
      <option value="1">1x</option>
      <option value="2">2x</option>
      <option value="3">3x</option>
      <option value="4">4x</option>
    </select>
    <div class="task-actions">
      <button @click="saveTask(task)">💾</button>
      <button @click="editingTaskId = null">❌</button>
    </div>
  </template>

</div>
</div>

      <!-- AÑADIR TAREA -->
    <div class="add-task">
        <input v-model="newTask" placeholder="Escribe una tarea" />

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

        <button @click="addTask">AÑADIR TAREA</button>
    </div>

      <!-- PERSONAS -->
      <h3>Personas</h3>
      <div class="users">
        <div v-for="user in users" :key="user.user_id" class="user-item">
          {{ user.user_apodo }}
        </div>
      </div>

      <!-- BOTONES -->
      <div class="actions">
        <button class="cancel" @click="$emit('close')">CANCELAR</button>
        <button class="save" @click="saveHouseName">
          GUARDAR
        </button>
      </div>

    </div>
  </div>
  <div v-if="showToast" :class="['toast', toastType]">
      <span v-if="toastType === 'success'">✅</span>
      <span v-if="toastType === 'delete'">🗑️</span>
      <span v-if="toastType === 'edit'">✏️</span>

      {{ toastMessage }}
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/services/api.js"

const props = defineProps({
  house: Object
})

const nombre = ref(props.house?.nombre || props.house?.name || "")
const tasks = ref([])
const users = ref([])
const newTask = ref("")
const newDifficulty = ref("")
const newPeriodicity = ref("")
const editingTaskId = ref(null)
const editNombre = ref("")
const editDificultad = ref("")
const editPeriodicidad = ref("")
const showToast = ref(false)
const toastMessage = ref("")
const toastType = ref("success")

const emit = defineEmits(["close", "task-created", "task-deleted", "house-updated"])

onMounted(() => {
  loadHouseDetails()
})

const addTask = async () => {
  if (!newTask.value.trim()) return
  if (!newDifficulty.value || !newPeriodicity.value) {
    alert("Selecciona dificultad y periodicidad")
    return
  }

  try {
    await api.post(
      `/houses/${props.house.id}/tasks`,
      {
        nombre: newTask.value,
        dificultad: Number(newDifficulty.value),
        periodicidad: Number(newPeriodicity.value)
      }
    )

    triggerToast("Tarea añadida correctamente", "success")
    await loadHouseDetails()
    emit("task-created")

    newTask.value = ""
    newDifficulty.value = ""
    newPeriodicity.value = ""

  } catch (err) {
    console.error(err)
    alert("Error al crear tarea")
  }
}

const deleteTask = async (task) => {
  if (!props.house?.id || !task?.id) return
  if (!confirm("¿Eliminar esta tarea?")) return

  try {
    await api.delete(`/houses/${props.house.id}/tasks/${task.id}`)
    triggerToast("Tarea eliminada", "delete")
    await loadHouseDetails()
    emit("task-deleted")

  } catch (err) {
    console.error(err)
    alert("Error al eliminar tarea")
  }
}

const startEditTask = (task) => {
  editingTaskId.value = task.id
  editNombre.value = task.nombre
  editDificultad.value = task.dificultad
  editPeriodicidad.value = task.periodicidad
}

const saveTask = async (task) => {
  if (!editNombre.value.trim()) return

  try {
    await api.put(
      `/houses/${props.house.id}/tasks/${task.id}`,
      {
        nombre: editNombre.value,
        dificultad: Number(editDificultad.value),
        periodicidad: Number(editPeriodicidad.value)
      }
    )

    triggerToast("Tarea actualizada", "edit")
    await loadHouseDetails()
    emit("task-created")
    editingTaskId.value = null

  } catch (err) {
    console.error(err)
    alert("Error al editar tarea")
  }
}

const loadHouseDetails = async () => {
  if (!props.house?.id) return

  try {
    const res = await api.get(`/houses/${props.house.id}/details`)
    const house = res.data

    tasks.value = house.tasks || []
    users.value = house.users || []
    nombre.value = house.nombre || ""
  } catch (err) {
    console.error(err)
  }
}

const triggerToast = (message, type = "success") => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const saveHouseName = async () => {
  if (!nombre.value.trim()) return
  if (!props.house?.id) return

  try {
    await api.put(`/houses/${props.house.id}`, {
      nombre: nombre.value
    })

    triggerToast("Nombre actualizado", "edit")

    emit("house-updated", {
      id: props.house.id,
      nombre: nombre.value
    })

  } catch (err) {
    console.error(err)
    alert("Error al actualizar nombre")
  }
}
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal {
  background: white;
  width: 1000px;
  max-height: 80vh;
  overflow-y: auto;

  padding: 25px;
  border-radius: 12px;
}

.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.tasks-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tasks-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  font-weight: bold;
  padding: 8px;
  border-bottom: 2px solid #ddd;
}

.task-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;

  padding: 10px;
  border-radius: 8px;
  background: #f5f7fb;
}

.task-row:hover {
  background: #e9eef5;
}

.task-actions {
  display: flex;
  gap: 5px;
}

.task-actions button {
  background: #7edbd4;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
}

.add-task {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-task input,
.add-task select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.add-task button {
  background: #7edbd4;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.users {
  margin-top: 10px;
}

.user-item {
  margin-bottom: 5px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-top: 20px;
}

.save {
  background: #7edbd4;
}

.delete {
  background: #db7e7e;
}

.cancel {
  background: #ccc;
}

.toast {
  position: fixed;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  color: white;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px 30px;
  border-radius: 10px;

  box-shadow: 0 4px 10px rgba(0,0,0,0.2);

  font-size: 16px;
  z-index: 999;

  animation: fadeInOut 2s ease;
}


.toast.success {
  background: #4A6775;
}

.toast.delete {
  background: #d9534f;
}

.toast.edit {
  background: #5bc0de;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
  10% { opacity: 1; transform: translate(-50%, -50%); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
}

</style>
