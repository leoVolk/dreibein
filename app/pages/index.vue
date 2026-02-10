<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb :items="[{ label: 'Home', to: '/' }]" />
    <div>
      <h2 class="text-2xl">
        Hallo, <span class="text-primary underline">{{ user?.name }}</span
        >!
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user } = usePocketbaseAuth();
</script>
