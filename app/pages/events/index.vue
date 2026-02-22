<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
        ]"
      />

      <AddEvent @refresh="refresh()"></AddEvent>
    </div>

    <UCard variant="subtle" v-if="events.length">
      <template #header> <h2 class="text-2xl">Läger & Aktionen</h2></template>
      <template #default>
        <div class="flex flex-col gap-4">
          <UTable :data="events" :columns="columns" @select="onSelect">
            <template #actions-cell="{ row }">
              <div class="flex gap-2">
                <UModal title="Liste löschen">
                  <UButton
                    size="sm"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash"
                  />

                  <template #body>
                    <p>
                      Willst du diesen Liste wirklich löschen? Diese Aktion kann
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
                        label="Liste löschen"
                        @click="deleteList(row, close)"
                      />
                    </div>
                  </template>
                </UModal>
              </div>
            </template>
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
        <AddEvent @refresh="refresh()"></AddEvent>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          variant="subtle"
          @click="refresh()"
        ></UButton>
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

const deleteList = async (row: any, close: any) => {
  await pb.collection("events").delete(row.original.id);

  toast.add({
    title: "Event gelöscht",
    icon: "i-lucide-trash",
  });

  close();
  refresh();
};

const onSelect = (e: Event, row: any) => {
  router.push(`/events/${events.value[row.id].id}`);
};
</script>

<style></style>
