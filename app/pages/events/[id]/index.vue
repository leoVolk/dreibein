<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: event.name, to: '/events/' },
        ]"
      />
    </div>

    <UCard>
      <template #header>
        <div>
          <h2 class="text-2xl">{{ event.name }}</h2>
        </div>
      </template>
      <template #default>
        <div class="flex gap-8 flex-col lg:flex-row">
          <UCard variant="soft" class="w-full lg:max-w-1/3">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <UIcon
                    name="i-lucide-clipboard-list"
                    class="size-6 text-primary"
                  ></UIcon>
                  <h4 class="text-xl font-semibold">Material Listen</h4>
                </div>

                <div>
                  <CreateEventList
                    :event-id="event.id"
                    @refresh="refreshEventInfos()"
                  ></CreateEventList>
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-2">
              <ULink
                v-for="value in lists"
                :to="`/events/${event.id}/lists/${value.id}`"
                class="flex gap-2 items-center underline"
              >
                <UIcon name="i-lucide-list" class="size-4"></UIcon>
                <span>{{ value.name }}</span>
              </ULink>
            </div>
          </UCard>

          <UCard variant="soft" class="w-full lg:max-w-1/3">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <UIcon
                    name="i-lucide-notebook-pen"
                    class="size-6 text-primary"
                  ></UIcon>
                  <h4 class="text-xl font-semibold">Notizen</h4>
                </div>

                <div>
                  <UButton
                    :to="`/events/${event.id}/notes/create`"
                    icon="i-lucide-plus"
                    color="success"
                  ></UButton>
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-2">
              <ULink
                v-for="value in notes"
                :to="`/events/${event.id}/notes/${value.id}`"
                class="flex gap-2 items-center underline"
              >
                <UIcon name="i-lucide-notebook" class="size-4"></UIcon>
                <span>{{ value.name }}</span>
              </ULink>
            </div>
          </UCard>

          <UCard variant="soft" class="w-full lg:max-w-1/3">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <UIcon
                    name="i-lucide-list"
                    class="size-6 text-primary"
                  ></UIcon>
                  <h4 class="text-xl font-semibold">Teilnehmer Listen</h4>
                </div>

                <div>
                  <AddParticipantList
                    :event-id="event.id"
                    @refresh="refreshEventInfos()"
                  ></AddParticipantList>
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-2">
              <ULink
                v-for="value in participantLists"
                :to="`/events/${event.id}/participants/${value.id}`"
                class="flex gap-2 items-center underline"
              >
                <UIcon name="i-lucide-list" class="size-4"></UIcon>
                <span>{{ value.name }}</span>
              </ULink>
            </div>
          </UCard>
        </div>
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

const { data: event, refresh: refreshEvent } = await useAsyncData<any>(
  () => `event-${id.value}`,
  () => pb.collection("events").getOne(id.value),
);

const { data: lists, refresh: refreshLists } = await useAsyncData<any>(
  () => `lists-${id.value}`,
  () =>
    pb.collection("eventlists").getFullList({
      filter: `event = "${id.value}"`,
      requestKey: null,
    }),
);

const { data: notes, refresh: refreshNotes } = await useAsyncData<any>(
  () => `notes-${id.value}`,
  () =>
    pb.collection("eventnotes").getFullList({
      filter: `event = "${id.value}"`,
      requestKey: null,
    }),
);

const { data: participantLists, refresh: refreshParticipantLists } =
  await useAsyncData<any>(
    () => `participantLists-${id.value}`,
    () =>
      pb.collection("participantlists").getFullList({
        filter: `event = "${id.value}"`,
        requestKey: null,
      }),
  );

const refreshEventInfos = async () => {
  refreshEvent();
  refreshNotes();
  refreshLists();
  refreshParticipantLists();
};
</script>

<style></style>
