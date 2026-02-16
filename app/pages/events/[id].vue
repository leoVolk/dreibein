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
          <UPageCard
            icon="i-lucide-clipboard-list"
            title="Material Listen"
            class="w-full lg:max-w-1/3"
          >
            <template #description>
              <div class="gap-4 py-2 flex-col flex">
                <ULink
                  v-for="value in lists"
                  :to="`lists/${value.id}`"
                  class="flex gap-2 items-center underline"
                >
                  <UIcon name="i-lucide-list" class="size-4"></UIcon>
                  <span>{{ value.name }}</span>
                </ULink>

                <CreateEventList
                  @refresh="getEventInfos()"
                  :event-id="event.id"
                ></CreateEventList>
              </div>
            </template>
          </UPageCard>
          <UPageCard
            icon="i-lucide-notebook-pen"
            title="Notizen"
            class="w-full lg:max-w-1/3"
          >
            <template #description>
              <div class="gap-4 py-2 flex-col flex">
                <ULink
                  v-for="value in notes"
                  :to="`notes/${value.id}`"
                  class="flex gap-2 items-center underline"
                >
                  <UIcon name="i-lucide-notebook" class="size-4"></UIcon>
                  <span>{{ value.name }}</span>
                </ULink>
              </div>
            </template>
          </UPageCard>
          <UPageCard
            icon="i-lucide-users"
            title="Teilnehmer Listen"
            class="w-full lg:max-w-1/3"
          >
            <template #description> </template>
          </UPageCard>
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

const event = ref();
const lists = ref();
const notes = ref();
const participantLists = ref();

const getEventInfos = async () => {
  event.value = await pb.collection("events").getOne(route.params.id as string);

  lists.value = await pb.collection("eventlists").getFullList({
    filter: `event = "${route.params.id}"`,
    requestKey: null,
  });

  notes.value = await pb.collection("eventnotes").getFullList({
    filter: `event = "${route.params.id}"`,
    requestKey: null,
  });
};

await getEventInfos();
</script>

<style></style>
