<template>
  <div class="flex flex-col gap-">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />

    <UPageHeader title="Einstellungen" />

    <div class="flex flex-col gap-8 mt-8">
      <UserSettings></UserSettings>
      <AdminSettings v-if="user?.admin"></AdminSettings>
    </div>
  </div>
</template>
<script setup lang="ts">
const { user } = usePocketbaseAuth();
</script>
