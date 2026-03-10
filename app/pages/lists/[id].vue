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
        <CreateItem :list="list!" @refresh="refreshList()"></CreateItem>
        <UModal title="Liste löschen">
          <UButton label="Liste löschen" color="error" icon="i-lucide-trash" />

          <template #body>
            <p>
              Willst du diesen Liste wirklich löschen? Diese Aktion kann nicht
              mehr rückgängig gemacht werden.
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
                @click="deleteList(close)"
              />
            </div>
          </template>
        </UModal>
      </div>
    </div>

    <UCard v-if="list?.items">
      <template #header>
        <div>
          <h2 class="text-2xl">{{ list.name }}</h2>
        </div>
      </template>
      <template #default>
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="list?.expand.items || []"
          :columns="columns"
          :meta="meta"
        >
          <template #description-cell="{ row }">
            <div class="">
              {{ row.original.description.substring(0, 64) || "-" }}
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge v-if="row.original.status === 'none'" color="primary">
              Intakt
            </UBadge>
            <UBadge
              v-else-if="row.original.status === 'checkedOut'"
              color="info"
            >
              In Benutzung
            </UBadge>
            <UBadge
              v-else-if="row.original.status === 'repair'"
              color="warning"
            >
              In Reparatur
            </UBadge>
            <UBadge v-else color="error"> Beschädigt </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-1 items-center">
              <EditItem @refresh="refreshList()" :list-id="list?.id"></EditItem>

              <UModal title="Eintrag löschen">
                <UButton
                  variant="ghost"
                  size="sm"
                  color="error"
                  icon="i-lucide-trash"
                />

                <template #body>
                  <p>
                    Willst du diesen Eintrag wirklich löschen? Diese Aktion kann
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
                      label="Eintrag löschen"
                      @click="deleteItem(row.index, close)"
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
        <CreateItem :list="list!" @refresh="refreshList()"></CreateItem>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="refreshList()"
        ></UButton>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";
import type { TableMeta, Row } from "@tanstack/vue-table";

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
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
      .getOne<ListsResponse<Expand>>(route.params.id as string, {
        expand: "createdBy,updatedBy,items",
      }),
);

const columns: TableColumn<ItemsRecord>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "Beschreibung",
    accessorKey: "description",
    cell: ({ row }) => `${row.getValue("description") || "-"} `,
  },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Ausgegeben am",
    accessorKey: "checkout",
    cell: ({ row }) => `${row.getValue("checkout") || "-"} `,
  },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
  { header: "Status", accessorKey: "status" },
  { header: "", accessorKey: "actions" },
];

const meta: TableMeta<any> = {
  class: {
    tr: (row: Row<any>) => {
      if (row.original.status === "checkedOut") {
        return "bg-info/10";
      }
      if (row.original.status === "repair") {
        return "bg-warning/10";
      }
      if (row.original.status === "damaged") {
        return "bg-error/10";
      }
      return "";
    },
  },
};

const deleteItem = async (index: number, close: any) => {
  if (!list.value?.items[index]) return;

  await pb.collection("items").delete(list.value.items[index]);

  await pb
    .collection("lists")
    .update(list.value.id, { updatedBy: user.value?.id });

  toast.add({
    title: "Eintrag gelöscht",
    icon: "i-lucide-trash",
  });

  close();

  await refreshList();
};

const deleteList = async (close: any) => {
  if (!list.value) return;

  await pb.collection("lists").delete(list.value.id);

  toast.add({
    title: "Liste gelöscht",
    icon: "i-lucide-trash",
  });

  close();

  router.push("/lists");
};
</script>
