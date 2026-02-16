<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex lg:justify-between lg:items-center flex-col lg:flex-row gap-4"
    >
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Listen', to: '/lists' },
          { label: list.name, to: `/lists/${list.id}` },
        ]"
      />

      <div class="flex gap-4">
        <AddEventItem
          :list-id="list.id"
          :items-in-list="items"
          @refresh="refreshItems()"
        ></AddEventItem>
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

    <UCard v-if="items.length">
      <template #header>
        <div>
          <h2 class="text-2xl">{{ list.name }}</h2>

          <div v-if="list.expand" class="flex lg:flex-row flex-col gap-4 mt-2">
            <div>
              Erstellt am:
              <span class="font-semibold">{{
                new Date(list.created).toLocaleString()
              }}</span>
              von
              <span class="font-semibold">{{
                list.expand.createdBy.name
              }}</span>
            </div>
            <span class="hidden lg:block" v-if="list.expand.updatedBy">|</span>
            <div v-if="list.expand.updatedBy">
              Aktualisiert am:
              <span class="font-semibold">{{
                new Date(list.updated).toLocaleString()
              }}</span>
              von
              <span class="font-semibold">{{
                list.expand.updatedBy.name
              }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="items"
          :columns="columns"
          :meta="meta"
        >
          <template #description-cell="{ row }">
            <div class="">
              {{ row.original.description.substring(0, 64) }}
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge v-if="row.original.status === 'none'" color="success">
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
              <EditItem
                @refresh="refreshItems()"
                :list-id="list.id"
                :item="items[row.index]"
              ></EditItem>

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
                      @click="deleteItem(items[row.index], close)"
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
        <AddEventItem
          :list-id="list.id"
          @refresh="refreshItems()"
        ></AddEventItem>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          variant="subtle"
          @click="refreshItems()"
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

const list = ref();
const items = ref();

const refreshItems = async () => {
  list.value = await pb
    .collection("eventlists")
    .getOne(route.params.id as string);

  items.value = await pb.collection("eventitems").getFullList({
    filter: `list = "${route.params.id}"`,
    requestKey: null,
  });
};

await refreshItems();

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Anzahl", accessorKey: "quantity" },
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

const deleteItem = async (item: any, close: any) => {
  await pb.collection("eventitems").delete(item.id);

  toast.add({
    title: "Eintrag gelöscht",
    icon: "i-lucide-trash",
  });

  close();

  await refreshItems();
};

const deleteList = async (close: any) => {
  await pb.collection("eventitems").delete(list.value.id);

  toast.add({
    title: "Liste gelöscht",
    icon: "i-lucide-trash",
  });

  close();

  router.push("/events/lists");
};
</script>
