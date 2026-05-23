<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Listen', to: '/lists' },
        { label: list?.name, to: `/lists/${list?.id}` },
      ]"
    />

    <div v-if="list">
      <UPageHeader>
        <template #headline>
          <div class="flex justify-between w-full items-center gap-4">
            <h1
              class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted"
            >
              {{ list.name }}
            </h1>
            <div class="flex gap-4">
              <CreateItem :list="list!" @refresh="refreshItems()" />
              <DeleteConfirmModal
                title="Liste löschen"
                description="Willst du diese Liste wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden."
                confirm-label="Liste löschen"
                @confirm="deleteList"
              >
                <UButton
                  label="Liste löschen"
                  color="error"
                  icon="i-lucide-trash"
                />
              </DeleteConfirmModal>
            </div>
          </div> </template
      ></UPageHeader>
    </div>

    <UTable
      v-if="items?.length"
      class="mt-8"
      sticky
      v-model:expanded="expanded"
      v-model:column-pinning="columnPinning"
      :get-row-id="(row) => row.id"
      loading-color="primary"
      loading-animation="carousel"
      :data="topLevelItems"
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
        <UTable
          :data="childrenOf(row.original.id)"
          :columns="childColumns"
          :meta="meta"
          sticky
          :ui="{ thead: 'hidden' }"
          :column-pinning="{ right: ['actions'] }"
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
              <EditItem :item="child.original" @refresh="refreshItems()" />
              <DeleteConfirmModal
                title="Eintrag löschen"
                confirm-label="Eintrag löschen"
                @confirm="(close) => deleteItem(child.original, close)"
              />
            </div>
          </template>
        </UTable>
      </template>
    </UTable>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <CreateItem :list="list!" @refresh="refreshItems()" />
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="refreshItems()"
        />
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const toastError = useToastError();
const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);

type Expand = {
  createdBy: UsersResponse;
  updatedBy: UsersResponse;
};

const { data: list, refresh: refreshList } = await useAsyncData(
  () => `list-${id.value}`,
  () =>
    pb.collection(Collections.Lists).getOne<ListsResponse<Expand>>(id.value, {
      expand: "createdBy,updatedBy",
    }),
);

const { data: items, refresh: refreshItems } = await useAsyncData(
  () => `list-items-${id.value}`,
  () =>
    pb.collection(Collections.Items).getFullList<ItemsResponse>({
      filter: `list = "${id.value}"`,
      expand: "category",
      requestKey: null,
    }),
);

useRealtimeRefresh("lists", refreshList);
useRealtimeRefresh("items", refreshItems);

const { columns, childColumns } = useItemColumns();
const meta = useItemStatusMeta();
const expanded = ref<Record<string, boolean>>({});
const columnPinning = ref({ right: ["actions"] });

const { topLevelItems, childrenOf } = useHierarchicalItems(
  computed(() => items.value ?? []),
);

const deleteItem = async (item: ItemsResponse, close: () => void) => {
  try {
    await pb.collection(Collections.Items).delete(item.id);
    toast.add({ title: "Eintrag gelöscht", icon: "i-lucide-trash" });
    close();
    await refreshItems();
  } catch (error: any) {
    toastError(error);
  }
};

const deleteList = async (close: () => void) => {
  if (!list.value) return;

  try {
    await pb.collection(Collections.Lists).delete(list.value.id);
    toast.add({ title: "Liste gelöscht", icon: "i-lucide-trash" });
    close();
    router.push("/lists");
  } catch (error: any) {
    toastError(error);
  }
};
</script>
