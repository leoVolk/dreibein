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
        <div>
          <h2 class="text-2xl">{{ list.name }}</h2>
        </div>
      </template>
      <template #default>
        <UTable
          loading-color="primary"
          loading-animation="carousel"
          :data="participants"
          :columns="columns"
          :meta="meta"
        >
          <template #paidLists-cell="{ row }">
            <UCheckbox :modelValue="hasPaid(row.original.paidLists)" />
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
import type { TableColumn } from "@nuxt/ui";
import type { TableMeta, Row } from "@tanstack/vue-table";

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();

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
  { header: "Bezahlt", accessorKey: "paidLists" },
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

const meta: TableMeta<any> = {
  class: {
    tr: (row: Row<any>) => {
      if (hasPaid(row.original.paidLists)) {
        return "bg-success/10";
      }

      return "";
    },
  },
};
</script>

<style></style>
