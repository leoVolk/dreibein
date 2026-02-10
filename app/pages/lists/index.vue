<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between">
      <UBreadcrumb :items="[{ label: 'Listen', to: '/lists' }]" />

      <div class="flex gap-4">
        <CreateList @refresh="getLists()"></CreateList>
      </div>
    </div>

    <UTable
      @select="onSelect"
      v-if="lists.length"
      :data="lists"
      :columns="columns"
    >
      <template #actions-cell="{ row }">
        <div class="flex gap-1 items-center">
          <EditList @refresh="getLists()" :list="lists[row.id]"></EditList>
        </div>
      </template>
    </UTable>
  </div>
</template>
<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const router = useRouter();
const { pb } = usePocketbase();

definePageMeta({
  middleware: ["auth"],
});

const lists = ref();

const getLists = async () => {
  lists.value = await pb
    .collection("lists")
    .getFullList({ expand: "author", requestKey: "refresh_ListsIndex" });
};

await getLists();

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
  {
    header: "",
    accessorKey: "actions",
  },
];

const onSelect = (e: Event, row: any) => {
  router.push(`/lists/${lists.value[row.id].id}`);
};
</script>
