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
          <div class="flex gap-2 shrink-0">
            <UButton
              icon="i-lucide-link"
              color="neutral"
              variant="outline"
              label="Anmeldelink"
              @click="copyRegistrationLink"
            />
            <UButton
              icon="i-lucide-download"
              color="neutral"
              variant="outline"
              label="PDF Export"
              :disabled="!participants?.length"
              @click="pdfModalOpen = true"
            />
          </div>
        </div>
      </template>
    </UPageHeader>

    <ParticipantTable
      :participants="participants ?? []"
      @refresh="refresh()"
    />

    <ParticipantsPDFModal
      v-model:open="pdfModalOpen"
      :participants="participants ?? []"
      :event-name="event?.name"
    />
  </div>
</template>

<script lang="ts" setup>

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const { pb } = usePocketbase();
const toast = useToast();

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

const pdfModalOpen = ref(false);

const copyRegistrationLink = async () => {
  if (!event.value?.token) {
    toast.add({
      title: "Kein Anmeldelink verfügbar",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
    return;
  }
  const url = `${window.location.origin}/register/${event.value.token}`;
  await navigator.clipboard.writeText(url);
  toast.add({ title: "Anmeldelink kopiert", icon: "i-lucide-link" });
};
</script>
