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
              <MoveItem :item="row.original" @refresh="refreshItems()" />
              <DeleteConfirmModal
                title="Eintrag löschen"
                confirm-label="Eintrag löschen"
                @confirm="(close) => deleteItem(row.original, close)"
              />
            </div>
          </template>

          <template #expanded="{ row }">
            <div class="lg:pl-32 pl-16">
              <UTable
                :data="childrenOf(row.original.id)"
                :columns="childColumns"
                :meta="meta"
                sticky
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
definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const toastError = useToastError();
const { pb } = usePocketbase();

const { data: items, refresh: refreshItems } = await useAsyncData<any[]>(() =>
  pb.collection("items").getFullList({
    filter: 'list != ""',
    expand: "category",
    requestKey: null,
  }),
);

useRealtimeRefresh("items", refreshItems);

const columnPinning = ref({ right: ["actions"] });
const { columns, childColumns } = useItemColumns();
const meta = useTableMeta();
const globalFilter = ref("");
const expanded = ref<Record<string, boolean>>({});

const { topLevelItems, childrenOf } = useHierarchicalItems(
  computed(() => items.value ?? []),
);

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
