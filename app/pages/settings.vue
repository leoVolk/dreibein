<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
</script>
