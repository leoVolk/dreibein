<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Listen', to: '/lists' },
        ]"
      />
    </div>

    <div v-if="data?.length">
      <UPageHeader>
        <template #headline>
          <div class="flex justify-between w-full items-center gap-4">
            <h1
              class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted"
            >
              Material Listen
            </h1>
            <CreateList @refresh="refresh()" />
          </div>
        </template>
      </UPageHeader>

      <UTable class="mt-8" :data="data" :columns="columns" @select="onSelect">
        <template #actions-cell="{ row }">
          <div class="flex gap-1 items-center">
            <EditList :list="data[row.id as any]" @refresh="refresh()" />
            <DeleteConfirmModal
              title="Liste löschen"
              description="Willst du diese Liste wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden."
              confirm-label="Liste löschen"
              @confirm="(close) => deleteList(row, close)"
            />
          </div>
        </template>
      </UTable>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Es wurden noch keine Listen angelegt."
    >
      <template #actions>
        <CreateList @refresh="refresh()" />
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

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const { data, refresh } = await useAsyncData<any>(() =>
  pb.collection("lists").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: null,
  }),
);

useRealtimeRefresh("lists", refresh);

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Autor", accessorKey: "expand.createdBy.name" },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toLocaleDateString(),
  },
  { header: "Aktualisiert von", accessorKey: "expand.updatedBy.name" },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toLocaleDateString(),
  },
  { header: "", accessorKey: "actions" },
];

const onSelect = (_e: Event, row: any) => {
  router.push(`/lists/${data.value[row.id].id}`);
};

const deleteList = async (row: any, close: () => void) => {
  try {
    await pb.collection("lists").delete(row.original.id);
    toast.add({ title: "Liste gelöscht", icon: "i-lucide-trash" });
    close();
    refresh();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
