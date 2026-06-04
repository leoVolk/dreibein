<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />

    <UPageHeader title="Einstellungen" />

    <div class="flex flex-col gap-8 mt-8">
      <UserSettings />
      <AdminSettings v-if="user?.admin" />
      <Changelog />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user } = usePocketbaseAuth();
</script>
