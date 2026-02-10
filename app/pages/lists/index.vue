<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between">
      <UBreadcrumb :items="[{ label: 'Listen', to: '/lists' }]" />

      <div class="flex gap-4">
        <UButton icon="i-lucide-plus">Liste erstellen</UButton>
      </div>
    </div>

    <UTable
      @select="onSelect"
      v-if="lists.length"
      :data="lists"
      :columns="columns"
    ></UTable>
  </div>
</template>
<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();

const { pb } = usePocketbase();

const lists = await pb
  .collection<any>("lists")
  .getFullList({ expand: "author" });

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Autor",
    accessorKey: "expand.author.name",
  },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toDateString(),
  },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toDateString(),
  },
];

const onSelect = (e: Event, row: TableRow<any>) => {
  router.push(`/lists/${lists[row.id as any].id}`);
};
</script>
