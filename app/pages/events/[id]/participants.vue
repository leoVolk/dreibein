<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Läger & Aktionen', to: '/events' },
        { label: event?.name ?? '', to: `/events/${id}` },
        { label: 'Teilnehmer' },
      ]"
    />

    <UPageHeader :title="`Teilnehmer ${event?.name ?? ''}`" />

    <UTable
      :data="participants ?? []"
      :columns="columns"
      v-model:column-pinning="columnPinning"
      sticky
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.original.firstname }} {{ row.original.lastname }}</span>
          <UBadge
            v-if="row.original.isLeader"
            color="primary"
            variant="subtle"
            size="xs"
          >
            Leitung
          </UBadge>
        </div>
      </template>

      <template #contact-cell="{ row }">
        <div class="flex flex-col gap-0.5 text-xs text-muted">
          <span v-if="row.original.email">{{ row.original.email }}</span>
          <span v-if="row.original.mobile || row.original.phone">
            {{ row.original.mobile || row.original.phone }}
          </span>
        </div>
      </template>

      <template #address-cell="{ row }">
        <div
          v-if="row.original.street"
          class="flex flex-col gap-0.5 text-xs text-muted"
        >
          <span>{{ row.original.street }}</span>
          <span>{{ row.original.zip }} {{ row.original.city }}</span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <DeleteConfirmModal
          title="Teilnehmer entfernen"
          :description="`Soll ${row.original.firstname} ${row.original.lastname} wirklich entfernt werden?`"
          confirm-label="Entfernen"
          @confirm="(close) => onDelete(row.original.id, close)"
        />
      </template>
    </UTable>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const id = computed(() => route.params.id as string);
const columnPinning = ref({ right: ["actions"] });

const columns: TableColumn<ParticipantsResponse>[] = [
  { id: "name", header: "Name" },
  { header: "Stufe", accessorKey: "rank" },
  { header: "Alter", accessorKey: "age" },
  { id: "contact", header: "Kontakt" },
  { id: "address", header: "Adresse" },
  { header: "Notizen", accessorKey: "notes" },
  { header: "", id: "actions" },
];

const { data: event } = await useAsyncData(
  () => `event-${id.value}`,
  () => pb.collection(Collections.Events).getOne<EventsResponse>(id.value),
);

const { data: participants, refresh } = await useAsyncData(
  () => `event-participants-page-${id.value}`,
  () =>
    pb.collection(Collections.Participants).getFullList<ParticipantsResponse>({
      filter: `event = "${id.value}"`,
      sort: "lastname",
      requestKey: null,
    }),
);

useRealtimeRefresh(Collections.Participants, refresh);

const onDelete = async (participantId: string, close: () => void) => {
  try {
    await pb.collection(Collections.Participants).delete(participantId);
    toast.add({ title: "Teilnehmer entfernt", icon: "i-lucide-user-minus" });
    close();
    await refresh();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
