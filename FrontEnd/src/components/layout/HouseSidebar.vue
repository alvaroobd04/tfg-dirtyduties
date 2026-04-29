<template>
    <aside class="sidebar" :class="{ active: sidebarOpen }">
      <h3>Mis Casas</h3>
    <ul class="house-list">
      <li
        v-for="house in houses"
        :key="house.id"
        class="house-item"
        :class="{ active: house.id === currentHouse?.id }"
        @click="$emit('select-house', house)"
      >
        <div class="house-name-row">
          <span class="house-name">{{ house.name }}</span>
          <span :class="['mode-badge', house.modo === 'flexible' ? 'badge-flex' : 'badge-strict']">
            {{ house.modo === 'flexible' ? 'Flexible' : 'Estricto' }}
          </span>
        </div>

        <div class="actions">
          <button @click.stop="$emit('edit-house', house)">✏️</button>
          <button @click.stop="$emit('delete-house', house)">🗑️</button>
          <button @click.stop="$emit('share-house', house)">🔗</button>
        </div>
      </li>
    </ul>
      <button class="add-house-btn" @click="$emit('create-house')">Añadir Casa</button>
    </aside>
</template>

<script setup>
const props = defineProps({
  houses: {
    type: Array,
    default: () => []
  },
  currentHouse: Object
})



defineEmits(['toggle-sidebar', 'select-house', 'create-house', 'edit-house', 'delete-house', 'share-house'])
</script>

<style scoped>

.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  background: #3434;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.sidebar-title {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
}

.add-btn {
  background: #dbab7e;
  border: none;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  cursor: pointer;
  font-weight: bold;
}

.house-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.house-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 12px 14px;
  border-radius: 10px;

  background: #4A6775;
  transition: 0.2s;
  cursor: pointer;
}

.house-item:hover {
  background: #7aabc4;
}

.house-item.active {
  background: #f1f3f5; /* color activo */
}

.house-name {
  font-weight: 500;
  color: #ffff;
}

.house-item.active .house-name {
  color: #000;
}

.house-name-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mode-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.badge-strict {
  background: #f87171;
  color: white;
}

.badge-flex {
  background: #34d399;
  color: white;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions button {
  background: #4f5b62;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.actions button:hover {
  background: #2f3a40;
}

.house-item:not(.active) .actions button {
  background: #80F2E7; /* rojo */
  color: white;
}

.house-item.active .actions button {
  background: #4A6775;
  color: #333;
}

</style>
