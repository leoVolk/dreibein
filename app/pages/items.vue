<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Alle Materialien', to: '/items' },
      ]"
    />
    <div>
      <UPageHeader title="Alle Materialien" />
      <div class="mt-8">
        <UInput
          v-model="globalFilter"
          class="w-full mb-4"
          placeholder="Suche..."
          size="xl"
        />
        <UTable
          v-model:column-pinning="columnPinning"
          v-model:expanded="expanded"
          :get-row-id="(row) => row.id"
          loading-color="primary"
          loading-animation="carousel"
          :data="topLevelItems"
          :global-filter="globalFilter"
          sticky
          :columns="columns"
          :meta="meta"
        >
          <template #expand-cell="{ row }">
            <UButton
              v-if="childrenOf(row.original.id).length"
              :icon="
                row.getIsExpanded()
                  ? 'i-lucide-chevron-down'
                  : 'i-lucide-chevron-right'
              "
              color="neutral"
              variant="ghost"
              size="xs"
              @click="row.toggleExpanded()"
            />
          </template>

          <template #description-cell="{ row }">
            <div>{{ row.original.description?.substring(0, 64) || "-" }}</div>
          </template>

          <template #status-cell="{ row }">
            <ItemStatusBadge :status="row.original.status" />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-1 items-center">
              <EditItem :item="row.original" @refresh="refreshItems()" />
              <DeleteConfirmModal
                title="Eintrag löschen"
                confirm-label="Eintrag löschen"
                @confirm="(close) => deleteItem(row.original, close)"
              />
            </div>
          </template>

          <template #expanded="{ row }">
            <div class="bg-neutral-950/20 ml-32">
              <UTable
                :data="childrenOf(row.original.id)"
                :columns="childColumns"
                :meta="meta"
                :ui="{ thead: 'hidden' }"
              >
                <template #description-cell="{ row: child }">
                  <div>
                    {{ child.original.description?.substring(0, 64) || "-" }}
                  </div>
                </template>
                <template #status-cell="{ row: child }">
                  <ItemStatusBadge :status="child.original.status" />
                </template>
                <template #actions-cell="{ row: child }">
                  <div class="flex gap-1 items-center">
                    <EditItem
                      :item="child.original"
                      @refresh="refreshItems()"
                    />
                    <DeleteConfirmModal
                      title="Eintrag löschen"
                      confirm-label="Eintrag löschen"
                      @confirm="(close) => deleteItem(child.original, close)"
                    />
                  </div>
                </template>
              </UTable>
            </div>
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const toastError = useToastError();
const { pb } = usePocketbase();

const { data: items, refresh: refreshItems } = await useAsyncData<any[]>(() =>
  pb.collection("items").getFullList({ requestKey: null }),
);

useRealtimeRefresh("items", refreshItems);

const columnPinning = ref({
  right: ["actions"],
});

const itemColumns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beschreibung",
    accessorKey: "description",
    cell: ({ row }) => row.getValue("description") || "-",
  },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Ausgegeben am",
    accessorKey: "checkout",
    cell: ({ row }) => row.getValue("checkout") || "-",
  },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
  { header: "Status", accessorKey: "status" },
  { header: "", accessorKey: "actions" },
];

const columns: TableColumn<any>[] = [
  { id: "expand", header: "" },
  ...itemColumns,
];
const childColumns: TableColumn<any>[] = itemColumns;

const meta = useItemStatusMeta();
const globalFilter = ref("");
const expanded = ref<Record<string, boolean>>({});

const allItemIds = computed(
  () => new Set((items.value ?? []).map((i: any) => i.id)),
);

const topLevelItems = computed(() =>
  (items.value ?? []).filter(
    (i: any) => !i.parent || !allItemIds.value.has(i.parent),
  ),
);

const childrenOf = (parentId: string): any[] =>
  (items.value ?? []).filter((i: any) => i.parent === parentId);

const deleteItem = async (item: any, close: () => void) => {
  try {
    await pb.collection(Collections.Items).delete(item.id);
    toast.add({ title: "Eintrag gelöscht", icon: "i-lucide-trash" });
    close();
    await refreshItems();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
