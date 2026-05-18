<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Alle Materialien', to: '/items' },
      ]"
    />
    <div>
      <UPageHeader title="Alle Materialien" />
      <div class="mt-8">
        <UInput
          v-model="globalFilter"
          class="w-full mb-4"
          placeholder="Suche..."
          size="xl"
        />
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="items ?? []"
          :global-filter="globalFilter"
          sticky
          :columns="columns"
          :meta="meta"
        >
          <template #description-cell="{ row }">
            <div>{{ row.original.description?.substring(0, 64) || "-" }}</div>
          </template>

          <template #status-cell="{ row }">
            <ItemStatusBadge :status="row.original.status" />
          </template>

          <template #actions-cell="{ row }">
            <DeleteConfirmModal
              title="Eintrag löschen"
              confirm-label="Eintrag löschen"
              @confirm="(close) => deleteItem(items![row.index], close)"
            />
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const toastError = useToastError();
const { pb } = usePocketbase();

const { data: items, refresh: refreshItems } = await useAsyncData<any[]>(() =>
  pb.collection("items").getFullList({ requestKey: null }),
);

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beschreibung",
    accessorKey: "description",
    cell: ({ row }) => row.getValue("description") || "-",
  },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Ausgegeben am",
    accessorKey: "checkout",
    cell: ({ row }) => row.getValue("checkout") || "-",
  },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
  { header: "Status", accessorKey: "status" },
  { header: "", accessorKey: "actions" },
];

const meta = useItemStatusMeta();
const globalFilter = ref("");

const deleteItem = async (item: any, close: () => void) => {
  try {
    await pb.collection("items").delete(item.id);
    toast.add({ title: "Eintrag gelöscht", icon: "i-lucide-trash" });
    close();
    await refreshItems();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
