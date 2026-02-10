<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />

    <h2 class="text-2xl">Einstellungen</h2>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
</script>
