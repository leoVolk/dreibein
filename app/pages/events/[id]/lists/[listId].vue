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
          loading-color="primary"
          loading-animation="carousel"
          :data="list.expand.items"
          :columns="columns"
          :meta="meta"
        >
          <template #description-cell="{ row }">
            <div>{{ row.original.description?.substring(0, 64) || "-" }}</div>
          </template>

          <template #status-cell="{ row }">
            <ItemStatusBadge :status="row.original.status" />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-1 items-center">
              <EditItem
                :item="list?.expand?.items?.[row.index]"
                :list-id="list?.id"
                @refresh="refreshList()"
              />

              <DeleteConfirmModal
                title="Eintrag entfernen"
                description="Willst du diesen Eintrag wirklich aus der Liste entfernen?"
                confirm-label="Entfernen"
                @confirm="(close) => removeItem(row.index, close)"
              />
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

const columns: TableColumn<ItemsRecord>[] = [
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

const meta = useItemStatusMeta();

const removeItem = async (index: number, close: () => void) => {
  const item = list.value?.expand?.items?.[index];
  if (!item || !list.value) return;

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
