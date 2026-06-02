<template>
  <div class="flex flex-col gap-4 pb-4">
    <div class="flex justify-end">
      <CreateItemCategory @refresh="getItemCategories()" />
    </div>

    <UTable
      v-if="itemCategories.length"
      v-model:column-pinning="columnPinning"
      :data="itemCategories"
      :columns="columns"
      sticky
    >
      <template #actions-cell="{ row }">
        <div class="flex gap-1 items-center">
          <EditItemCategory :category="row.original" @refresh="getItemCategories()" />
          <DeleteConfirmModal
            title="Kategorie löschen"
            :description="`Soll die Kategorie ${row.original.name} wirklich gelöscht werden?`"
            confirm-label="Kategorie löschen"
            @confirm="(close: () => void) => onDeleteItemCategory(row, close)"
          />
        </div>
      </template>
    </UTable>

    <UEmpty v-else icon="i-lucide-layers" size="sm" description="Noch keine Kategorien angelegt." />
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const columnPinning = ref({ right: ["actions"] });
const itemCategories = ref<ItemcategoriesResponse[]>([]);

const columns: TableColumn<ItemcategoriesResponse>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "", accessorKey: "actions" },
];

const getItemCategories = async () => {
  if (!user.value?.admin) return;
  itemCategories.value = await pb
    .collection(Collections.Itemcategories)
    .getFullList<ItemcategoriesResponse>({ sort: "name" });
};

await getItemCategories();

useRealtimeRefresh(Collections.Itemcategories, getItemCategories);

const onDeleteItemCategory = async (row: any, close: () => void) => {
  try {
    await pb.collection(Collections.Itemcategories).delete(row.original.id);
    toast.add({ title: "Kategorie gelöscht", icon: "i-lucide-trash" });
    close();
    await getItemCategories();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
