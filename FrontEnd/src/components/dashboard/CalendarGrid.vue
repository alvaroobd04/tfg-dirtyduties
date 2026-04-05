<template>
  <div class="calendar-grid">
    <div v-for="day in 35" :key="day" class="calendar-day">
      <span v-if="day <= 31">{{ day }}</span>
      <template v-for="item in itemsByDay(day)" :key="item.key">
        <div :class="item.kind">{{ item.text }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ items: { type: Array, default: () => [] } })

function itemsByDay(day) {
  return props.items.filter((item) => item.day === day)
}
</script>
