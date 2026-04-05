<template>
  <div class="layout">

    <DashboardNavbar
        :active-tab="activeTab"
        :notification-count="notificationCount"
        username="Tú"
        @change-tab="changeTab"
      />

    <!-- BODY (CLAVE) -->
    <div class="body">
    <!-- SIDEBAR -->
    <HouseSidebar
      :houses="houses"
      :current-house="currentHouse"
      @select-house="selectHouse"
      @create-house="openCreateHouse"
      @edit-house="openEditHouse"
      @delete-house="deleteHouse"
      @share-house="shareHouse"
    />
    <EditHouseModal
      v-if="showEditModal"
      :house="selectedHouse"
      @close="showEditModal = false"
      @task-created="handleTaskCreated"
      @task-deleted="handleTaskDeleted"
      @task-updated="handleTaskCreated"
      @house-updated="handleHouseUpdated"
    />
    <CreateHouseModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleHouseCreated"
    />

    <!-- MAIN -->
    <main class="main">
      <!-- MIS TAREAS (EJECUCIONES DEL USUARIO) -->
        <!-- MIS TAREAS (EJECUCIONES DEL USUARIO) -->
      <div v-if="activeTab === 'tareas'" class="card">
        <h2>Mis tareas pendientes</h2>

        <div v-if="!calendar || calendar.length === 0">
          ⏳ Cargando tareas...
        </div>

        <div v-else-if="myExecutions.length === 0">
          🎉 No tienes tareas pendientes
        </div>

        <div v-else class="tasks-container">
          <div
            v-for="e in myExecutions"
            :key="e.id"
            class="task-card"
          >
            <div class="task-info">
              <span class="task-name">{{ e.taskName }}</span>
              <span class="task-date">
                {{ new Date(e.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                }) }}
              </span>
            </div>
            <input
              type="file"
              @change="handleFile($event, e)"
              hidden
              :ref="setFileInputRef(e.id)"
            />
            <button
              v-if="e.estado === 'pendiente'"
              :disabled="loading"
              class="btn-validate"
              @click="openFile(e)"
            >
              {{ loading ? 'Validando...' : 'Validar tarea' }}
            </button>

            <span
              v-else
              :class="[
                'task-status',
                e.validation_result === 'valid' ? 'ok' : 'fail'
              ]"
            >
              {{ e.validation_result === 'valid' ? '✔️ Validada' : '❌ Incorrecta' }}
            </span>
          </div>
        </div>
      </div>
      <!-- EMPTY STATE -->
      <div v-if="activeTab === 'mi-casa' && houses.length === 0" class="empty-state">
        <h2>No tienes ninguna casa todavía</h2>
        <p>Crea tu primera casa para empezar</p>

        <button @click="openCreateHouse" class="btn btn-primary">
          Crear casa
        </button>
      </div>
      <div v-if="activeTab === 'mi-casa' && houses.length > 0">
      <h2 class="house-title">{{ currentHouse?.name }}</h2>

      <div class="grid">
        <!-- TAREAS -->
        <div class="card">
          <h3>Tareas</h3>

          <div class="task-list">
            <div v-for="task in tasks" :key="task.id" class="task-item">
              <span>{{ task.name }}</span>
            </div>
          </div>
        </div>
        <!-- CALENDARIO -->
        <div class="calendar">
          <h3>Calendario</h3>
          <!-- DÍAS DE LA SEMANA -->
          <div class="calendar-header">
            <div v-for="d in ['L','M','X','J','V','S','D']" :key="d">
              {{ d }}
            </div>
          </div>
          <!-- GRID -->
          <div class="calendar-grid">
            <div v-for="(day, i) in calendar" :key="i" class="day">

              <div v-if="day">
                <div class="day-number">{{ day.dayNumber }}</div>

                <div class="executions">
                  <div
                    v-for="(e, i) in day.executions"
                    :key="i"
                    class="execution"
                  >
                    {{ e.taskName }} - {{ e.userName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
    </div>
  </div>
  <div v-if="showToast" class="toast">
    ✅ Código copiado al portapapeles
  </div>
  <div v-if="showValidationModal" class="modal-overlay">
  <div class="modal">
    <h3>Subir prueba de tarea</h3>

    <input type="file" @change="handleFile" />

    <div class="actions">
      <button @click="closeModal">Cancelar</button>

      <button @click="submitValidation" :disabled="loading">
        {{ loading ? 'Validando...' : 'Subir prueba' }}
      </button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/services/api";
import DashboardNavbar from "@/components/layout/DashboardNavbar.vue";
import { useHouseStore } from "@/stores/houseStore";
import { storeToRefs } from "pinia";
import { groupByDay, generateCalendarGrid } from "@/utils/calendar.js";
import HouseSidebar from "@/components/layout/HouseSidebar.vue";
import EditHouseModal from "@/components/layout/EditHouseModal.vue";
import CreateHouseModal from "@/components/layout/CreateHouseModal.vue";
import { useAuthStore } from "@/composables/useAuth.js"

const store = useHouseStore();
const auth = useAuthStore();

const { houses, currentHouse, tasks, calendar } = storeToRefs(store);

const activeTab = ref("mi-casa");
const notificationCount = ref(10);
const copiedHouseId = ref(null);
const showToast = ref(false);
const showCreateModal = ref(false);
const showValidationModal = ref(false);
const selectedExecution = ref(null);
const selectedFile = ref(null);
const loading = ref(false);
const fileInputs = ref({});
const myExecutions = ref([]);

const openValidationModal = (execution) => {
  selectedExecution.value = execution
  showValidationModal.value = true
}

const closeModal = () => {
  showValidationModal.value = false
  selectedFile.value = null
}

const setFileInputRef = (id) => (el) => {
  if (el) {
    fileInputs.value[id] = el
  }
}

const loadMyExecutions = async () => {
  const res = await api.get(`/houses/${currentHouse.value.id}/executions/my-tasks`)
  myExecutions.value = res.data.executions
}

const openFile = (task) => {
  const input = fileInputs.value[task.id]
  input?.click()
}

const handleFile = async (event, task) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)
  formData.append('taskName', task.taskName)

  try {
    const res = await api.post(
      `/houses/executions/${task.id}/validate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

console.log("RESPUESTA BACK:", res.data)

    // RETRY (basado en confidence)
    if (res.data.confidence < 0.5) {
      alert('La IA no está segura, intenta otra foto 📸')
      return
    }

    // VALID
    if (res.data.valid) {
      alert(`Tarea validada ✅ (confianza: ${Math.round(res.data.confidence * 100)}%)`)

      await loadMyExecutions()
      return
    }

    // ❌ INVALID
    alert(`La tarea no está bien hecha ❌ (confianza: ${Math.round(res.data.confidence * 100)}%)`)

  } catch (err) {
    console.error(err)
    alert('Error validando')
  }
}

const submitValidation = async () => {
  if (!selectedFile.value) return

  try {
    loading.value = true

    const formData = new FormData()
    formData.append('image', selectedFile.value)

    await api.post(
      `/executions/${selectedExecution.value.id}/validate`,
      formData
    )

    await loadCalendar(currentHouse.value.id) // o store.loadCalendar
    

    closeModal()

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const selectHouse = (house) => {
  currentHouse.value = house;
}

const openCreateHouse = () => {
    showCreateModal.value = true;
}

const changeTab = (tab) => {
  activeTab.value = tab;
};

const handleHouseCreated = async () => {
  await loadHouses()
}

const handleHouseUpdated = (updatedHouse) => {
  // actualizar lista de casas (sidebar)
  houses.value = houses.value.map(h =>
    h.id === updatedHouse.id
      ? { ...h, name: updatedHouse.nombre }
      : h
  )

  // actualizar casa actual (titulo)
  if (currentHouse.value?.id === updatedHouse.id) {
    currentHouse.value = {
      ...currentHouse.value,
      name: updatedHouse.nombre
    }
  }
}


const deleteHouse = async (house) => {
  if (!house) return

  if (!confirm("¿Seguro que quieres salir de esta casa?")) return

  try {
    await api.delete(`/houses/${house.id}/leave`)

    await loadHouses()

    if (currentHouse.value?.id === house.id) {
      currentHouse.value = houses.value[0] || null
    }

  } catch (err) {
    console.error(err)
  }
}

/* =========================
   INVITACIÓN
========================= */
const shareHouse = async (house) => {
  if (!house) return

  try {
    const res = await api.post(`/houses/${house.id}/invitations`, {
      casa_id: house.id
    })

    const token = res.data.token
    const link = `${window.location.origin}/join/${token}`

    await navigator.clipboard.writeText(link)

    showToast.value = true
    setTimeout(() => showToast.value = false, 2000)

    copiedHouseId.value = house.id
    setTimeout(() => copiedHouseId.value = null, 2000)

  } catch (err) {
    console.error(err)
    alert("Error al generar invitación")
  }
}

/* =========================
   LOAD CASAS
========================= */

async function loadHouses() {
  try {
    const res = await api.get("/houses");
    houses.value = res.data.houses.map(h => ({
      id: h.id,
      name: h.nombre
    }));

    if (houses.value.length > 0) {
    currentHouse.value = houses.value[0]
  } else {
    currentHouse.value = null
  }
  } catch (err) {
    console.error("Error cargando casas", err);
  }
}

/* =========================
   LOAD TASKS
========================= */

async function loadTasks() {
  if (!currentHouse.value) return;

  try {
    const res = await api.get(`/houses/${currentHouse.value.id}/tasks`);

    tasks.value = res.data.tasks.map((t) => ({
      id: t.id,
      name: t.nombre,
    }));
  } catch (err) {
    console.error("Error cargando tareas", err);
  }
}

const handleTaskCreated = async () => {
  await Promise.all([
    loadTasks(),
    loadCalendar()
  ])
}

const handleTaskDeleted = async () => {
  await Promise.all([
    loadTasks(),
    loadCalendar()
  ])
}

/* =========================
   LOAD CALENDAR
========================= */

async function loadCalendar() 
{
  if (!currentHouse.value) return;

  try {
    const res = await api.get(
      `/houses/${currentHouse.value.id}/tasks/calendar`
    );

    const grouped = groupByDay(res.data);
    const now = new Date();
    const days = generateCalendarGrid(now.getFullYear(), now.getMonth());

    calendar.value = days.map((day) => {
      if (!day) return null;
      return {
        date: day.date,
        dayNumber: day.dayNumber,
        executions: (grouped[day.date] || []).map((e) => ({
          id: e.id,
          taskName: e.taskName,
          userName: e.usuario,
          status: e.estado,
        })),
      };
    });
  } catch (err) {
    console.error("Error cargando calendario", err);
  }
}


const showEditModal = ref(false)
const selectedHouse = ref(null)


const openEditHouse = async (house) => {
  try {
      const res = await api.get(`/houses/${house.id}/details`)

      selectedHouse.value = {
        ...res.data,
        tasks: res.data.tasks.map(t => ({
          text: t.nombre,
        }))
      }

      showEditModal.value = true
  } catch (error) {
    console.error(error) 
  }
}


/* =========================
   WATCH CURRENT HOUSE
========================= */

watch(currentHouse, async (newHouse) => {
  if (!newHouse) return;
    if(!auth.isReady)
      auth.init();

  tasks.value = [];
  calendar.value = [];

  await loadTasks();
  await loadCalendar();
  //await store.refreshHouseData();
});

/* =========================
   INIT
========================= */

onMounted(async () => {
  if(!auth.isReady)
      auth.init();

  await loadHouses();
  const res = await api.get(`/houses/${currentHouse.value.id}/executions/my-tasks`)
  myExecutions.value = res.data.executions
  if (houses.value.length > 0) {
    currentHouse.value = houses.value[0]; //dispara el watch
  }
});
</script>

<style scoped>
/* =========================
   LAYOUT GLOBAL
========================= */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* NAVBAR */
.layout > *:first-child {
  flex-shrink: 0;
}

/* BODY */
.body {
  display: flex;
  flex: 1;
  min-height: 0; /* 🔥 CLAVE */
}


/* BODY → SIDEBAR + MAIN */
.body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* =========================
   SIDEBAR
========================= */
.sidebar {
  width: 240px;
  background: #2f4858;
  color: white;
  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 10px;

  height: 100%;
}

.house-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 10px;
  background: #3c6e71;
  color: white;
  cursor: pointer;
  text-align: left;
}

.house-btn.active {
  background: #9ad1d4;
  color: #1d3557;
  font-weight: bold;
}

/* =========================
   MAIN
========================= */
.main {
  flex: 1;
  background: #f5f7fb;

  padding: 20px;

  display: flex;
  flex-direction: column;

  overflow-y: auto;

  min-height: 0; /* 🔥 ULTRA CLAVE */
}

.main > * {
  margin-top: 0px;
}

.main {
  justify-content: flex-start;
}

/* GRID */
.grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* CARD */
.card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
}

/* HEADER */
.topbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.user {
  background: #eaeaea;
  padding: 6px 12px;
  border-radius: 6px;
}

/* TITLE */
.house-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
}

/* GRID */
.house-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
}

/* CARD */
.card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);

  display: flex;
  flex-direction: column;
}

/* =========================
   TAREAS
========================= */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 12px 15px;
  border-radius: 10px;
  background: #f2f4f8;
  margin-bottom: 10px;
}

.badge {
  background: #3c6e71;
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}

/* =========================
   CALENDARIO
========================= */
.calendar{
  margin-top: 30px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day {
  background: #6ec6c4;
  border-radius: 12px;
  padding: 10px;
  min-height: 100px;
}

.execution {
  background: white;
  font-size: 12px;
  padding: 4px;
  border-radius: 6px;
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task {
  font-size: 12px;
  background: white;
  padding: 4px;
  border-radius: 6px;
}
.date {
  font-weight: bold;
}

.event {
  color: #555;
}

.event {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


/* =========================
   POP UP
========================= */
.toast {
  position: fixed;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: #4A6775;
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
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(10px); }
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f4f6f8;
  padding: 12px 16px;
  border-radius: 10px;
  transition: 0.2s;
}

.task-card:hover {
  background: #e9eef2;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-name {
  font-weight: 600;
}

.task-date {
  font-size: 12px;
  color: #666;
}

.btn-validate {
  background: #4caf50;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-validate:hover {
  background: #43a047;
}

.task-status {
  font-weight: bold;
}

.task-status.ok {
  color: #22c55e;
}

.task-status.fail {
  color: #ef4444;
}
</style>