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
          <UTable :data="events" :columns="columns"> </UTable>
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
import { CalendarDate } from "@internationalized/date";

const { pb } = usePocketbase();

definePageMeta({
  middleware: ["auth"],
});

const events = ref();

const getEvents = async () => {
  events.value = await pb.collection("events").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: null,
  });
};

await getEvents();

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beginn",
    accessorKey: "startDate",
    cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
  },
  {
    header: "Ende",
    accessorKey: "endDate",
    cell: ({ row }) => new Date(row.getValue("endDate")).toLocaleDateString(),
  },
  {
    header: "Autor",
    accessorKey: "expand.createdBy.name",
  },

  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toLocaleDateString(),
  },
  {
    header: "Aktualisiert von",
    accessorKey: "expand.updatedBy.name",
  },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toLocaleDateString(),
  },

  {
    header: "",
    accessorKey: "actions",
  },
];

const calenderEntries = shallowRef(
  events.value.map((e: any) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return {
      start: new CalendarDate(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      ),
      end: new CalendarDate(end.getFullYear(), end.getMonth(), end.getDate()),
    };
  }),
);
</script>

<style></style>
