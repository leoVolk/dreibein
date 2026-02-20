<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex lg:justify-between lg:Participants-center flex-col lg:flex-row gap-4"
    >
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: 'Teilnehmerlisten', to: '/events' },
          { label: list.name },
        ]"
      />
    </div>

    <UCard v-if="participants.length">
      <template #header>
        <div class="flex items-center lg:flex-row flex-col justify-between">
          <h2 class="text-2xl">{{ list.name }}</h2>

          <UButton icon="i-lucide-plus" @click=""
            >Teilnehmer hinzufügen</UButton
          >
        </div>
      </template>
      <template #default>
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="participants"
          :columns="columns"
          ref="table"
          @select="onSelect"
        >
          <template #paidLists-cell="{ row }">
            <UBadge color="success" v-if="hasPaid(row.original.paidLists)"
              >Bezahlt</UBadge
            >
            <UBadge color="error" v-else>Nicht bezahlt</UBadge>
          </template>
        </UTable>
        <div class="flex justify-end mt-4">
          <UButton icon="i-lucide-save" @click="onListeUpdate()"
            >Liste Aktualisieren</UButton
          >
        </div>
      </template>
    </UCard>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <AddEventItem :list-id="list.id" @refresh="refresh()"></AddEventItem>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          variant="subtle"
          @click="refresh()"
        ></UButton>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const { pb } = usePocketbase();
const route = useRoute();
const table = useTemplateRef("table");

const { data: list, refresh: refreshList } = await useAsyncData<any>(() =>
  pb.collection("participantlists").getOne(route.params.listId as string),
);

const { data: participants, refresh: refreshParticipants } =
  await useAsyncData<any>(() =>
    pb.collection("members").getFullList({
      filter: `lists ~ "${route.params.listId}"`,
      requestKey: null,
    }),
  );

const refresh = () => {
  refreshList();
  refreshParticipants();
};

const hasPaid = (paidLists: any) => {
  return paidLists.includes(route.params.listId as string);
};

const columns: TableColumn<any>[] = [
  { header: "Zahlungsstatus", accessorKey: "paidLists" },
  { header: "Mitgliedsnummer", accessorKey: "memberNumber" },
  { header: "Vorname", accessorKey: "firstName" },
  { header: "Nachname", accessorKey: "lastName" },
  { header: "Strasse", accessorKey: "street" },
  { header: "PLZ", accessorKey: "postalCode" },
  { header: "Ort", accessorKey: "city" },
  { header: "EMail", accessorKey: "email" },
  {
    header: "EMailErziehungsberechtigter",
    accessorKey: "guardianEmail",
  },
  { header: "Telefon1", accessorKey: "phone1" },
  { header: "Telefon2", accessorKey: "phone2" },
  { header: "Telefon3", accessorKey: "phone3" },
];

const onListeUpdate = async () => {
  try {
    const batch = pb.createBatch();

    table.value?.tableApi.getFilteredSelectedRowModel().rows.forEach((row) => {
      const m = participants.value[row.index];

      if (!m) return;

      batch.collection("members").update(m.id, {
        ...m,
        paidLists: toggleValue(
          m.paidLists,
          route.params.listId,
          !hasPaid(row.original.paidLists),
        ),
      });
    });

    await batch.send();

    table.value?.tableApi.reset();

    refresh();
  } catch (error: any) {}
};

function onSelect(e: Event, row: TableRow<any>) {
  row.toggleSelected(!row.getIsSelected());
}

const toggleValue = (arr: any, value: any, add: any) =>
  add ? [...arr, value] : arr.filter((v: any) => v !== value);
</script>

<style></style>
