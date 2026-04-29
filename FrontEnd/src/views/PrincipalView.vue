<template>
  <div class="layout">

    <DashboardNavbar
        :active-tab="activeTab"
        :notification-count="notifStore.unreadCount"
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
        <div class="tareas-header">
          <h2>Mis tareas pendientes</h2>
          <button
            v-if="currentHouse?.modo === 'flexible' && !activeVacation"
            class="btn-declare-vacation"
            @click="showVacationModal = true"
          >
            Declarar vacaciones
          </button>
        </div>

        <!-- BANNER VACACIONES ACTIVAS -->
        <div v-if="activeVacation" class="vacation-banner">
          <div class="vacation-banner-info">
            <span class="vacation-icon">🏖</span>
            <div>
              <p class="vacation-title">Vacaciones activas</p>
              <p class="vacation-dates">
                {{ formatShortDate(activeVacation.fecha_inicio) }} — {{ formatShortDate(activeVacation.fecha_fin) }}
              </p>
            </div>
          </div>
          <button class="btn-cancel-vacation" @click="handleCancelVacation">
            Cancelar vacaciones
          </button>
        </div>

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
                {{ new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
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
            <div v-if="e.estado === 'pendiente'" class="task-buttons">
              <button
                :disabled="loading"
                class="btn-validate"
                @click="openFile(e)"
              >
                {{ loading ? 'Validando...' : 'Validar tarea' }}
              </button>
              <button
                v-if="e.tipo !== 'castigo' && currentHouse?.modo === 'flexible' && daysUntil(e.fecha) >= 1"
                class="btn-swap"
                @click="openSwapModal(e)"
              >
                Proponer intercambio
              </button>
            </div>

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
      <!-- ESTADÍSTICAS -->
      <div v-if="activeTab === 'calendario'" class="card stats-view">
        <h2 class="stats-title">Mis estadísticas — {{ mesActual }}</h2>

        <div v-if="houseStats.length === 0" class="empty-state">
          <p>No hay datos para este mes todavía.</p>
        </div>

        <template v-else>
          <!-- Tarjetas resumen del usuario actual -->
          <div v-if="myStats" class="stats-summary">
            <div class="stat-card">
              <span class="stat-value">{{ myStats.completadas }}</span>
              <span class="stat-label">Completadas</span>
            </div>
            <div class="stat-card stat-card--highlight">
              <span class="stat-value">
                {{ cumplimiento(myStats) !== null ? cumplimiento(myStats) + '%' : '—' }}
              </span>
              <span class="stat-label">Cumplimiento</span>
            </div>
            <div class="stat-card stat-card--warn">
              <span class="stat-value">{{ myStats.fallos }}</span>
              <span class="stat-label">Fallos</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ myStats.carga }}</span>
              <span class="stat-label">Carga asignada</span>
            </div>
          </div>

          <!-- Tabla ranking de la casa -->
          <h3 class="stats-subtitle">Ranking de la casa</h3>
          <div class="stats-table-wrap">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Miembro</th>
                  <th>Completadas</th>
                  <th>Fallos</th>
                  <th>% Cumplimiento</th>
                  <th>Carga asignada</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(m, i) in houseStats"
                  :key="m.userId"
                  :class="{ 'stats-row--me': m.userId === auth.user?.user_id }"
                >
                  <td>{{ i + 1 }}</td>
                  <td>{{ m.userApodo }}</td>
                  <td>{{ m.completadas }}</td>
                  <td>{{ m.fallos }}</td>
                  <td>
                    <span v-if="cumplimiento(m) !== null">{{ cumplimiento(m) }}%</span>
                    <span v-else class="stats-na">—</span>
                  </td>
                  <td>{{ m.carga }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- NOTIFICACIONES -->
      <div v-if="activeTab === 'notificaciones'" class="card">
        <div class="notif-header">
          <h2>Mis notificaciones</h2>
          <div class="notif-actions">
            <button
              v-if="showPushBanner"
              class="btn-push"
              @click="requestPush"
            >
              🔔 Activar notificaciones push
            </button>
            <button
              v-if="notifStore.unreadCount > 0"
              class="btn-read-all"
              @click="notifStore.markAllRead()"
            >
              Marcar todo como leído
            </button>
          </div>
        </div>

        <div v-if="notifStore.unreadCount === 0" class="notif-empty">
          No tienes notificaciones pendientes
        </div>

        <div v-else class="notif-list">
          <div
            v-for="n in notifStore.notifications.filter(n => !n.leida)"
            :key="n.id"
            :class="['notif-item', `notif-${n.tipo}`, { 'notif-swap': n.tipo === 'intercambio_propuesta' }]"
            @click="n.tipo !== 'intercambio_propuesta' && openConfirmRead(n)"
          >
            <span class="notif-icon">{{ notifIcon(n.tipo) }}</span>
            <div class="notif-body">
              <p class="notif-msg">{{ n.mensaje }}</p>
              <span class="notif-date">{{ formatDate(n.created_at) }}</span>
              <div v-if="n.tipo === 'intercambio_propuesta' && n.intercambio_id" class="swap-notif-actions">
                <button class="btn-swap-accept" @click.stop="handleAcceptSwap(n)">Aceptar</button>
                <button class="btn-swap-reject" @click.stop="handleRejectSwap(n)">Rechazar</button>
              </div>
            </div>
            <span class="notif-dot" />
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
                    :class="['execution', { castigo: e.tipo === 'castigo' }]"
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
  <ChangePasswordModal
    v-if="auth.mustChangePassword"
    @done="auth.mustChangePassword = false"
  />

  <!-- MODAL CONFIRMAR LEER NOTIFICACIÓN -->
  <div v-if="pendingNotif" class="notif-overlay" @click.self="pendingNotif = null">
    <div class="notif-confirm-modal">
      <p class="notif-confirm-msg">{{ pendingNotif.mensaje }}</p>
      <p class="notif-confirm-question">¿Marcar esta notificación como leída?</p>
      <div class="modal-actions">
        <button class="btn-cancel" @click="pendingNotif = null">Cancelar</button>
        <button class="btn-confirm" @click="doMarkRead">Marcar como leída</button>
      </div>
    </div>
  </div>

  <!-- MODAL DECLARAR VACACIONES -->
  <div v-if="showVacationModal" class="notif-overlay" @click.self="showVacationModal = false">
    <div class="vacation-modal">
      <h3>Declarar vacaciones</h3>
      <p class="vacation-modal-info">
        Las tareas asignadas durante ese periodo se redistribuirán entre tus compañeros.
        Debes declararlas con al menos <strong>14 días de antelación</strong> y el periodo máximo es de <strong>30 días</strong>.
      </p>

      <div class="vacation-form">
        <label>Fecha de inicio</label>
        <input type="date" v-model="vacationStart" :min="minVacationStart" class="vacation-date-input" />

        <label>Fecha de fin</label>
        <input type="date" v-model="vacationEnd" :min="vacationStart || minVacationStart" class="vacation-date-input" />
      </div>

      <p v-if="vacationDuration > 30" class="vacation-error">
        El periodo no puede superar 30 días (actualmente {{ vacationDuration }} días).
      </p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="showVacationModal = false">Cancelar</button>
        <button
          class="btn-confirm"
          :disabled="!vacationStart || !vacationEnd || vacationDuration > 30 || vacationSubmitting"
          @click="submitVacation"
        >
          {{ vacationSubmitting ? 'Guardando...' : 'Confirmar vacaciones' }}
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL PROPONER INTERCAMBIO -->
  <div v-if="showSwapModal" class="notif-overlay" @click.self="closeSwapModal">
    <div class="swap-modal">
      <h3>Proponer intercambio</h3>
      <p class="swap-modal-sub">
        Tu tarea: <strong>{{ swapSourceExec?.taskName }}</strong>
        ({{ swapSourceExec ? formatShortDate(swapSourceExec.fecha) : '' }})
      </p>

      <p class="swap-modal-label">Elige la tarea que quieres a cambio:</p>

      <div v-if="swapLoadingEligible" class="swap-loading">Cargando tareas compatibles...</div>
      <div v-else-if="eligibleExecutions.length === 0" class="swap-empty">
        No hay tareas compatibles disponibles en los próximos 7 días.
      </div>
      <div v-else class="swap-list">
        <div
          v-for="e in eligibleExecutions"
          :key="e.id"
          :class="['swap-option', { selected: selectedSwapExec?.id === e.id }]"
          @click="selectedSwapExec = e"
        >
          <span class="swap-task-name">{{ e.taskName }}</span>
          <span class="swap-task-meta">{{ e.userName }} · {{ formatShortDate(e.fecha) }}</span>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="closeSwapModal">Cancelar</button>
        <button
          class="btn-confirm"
          :disabled="!selectedSwapExec || swapSubmitting"
          @click="submitSwap"
        >
          {{ swapSubmitting ? 'Enviando...' : 'Proponer intercambio' }}
        </button>
      </div>
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
import { ref, onMounted, onUnmounted, watch, computed, toRaw } from "vue";
import api from "@/services/api";
import DashboardNavbar from "@/components/layout/DashboardNavbar.vue";
import { useHouseStore } from "@/stores/houseStore";
import { storeToRefs } from "pinia";
import { groupByDay, generateCalendarGrid } from "@/utils/calendar.js";
import HouseSidebar from "@/components/layout/HouseSidebar.vue";
import EditHouseModal from "@/components/layout/EditHouseModal.vue";
import CreateHouseModal from "@/components/layout/CreateHouseModal.vue";
import ChangePasswordModal from "@/components/layout/ChangePasswordModal.vue";
import { useAuthStore } from "@/composables/useAuth.js"
import { useNotificationsStore } from "@/composables/useNotifications.js"

const store = useHouseStore();
const auth = useAuthStore();
const notifStore = useNotificationsStore();

const { houses, currentHouse, tasks, calendar } = storeToRefs(store);

const activeTab = ref("mi-casa");
const showPushBanner = ref(false);

const formatDate = (raw) => {
  if (!raw) return '';
  return new Date(raw).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const requestPush = async () => {
  const ok = await notifStore.subscribeToPush();
  if (ok) showPushBanner.value = false;
};
const pendingNotif = ref(null);

const openConfirmRead = (n) => {
  pendingNotif.value = n;
};

const doMarkRead = async () => {
  if (!pendingNotif.value) return;
  await notifStore.markRead(pendingNotif.value.id);
  pendingNotif.value = null;
};

/* =========================
   VACACIONES
========================= */
const showVacationModal = ref(false);
const vacationStart = ref('');
const vacationEnd = ref('');
const vacationSubmitting = ref(false);
const activeVacation = ref(null);

const minVacationStart = computed(() => {
  // restricción de 14 días desactivada para pruebas
  return new Date().toLocaleDateString('en-CA');
});

const vacationDuration = computed(() => {
  if (!vacationStart.value || !vacationEnd.value) return 0;
  const s = new Date(vacationStart.value + 'T00:00:00');
  const e = new Date(vacationEnd.value   + 'T00:00:00');
  return Math.floor((e - s) / 86400000) + 1;
});

const loadMyVacation = async () => {
  if (!currentHouse.value) return;
  try {
    const res = await api.get(`/houses/${currentHouse.value.id}/vacations/mine`);
    activeVacation.value = res.data.vacation;
  } catch { activeVacation.value = null; }
};

const submitVacation = async () => {
  vacationSubmitting.value = true;
  try {
    const res = await api.post(`/houses/${currentHouse.value.id}/vacations`, {
      fechaInicio: vacationStart.value,
      fechaFin: vacationEnd.value
    });
    showVacationModal.value = false;
    vacationStart.value = '';
    vacationEnd.value = '';
    await loadMyVacation();
    await loadMyExecutions();
    const n = res.data.executionsReassigned;
    alert(`Vacaciones registradas. ${n > 0 ? `${n} tarea(s) del mes actual reasignadas a tus compañeros.` : 'Las tareas de meses futuros se repartirán automáticamente al inicio de cada mes.'} `);
  } catch (err) {
    alert(err.response?.data?.message || 'Error al declarar vacaciones');
  } finally {
    vacationSubmitting.value = false;
  }
};

const handleCancelVacation = async () => {
  if (!activeVacation.value) return;
  if (!confirm('¿Seguro que quieres cancelar tus vacaciones? Tus tareas pendientes te serán devueltas.')) return;
  try {
    await api.delete(`/houses/${currentHouse.value.id}/vacations/${activeVacation.value.id}`);
    activeVacation.value = null;
    await loadMyExecutions();
  } catch (err) {
    alert(err.response?.data?.message || 'Error al cancelar vacaciones');
  }
};

/* =========================
   INTERCAMBIOS
========================= */
const showSwapModal = ref(false);
const swapSourceExec = ref(null);
const eligibleExecutions = ref([]);
const selectedSwapExec = ref(null);
const swapLoadingEligible = ref(false);
const swapSubmitting = ref(false);

const daysUntil = (fecha) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(fecha + 'T00:00:00');
  return Math.floor((d - today) / 86400000);
};

const formatShortDate = (fecha) =>
  new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

const openSwapModal = async (exec) => {
  swapSourceExec.value = exec;
  selectedSwapExec.value = null;
  eligibleExecutions.value = [];
  showSwapModal.value = true;
  swapLoadingEligible.value = true;
  try {
    const res = await api.get(`/houses/${currentHouse.value.id}/swaps/eligible/${exec.id}`);
    eligibleExecutions.value = res.data.executions;
  } catch (err) {
    console.error(err);
  } finally {
    swapLoadingEligible.value = false;
  }
};

const closeSwapModal = () => {
  showSwapModal.value = false;
  swapSourceExec.value = null;
  selectedSwapExec.value = null;
  eligibleExecutions.value = [];
};

const submitSwap = async () => {
  if (!selectedSwapExec.value || !swapSourceExec.value) return;
  swapSubmitting.value = true;
  try {
    await api.post(`/houses/${currentHouse.value.id}/swaps`, {
      execSolId: swapSourceExec.value.id,
      execDestId: selectedSwapExec.value.id
    });
    closeSwapModal();
    alert('Propuesta de intercambio enviada ✅');
  } catch (err) {
    alert(err.response?.data?.message || 'Error al proponer el intercambio');
  } finally {
    swapSubmitting.value = false;
  }
};

const handleAcceptSwap = async (n) => {
  try {
    await api.put(`/swaps/${n.intercambio_id}/accept`);
    await notifStore.markRead(n.id);
    await notifStore.load(currentHouse.value.id);
    await loadMyExecutions();
  } catch (err) {
    alert(err.response?.data?.message || 'Error al aceptar el intercambio');
  }
};

const handleRejectSwap = async (n) => {
  try {
    await api.put(`/swaps/${n.intercambio_id}/reject`);
    await notifStore.markRead(n.id);
    await notifStore.load(currentHouse.value.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Error al rechazar el intercambio');
  }
};

const notifIcon = (tipo) => {
  if (tipo === 'castigo') return '⚠️';
  if (tipo === 'intercambio_propuesta') return '🔄';
  if (tipo === 'intercambio_aceptado') return '✅';
  if (tipo === 'intercambio_rechazado') return '❌';
  return '🔔';
};

const copiedHouseId = ref(null);
const showToast = ref(false);
const showCreateModal = ref(false);
const showValidationModal = ref(false);
const selectedExecution = ref(null);
const selectedFile = ref(null);
const loading = ref(false);
const fileInputs = ref({});
const myExecutions = ref([]);
const houseStats = ref([]);

const myStats = computed(() =>
  houseStats.value.find(m => m.userId === auth.user?.user_id) ?? null
);

const cumplimiento = (m) => {
  const total = m.completadas + m.fallos;
  return total === 0 ? null : Math.round((m.completadas / total) * 100);
};

const mesActual = computed(() =>
  new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
);

const loadStats = async () => {
  if (!currentHouse.value) return;
  try {
    const res = await api.get(`/houses/${currentHouse.value.id}/stats`);
    houseStats.value = res.data.stats;
  } catch (err) {
    console.error('Error cargando estadísticas', err);
  }
};

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
  if (!currentHouse.value) return;
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

const changeTab = async (tab) => {
  activeTab.value = tab;
  if (tab === 'notificaciones' && currentHouse.value) {
    await notifStore.load(currentHouse.value.id);
  }
  if (tab === 'calendario' && currentHouse.value) {
    await loadStats();
  }
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
      name: h.nombre,
      modo: h.modo
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

const refreshCurrentHouse = () => {
  if (currentHouse.value) {
    currentHouse.value = { ...toRaw(currentHouse.value) }
  }
}

const handleTaskCreated = () => refreshCurrentHouse()
const handleTaskDeleted = () => refreshCurrentHouse()

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
          tipo: e.tipo,
        })),
      };
    });
  } catch (err) {
    console.error("Error cargando calendario", err);
  }
}


const showEditModal = ref(false)
const selectedHouse = ref(null)


const openEditHouse = (house) => {
  selectedHouse.value = house
  showEditModal.value = true
}


/* =========================
   WATCH CURRENT HOUSE
========================= */

watch(currentHouse, async (newHouse, oldHouse) => {
  if (!newHouse) return;
  if (!auth.isReady)
    await auth.init();

  if (!oldHouse || oldHouse.id !== newHouse.id) {
    tasks.value = [];
    calendar.value = [];
  }

  await loadTasks();
  await loadCalendar();
  await loadMyExecutions().catch(() => {});
  await loadMyVacation();
  await notifStore.load(newHouse.id);
  if (activeTab.value === 'calendario') await loadStats();
});

/* =========================
   INIT
========================= */

onMounted(async () => {
  if (!auth.isReady)
    await auth.init();

  await loadHouses();
  if (houses.value.length > 0) {
    currentHouse.value = houses.value[0];
  }

  // notificaciones in-app + SSE
  if (currentHouse.value) await notifStore.load(currentHouse.value.id);
  notifStore.startSSE();

  // service worker + banner push + escuchar mensajes del SW
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NEW_NOTIFICATION' && currentHouse.value) {
        notifStore.load(currentHouse.value.id);
      }
    });
  }
  const alreadySubscribed = await notifStore.isPushSubscribed();
  showPushBanner.value = notifStore.pushSupported && !alreadySubscribed && Notification.permission !== 'denied';
});

onUnmounted(() => {
  notifStore.stopSSE();
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

.execution.castigo {
  background: #fee2e2;
  border-left: 3px solid #ef4444;
  color: #991b1b;
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
  background: #7ff2ec;
  border: none;
  color: #1d3557;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-validate:hover {
  background: #5ececa;
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

/* =========================
   NOTIFICACIONES
========================= */
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.notif-actions {
  display: flex;
  gap: 10px;
}

.btn-push {
  background: #7ff2ec;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.btn-push:hover { background: #5ececa; }

.btn-read-all {
  background: #7ff2ec;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #1d3557;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-read-all:hover { background: #5ececa; }

.notif-empty {
  color: #999;
  text-align: center;
  padding: 30px 0;
  font-size: 14px;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f4f6f8;
  cursor: pointer;
  transition: background 0.2s;
}

.notif-item:hover { background: #e9eef2; }

.notif-item.notif-castigo { background: #fee2e2; border-left: 3px solid #ef4444; }
.notif-item.notif-castigo:hover { background: #fecaca; }

.notif-icon { font-size: 18px; flex-shrink: 0; }

.notif-body { flex: 1; }

.notif-msg { margin: 0; font-size: 14px; color: #1e293b; font-weight: 500; }

.notif-date { font-size: 12px; color: #94a3b8; }

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3c6e71;
  flex-shrink: 0;
}

/* =========================
   VACACIONES
========================= */
.tareas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tareas-header h2 { margin: 0; }

.btn-declare-vacation {
  background: #4A6775;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-declare-vacation:hover { background: #3c5562; }

.vacation-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e0f2fe;
  border-left: 4px solid #0ea5e9;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.vacation-banner-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vacation-icon { font-size: 22px; }

.vacation-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #0369a1;
}

.vacation-dates {
  margin: 0;
  font-size: 13px;
  color: #0284c7;
}

.btn-cancel-vacation {
  background: #e57373;
  border: none;
  color: white;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel-vacation:hover { background: #d9534f; }

.vacation-modal {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vacation-modal h3 { margin: 0; font-size: 18px; color: #1e293b; }

.vacation-modal-info {
  margin: 0;
  font-size: 13px;
  color: #475569;
  background: #f4f6f8;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.6;
}

.vacation-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vacation-form label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.vacation-date-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.vacation-error {
  margin: 0;
  font-size: 13px;
  color: #e57373;
  font-weight: 500;
}

.notif-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.notif-confirm-modal {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notif-confirm-msg {
  font-size: 14px;
  color: #1e293b;
  background: #f4f6f8;
  padding: 12px 14px;
  border-radius: 8px;
  margin: 0;
}

.notif-confirm-question {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f4f6f8;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: background 0.2s;
}

.btn-cancel:hover { background: #e9eef2; }

.btn-confirm {
  background: #7ff2ec;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #1d3557;
  transition: background 0.2s;
}

.btn-confirm:hover { background: #5ececa; }

/* =========================
   BOTÓN INTERCAMBIO (lista tareas)
========================= */
.task-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.btn-swap {
  background: #4A6775;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-swap:hover { background: #3c5562; }

/* =========================
   MODAL INTERCAMBIO
========================= */
.swap-modal {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.swap-modal h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.swap-modal-sub {
  margin: 0;
  font-size: 14px;
  color: #475569;
  background: #f4f6f8;
  padding: 10px 12px;
  border-radius: 8px;
}

.swap-modal-label {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.swap-loading, .swap-empty {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 16px 0;
}

.swap-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}

.swap-option {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f4f6f8;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.swap-option:hover { background: #e9eef2; }

.swap-option.selected {
  border-color: #7ff2ec;
  background: #f0fdfb;
}

.swap-task-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.swap-task-meta {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* =========================
   NOTIFICACIONES INTERCAMBIO
========================= */
.swap-notif-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-swap-accept {
  background: #7ff2ec;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1d3557;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-swap-accept:hover { background: #5ececa; }

.btn-swap-reject {
  background: #e57373;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-swap-reject:hover { background: #d9534f; }

.notif-swap {
  cursor: default;
}

/* ========================= ESTADÍSTICAS ========================= */
.stats-view {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.stats-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d3557;
  margin-bottom: 20px;
  text-transform: capitalize;
}

.stats-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #4A6775;
  margin: 28px 0 12px;
}

.stats-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.stat-card {
  flex: 1 1 120px;
  background: #f5f7fb;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
}

.stat-card--highlight {
  background: #e8f4f3;
  border-color: #7edbd4;
}

.stat-card--warn {
  background: #fef3f2;
  border-color: #f8c1bb;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1d3557;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats-table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-width: 0;
  width: 100%;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.stats-table thead tr {
  background: #4A6775;
  color: #fff;
}

.stats-table th {
  padding: 11px 14px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.stats-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f2f5;
  color: #334155;
}

.stats-table tbody tr:last-child td {
  border-bottom: none;
}

.stats-table tbody tr:hover td {
  background: #f8fafc;
}

.stats-row--me td {
  background: #e8f4f3 !important;
  font-weight: 600;
}

.stats-na {
  color: #94a3b8;
}
</style>