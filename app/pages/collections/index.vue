<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Lager Listen', to: '/lists' },
        ]"
      />

      <CreateCollection @refresh="getLists()"></CreateCollection>
    </div>

    <UCard v-if="lists.length">
      <template #header> <h2 class="text-2xl">Alle Listen</h2></template>
      <template #default>
        <UTable @select="onSelect" :data="lists" :columns="columns">
          <template #actions-cell="{ row }">
            <div class="flex gap-1 items-center">
              <EditList @refresh="getLists()" :list="lists[row.id]"></EditList>
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
        <CreateList @refresh="getLists()"></CreateList>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          variant="subtle"
          @click="getLists()"
        ></UButton>
      </template>
    </UEmpty>
  </div>
</template>
<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const router = useRouter();
const { pb } = usePocketbase();
const toast = useToast();

definePageMeta({
  middleware: ["auth"],
});

const lists = ref();

const getLists = async () => {
  lists.value = await pb.collection("lists").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: "refresh_ListsIndex",
    filter: "type != 'default'",
  });
};

await getLists();

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Autor",
    accessorKey: "expand.createdBy.name",
  },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toDateString(),
  },
  {
    header: "Aktualisiert von",
    accessorKey: "expand.updatedBy.name",
  },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toDateString(),
  },

  {
    header: "",
    accessorKey: "actions",
  },
];

const onSelect = (e: Event, row: any) => {
  router.push(`/collections/${lists.value[row.id].id}`);
};

const deleteList = async (row: any, close: any) => {
  await pb.collection("lists").delete(lists.value[row.id].id);

  toast.add({
    title: "Liste gelöscht",
    icon: "i-lucide-trash",
  });

  close();
  await getLists();
};
</script>
