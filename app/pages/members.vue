<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Mitglieder', to: '/members' },
      ]"
    />

    <UPageHeader title="Alle Materialien" />
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
</script>
