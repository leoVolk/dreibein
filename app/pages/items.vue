<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Alle Materialien', to: '/items' },
      ]"
    />
    <UCard variant="subtle">
      <template #header> <h2 class="text-2xl">Alle Materialien</h2> </template>
      <template #default>
        <UInput
          v-model="globalFilter"
          class="w-full mb-4"
          placeholder="Suche..."
        />
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="items"
          :global-filter="globalFilter"
          sticky
          :columns="columns"
        >
          <template #description-cell="{ row }">
            <div class="">
              {{ row.original.description.substring(0, 64) }}
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge v-if="row.original.status === 'none'" color="success">
              Intakt
            </UBadge>
            <UBadge
              v-else-if="row.original.status === 'checkedOut'"
              color="info"
            >
              In Benutzung
            </UBadge>
            <UBadge
              v-else-if="row.original.status === 'repair'"
              color="warning"
            >
              In Reparatur
            </UBadge>
            <UBadge v-else color="error"> Beschädigt </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <UModal title="Eintrag löschen">
              <UButton
                variant="ghost"
                size="sm"
                color="error"
                icon="i-lucide-trash"
              />

              <template #body>
                <p>
                  Willst du diesen Eintrag wirklich löschen? Diese Aktion kann
                  nicht mehr rückgängig gemacht werden.
                </p>
              </template>

              <template #footer="{ close }">
                <div class="flex w-full justify-between gap-2">
                  <UButton
                    color="neutral"
                    variant="outline"
                    label="Abbrechen"
                    @click="close"
                  />
                  <UButton
                    color="error"
                    variant="outline"
                    label="Eintrag löschen"
                    @click="deleteItem(items[row.index], close)"
                  />
                </div>
              </template>
            </UModal>
          </template>
        </UTable>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const toast = useToast();
const { pb } = usePocketbase();

const { data: items, refresh: refreshItems } = await useAsyncData<any>(() =>
  pb.collection("items").getFullList({ requestKey: null }),
);

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beschreibung",
    accessorKey: "description",
    cell: ({ row }) => `${row.getValue("description") || "-"} `,
  },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Ausgegeben am",
    accessorKey: "checkout",
    cell: ({ row }) => `${row.getValue("checkout") || "-"} `,
  },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
  { header: "Status", accessorKey: "status" },
  { header: "", accessorKey: "actions" },
];

const globalFilter = ref("");

const deleteItem = async (item: any, close: any) => {
  await pb.collection("items").delete(item.id);

  toast.add({
    title: "Eintrag gelöscht",
    icon: "i-lucide-trash",
  });

  close();

  await refreshItems();
};
</script>

<style></style>
