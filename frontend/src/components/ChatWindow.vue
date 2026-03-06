<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { api } from "../api";
import MessageBubble from "./MessageBubble.vue";
import RacketCard from "./RacketCard.vue";
import type { Message, Match } from "../types";

const messages = ref<Message[]>([]);
const matches = ref<Match[]>([]);
const input = ref("");
const loading = ref(false);
const conversationId = ref("");
const done = ref(false);
const chatEnd = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// nextTick lets Vue finish rendering before we scroll, otherwise we land one message short
const scrollToBottom = async () => {
  await nextTick();
  chatEnd.value?.scrollIntoView({ behavior: "smooth" });
};

const addMessage = (role: "user" | "assistant", content: string) => {
  messages.value.push({ role, content });
  scrollToBottom();
};

onMounted(async () => {
  loading.value = true;
  const result = await api.startConversation();
  conversationId.value = result.conversationId;
  addMessage("assistant", result.message);
  loading.value = false;
  inputRef.value?.focus();
});

const send = async () => {
  if (!input.value.trim() || loading.value || done.value) return;

  const userMessage = input.value.trim();
  input.value = "";
  addMessage("user", userMessage);
  loading.value = true;

  const result = await api.sendMessage(conversationId.value, userMessage);
  addMessage("assistant", result.message);

  if (result.readyToMatch) {
    const { matches: racketMatches } = await api.getRecommendations(
      conversationId.value,
    );
    matches.value = racketMatches;
    done.value = true;
  }

  loading.value = false;
  scrollToBottom();
  inputRef.value?.focus();
};
</script>

<template>
  <div class="chat-window">
    <div class="chat">
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :role="msg.role"
        :content="msg.content"
      />
      <div v-if="loading" class="typing"><span /><span /><span /></div>
      <div ref="chatEnd" />
    </div>

    <div v-if="done && matches.length" class="matches">
      <h2>Your recommendations</h2>
      <RacketCard
        v-for="match in matches"
        :key="match.racket.id"
        :racket="match.racket"
        :score="match.score"
        :reason="match.reason"
      />
    </div>

    <div v-if="!done" class="input-row">
      <input
        ref="inputRef"
        v-model="input"
        @keyup.enter="send"
        placeholder="Message PadelFit..."
        :disabled="loading"
      />
      <button @click="send" :disabled="loading">Send</button>
    </div>
  </div>
</template>
