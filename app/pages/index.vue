<template>
  <div>
    <span class="text-">Good Day {{ user?.name }}</span>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user } = usePocketbaseAuth();
</script>
