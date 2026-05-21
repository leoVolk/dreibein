<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex lg:justify-between lg:items-center flex-col lg:flex-row gap-4"
    >
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: 'Listen', to: `/events/${route.params.id}` },
          { label: list?.name },
        ]"
      />

      <div class="flex gap-4">
        <AddEventItem :list="list!" @refresh="refreshList()" />
        <DeleteConfirmModal
          title="Liste löschen"
          description="Willst du diese Liste wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden."
          confirm-label="Liste löschen"
          @confirm="deleteList"
        >
          <UButton label="Liste löschen" color="error" icon="i-lucide-trash" />
        </DeleteConfirmModal>
      </div>
    </div>

    <UCard v-if="list?.expand?.items?.length">
      <template #header>
        <div>
          <h2 class="text-2xl">{{ list.name }}</h2>
        </div>
      </template>
      <template #default>
        <UTable
          v-model:expanded="expanded"
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
              :icon="row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
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
              <EditItem
                :item="row.original"
                :list-id="list?.id"
                @refresh="refreshList()"
              />
              <DeleteConfirmModal
                title="Eintrag entfernen"
                description="Willst du diesen Eintrag wirklich aus der Liste entfernen?"
                confirm-label="Entfernen"
                @confirm="(close) => removeItem(row.original, close)"
              />
            </div>
          </template>

          <template #expanded="{ row }">
            <UTable
              :data="childrenOf(row.original.id)"
              :columns="childColumns"
              :meta="meta"
            >
              <template #description-cell="{ row: child }">
                <div>{{ child.original.description?.substring(0, 64) || "-" }}</div>
              </template>
              <template #status-cell="{ row: child }">
                <ItemStatusBadge :status="child.original.status" />
              </template>
              <template #actions-cell="{ row: child }">
                <div class="flex gap-1 items-center">
                  <EditItem
                    :item="child.original"
                    :list-id="list?.id"
                    @refresh="refreshList()"
                  />
                  <DeleteConfirmModal
                    title="Eintrag entfernen"
                    description="Willst du diesen Eintrag wirklich aus der Liste entfernen?"
                    confirm-label="Entfernen"
                    @confirm="(close) => removeItem(child.original, close)"
                  />
                </div>
              </template>
            </UTable>
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
        <AddEventItem :list="list!" @refresh="refreshList()" />
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="refreshList()"
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

const toast = useToast();
const toastError = useToastError();
const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();
const { user } = usePocketbaseAuth();

type Expand = {
  items: ItemsResponse[];
};

const { data: list, refresh: refreshList } = await useAsyncData(
  () => `eventlist-${route.params.listId}`,
  () =>
    pb
      .collection(Collections.Eventlists)
      .getOne<EventlistsResponse<Expand>>(route.params.listId as string, {
        expand: "items",
      }),
);

useRealtimeRefresh(["eventlists", "items"], refreshList);

const itemColumns: TableColumn<ItemsRecord>[] = [
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

const columns: TableColumn<ItemsRecord>[] = [{ id: "expand", header: "" }, ...itemColumns];
const childColumns: TableColumn<ItemsRecord>[] = itemColumns;

const meta = useItemStatusMeta();

const expanded = ref<Record<string, boolean>>({});

const listItemIds = computed(
  () => new Set((list.value?.expand?.items ?? []).map((i) => i.id)),
);

const topLevelItems = computed(() =>
  (list.value?.expand?.items ?? []).filter(
    (i) => !i.parent || !listItemIds.value.has(i.parent),
  ),
);

const childrenOf = (parentId: string): ItemsResponse[] =>
  (list.value?.expand?.items ?? []).filter((i) => i.parent === parentId);

const removeItem = async (item: ItemsResponse, close: () => void) => {
  if (!list.value) return;

  try {
    await pb.collection(Collections.Eventlists).update(list.value.id, {
      updatedBy: user.value?.id,
      items: (list.value.items ?? []).filter((i) => i !== item.id),
    });

    toast.add({ title: "Eintrag entfernt", icon: "i-lucide-trash" });
    close();
    await refreshList();
  } catch (error: any) {
    toastError(error);
  }
};

const deleteList = async (close: () => void) => {
  if (!list.value) return;

  try {
    await pb.collection(Collections.Eventlists).delete(list.value.id);
    toast.add({ title: "Liste gelöscht", icon: "i-lucide-trash" });
    close();
    router.push(`/events/${route.params.id}`);
  } catch (error: any) {
    toastError(error);
  }
};
</script>
