<script setup lang="ts">
defineProps<{
  role: "user" | "assistant";
  content: string;
}>();
</script>

<template>
  <div :class="['bubble', role]">
    {{ content }}
  </div>
</template>
