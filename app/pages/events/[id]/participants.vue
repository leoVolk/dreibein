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

    <UPageHeader>
      <template #headline>
        <div class="flex flex-wrap justify-between w-full items-center gap-3">
          <h1 class="text-3xl sm:text-4xl font-bold text-highlighted min-w-0">
            Teilnehmer {{ event?.name ?? "" }}
          </h1>
          <UButton
            class="shrink-0"
            icon="i-lucide-download"
            color="neutral"
            variant="outline"
            label="PDF Export"
            :disabled="!participants?.length"
            :loading="exporting"
            @click="onExportPDF"
          />
        </div>
      </template>
    </UPageHeader>

    <ParticipantTable
      :participants="participants ?? []"
      show-address
      @refresh="refresh()"
    />
  </div>
</template>

<script lang="ts" setup>

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const { pb } = usePocketbase();

const id = computed(() => route.params.id as string);

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

const { exportPDF } = useParticipantsPDF();
const exporting = ref(false);

const onExportPDF = async () => {
  if (!participants.value?.length) return;
  exporting.value = true;
  try {
    await exportPDF(participants.value, event.value?.name);
  } finally {
    exporting.value = false;
  }
};
</script>
