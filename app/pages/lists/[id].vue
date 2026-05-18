<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex lg:justify-between lg:items-center flex-col lg:flex-row gap-4"
    >
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Listen', to: '/lists' },
          { label: list?.name, to: `/lists/${list?.id}` },
        ]"
      />

      <div class="flex gap-4">
        <CreateItem :list="list!" @refresh="refreshList()" />
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

    <div v-if="list?.expand?.items?.length">
      <UPageHeader :title="list.name" />

      <UTable
        class="mt-8"
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
              title="Eintrag löschen"
              confirm-label="Eintrag löschen"
              @confirm="(close) => deleteItem(row.index, close)"
            />
          </div>
        </template>
      </UTable>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <CreateItem :list="list!" @refresh="refreshList()" />
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

const id = computed(() => route.params.id as string);

type Expand = {
  items: ItemsResponse[];
  createdBy: UsersResponse;
  updatedBy: UsersResponse;
};

const { data: list, refresh: refreshList } = await useAsyncData(
  () => `list-${id.value}`,
  () =>
    pb
      .collection(Collections.Lists)
      .getOne<ListsResponse<Expand>>(id.value, {
        expand: "createdBy,updatedBy,items",
      }),
);

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

const deleteItem = async (index: number, close: () => void) => {
  const item = list.value?.expand?.items?.[index];
  if (!item || !list.value) return;

  try {
    await pb.collection("items").delete(item.id);
    await pb
      .collection("lists")
      .update(list.value.id, { updatedBy: user.value?.id });
    toast.add({ title: "Eintrag gelöscht", icon: "i-lucide-trash" });
    close();
    await refreshList();
  } catch (error: any) {
    toastError(error);
  }
};

const deleteList = async (close: () => void) => {
  if (!list.value) return;

  try {
    await pb.collection("lists").delete(list.value.id);
    toast.add({ title: "Liste gelöscht", icon: "i-lucide-trash" });
    close();
    router.push("/lists");
  } catch (error: any) {
    toastError(error);
  }
};
</script>
