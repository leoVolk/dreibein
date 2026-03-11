<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: event!.name, to: '/events/' },
        ]"
      />
    </div>

    <!-- TODO: Rework -->
    <div class="gap-4 flex flex-col">
      <UPageHeader :title="event!.name" />
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const route = useRoute();

const id = computed(() => route.params.id as string);

const { data: event, refresh: refreshEvent } =
  await useAsyncData<EventsResponse>(
    () => `event-${id.value}`,
    () => pb.collection(Collections.Events).getOne(id.value),
  );

const { data: lists, refresh: refreshLists } = await useAsyncData<
  EventlistsResponse[]
>(
  () => `lists-${id.value}`,
  () =>
    pb.collection(Collections.Eventlists).getFullList({
      filter: `event = "${id.value}"`,
      requestKey: null,
    }),
);

const { data: notes, refresh: refreshNotes } = await useAsyncData<
  EventnotesResponse[]
>(
  () => `notes-${id.value}`,
  () =>
    pb.collection(Collections.Notes).getFullList({
      filter: `event = "${id.value}"`,
      requestKey: null,
    }),
);

const { data: participantList, refresh: refreshParticipantList } =
  await useAsyncData<ParticipantlistsResponse>(
    () => `participantLists-${id.value}`,
    () =>
      pb
        .collection(Collections.Participantlists)
        .getFirstListItem(`event = "${id.value}"`),
  );

const refreshEventInfos = async () => {
  refreshEvent();
  refreshNotes();
  refreshLists();
  refreshParticipantList();
};
</script>

<style></style>
