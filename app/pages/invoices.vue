<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Rechnungen', to: '/members' },
      ]"
    />

    <div>
      <UPageHeader title="Alle Rechnungen" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
