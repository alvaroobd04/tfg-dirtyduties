<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } })
</script>
