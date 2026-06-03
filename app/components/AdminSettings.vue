<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <template #header>
        <h3 class="text-xl flex items-center gap-2">
          <UIcon name="i-lucide-shield-user" class="size-6" />
          Admin Einstellungen
        </h3>
      </template>

      <UAccordion :items="accordionItems">
        <template #users><UsersSettings /></template>
        <template #itemcategories><ItemCategoriesSettings /></template>
        <template #namilist><NamiImportSettings /></template>
      </UAccordion>
    </UCard>

    <BackendStatsSettings />
  </div>
</template>

<script lang="ts" setup>
const accordionItems = [
  { label: "Benutzer", icon: "i-lucide-users", slot: "users" },
  {
    label: "Materialkategorien",
    icon: "i-lucide-layers",
    slot: "itemcategories",
  },
  {
    label: "NaMi Mitglieder Import",
    icon: "i-lucide-list-plus",
    slot: "namilist",
  },
];
</script>
