<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Listen', to: '/lists' },
        ]"
      />

      <CreateList @refresh="refresh()"></CreateList>
    </div>

    <UCard variant="subtle" v-if="data">
      <template #header> <h2 class="text-2xl">Alle Listen</h2></template>
      <template #default>
        <UTable @select="onSelect" :data="data" :columns="columns">
          <template #actions-cell="{ row }">
            <div class="flex gap-1 items-center">
              <EditList
                @refresh="refresh()"
                :list="data[row.id as any]"
              ></EditList>
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
      </template>
    </UCard>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <CreateList @refresh="refresh()"></CreateList>
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

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const { pb } = usePocketbase();
const toast = useToast();

const { data, status, pending, error, refresh, clear } =
  await useAsyncData<any>(() =>
    pb.collection("lists").getFullList({
      expand: "createdBy,updatedBy",
      requestKey: null,
    }),
  );

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
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

const onSelect = (e: Event, row: any) => {
  router.push(`/lists/${data.value[row.id].id}`);
};

const deleteList = async (row: any, close: any) => {
  await pb.collection("lists").delete(data.value[0].id);

  toast.add({
    title: "Liste gelöscht",
    icon: "i-lucide-trash",
  });

  close();
  refresh();
};
</script>
