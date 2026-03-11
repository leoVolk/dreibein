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

    <UCard>
      <template #header>
        <div>
          <h2 class="text-2xl">{{ event!.name }}</h2>
        </div>
      </template>
      <template #default>
        <div class="grid lg:grid-cols-3 grid-cols-1 gap-8">
          <div class="flex flex-col gap-4">
            <UPageFeature
              title="Material Listen"
              description="Hier findest du alle Materaillisten für das Event. Klicke auf eine Liste, um die Details zu sehen und sie zu bearbeiten."
              icon="i-lucide-list"
            />

            <USeparator />

            <UPageList>
              <UPageCard
                v-for="(list, index) in lists"
                :key="index"
                variant="soft"
                :to="`/events/${id}/lists/${list.id}`"
              >
                <template #body>
                  <div class="flex gap-4 flex-row items-center">
                    <UIcon
                      class="size-6 text-primary"
                      name="i-lucide-list-ordered"
                    ></UIcon>
                    <h3 class="text-lg font-medium">{{ list.name }}</h3>
                  </div>
                </template>
              </UPageCard>
            </UPageList>
          </div>

          <div class="flex flex-col gap-4">
            <UPageFeature
              title="Notizen"
              description="Hier findest du alle Notizen für das Event. Klicke auf eine Notiz, um die Details zu sehen und sie zu bearbeiten."
              icon="i-lucide-sticky-note"
            />

            <USeparator />

            <UPageList>
              <UPageCard
                v-for="(note, index) in notes"
                :key="index"
                class="mb-4"
                variant="soft"
                :to="`/events/${id}/notes/${note.id}`"
              >
                <template #body>
                  <div class="flex gap-4 flex-row items-center">
                    <UIcon
                      class="size-6 text-primary"
                      name="i-lucide-notepad-text"
                    ></UIcon>
                    <h3 class="text-lg font-medium">{{ note.name }}</h3>
                  </div>
                </template>
              </UPageCard>
            </UPageList>
          </div>

          <div class="flex flex-col gap-4">
            <UPageFeature
              title="Einkaufslisten"
              description="Hier findest du alle Einkaufslisten für das Event. Klicke auf eine Liste, um die Details zu sehen und sie zu bearbeiten."
              icon="i-lucide-shopping-cart"
            />

            <USeparator />
          </div>
        </div>

        {{ participantList }}
      </template>
    </UCard>
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
