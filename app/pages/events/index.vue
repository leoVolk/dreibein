<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
        ]"
      />

      <AddEvent @refresh="getEvents()"></AddEvent>
    </div>

    <UCard v-if="events.length">
      <template #header> <h2 class="text-2xl">Läger & Aktionen</h2></template>
      <template #default>
        <div class="flex flex-col gap-4">
          <UTable :data="events" :columns="columns" @select="onSelect">
          </UTable>
        </div>
      </template>
    </UCard>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <AddEvent @refresh="getEvents()"></AddEvent>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          variant="subtle"
          @click="getEvents()"
        ></UButton>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { pb } = usePocketbase();
const router = useRouter();

definePageMeta({
  middleware: ["auth"],
});

const events = ref();

const getEvents = async () => {
  events.value = await pb.collection("events").getFullList({
    requestKey: null,
  });
};

await getEvents();

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beginn",
    accessorKey: "startDate",
    cell: ({ row }) =>
      row.getValue("startDate")
        ? new Date(row.getValue("startDate")).toLocaleDateString()
        : "-",
  },
  {
    header: "Ende",
    accessorKey: "endDate",
    cell: ({ row }) =>
      row.getValue("endDate")
        ? new Date(row.getValue("endDate")).toLocaleDateString()
        : "-",
  },

  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toLocaleDateString(),
  },
  {
    header: "",
    accessorKey: "actions",
  },
];

const onSelect = (e: Event, row: any) => {
  router.push(`/events/${events.value[row.id].id}`);
};
</script>

<style></style>
