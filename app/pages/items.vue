<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Alle Materialien', to: '/items' },
      ]"
    />
    <UCard>
      <template #header> <h2 class="text-2xl">Alle Materialien</h2> </template>
      <template #default>
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="items"
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
        </UTable>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { pb } = usePocketbase();

const items = await pb.collection("items").getFullList({ requestKey: null });

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
</script>

<style></style>
