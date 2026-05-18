<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
        ]"
      />

      <AddEvent @refresh="refresh()" />
    </div>

    <div v-if="events?.length">
      <UPageHeader title="Läger & Aktionen" />

      <div class="mt-8">
        <UTable :data="events" :columns="columns" @select="onSelect">
          <template #actions-cell="{ row }">
            <DeleteConfirmModal
              title="Event löschen"
              description="Willst du dieses Event wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden."
              confirm-label="Event löschen"
              @confirm="(close) => deleteEvent(row, close)"
            />
          </template>
        </UTable>
      </div>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Es wurden noch keine Läger oder Aktionen angelegt."
    >
      <template #actions>
        <AddEvent @refresh="refresh()" />
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="refresh()"
        />
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { pb } = usePocketbase();
const router = useRouter();
const toast = useToast();

definePageMeta({
  middleware: ["auth"],
});

const { data: events, refresh } = await useAsyncData<any>(() =>
  pb.collection("events").getFullList({
    requestKey: null,
  }),
);

const formatDate = (value: unknown) =>
  value ? new Date(value as string).toLocaleDateString() : "-";

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beginn",
    accessorKey: "startDate",
    cell: ({ row }) => formatDate(row.getValue("startDate")),
  },
  {
    header: "Ende",
    accessorKey: "endDate",
    cell: ({ row }) => formatDate(row.getValue("endDate")),
  },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => formatDate(row.getValue("created")),
  },
  { header: "", accessorKey: "actions" },
];

const deleteEvent = async (row: any, close: () => void) => {
  await pb.collection("events").delete(row.original.id);

  toast.add({
    title: "Event gelöscht",
    icon: "i-lucide-trash",
  });

  close();
  refresh();
};

const onSelect = (_e: Event, row: any) => {
  router.push(`/events/${events.value[row.id].id}`);
};
</script>
