<script setup lang="ts">
import type { Match } from "../types"

defineProps<{
  racket: Match["racket"]
  score: number
  reason: string
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div>
        <h3>{{ racket.name }}</h3>
        <span class="brand">{{ racket.brand }}</span>
      </div>
      <div class="score">{{ score }}<small>/100</small></div>
    </div>
    <p class="reason">{{ reason }}</p>
    <div class="details">
      <span>{{ racket.shape }}</span>
      <span>{{ racket.level }}</span>
      <span>€{{ racket.price }}</span>
    </div>
    <p class="best-for">→ {{ racket.bestFor }}</p>
    <p class="limitation">— {{ racket.limitations }}</p>
  </div>
</template>
