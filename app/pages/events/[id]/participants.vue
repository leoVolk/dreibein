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
</script>
