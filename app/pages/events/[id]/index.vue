<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: event?.name ?? '', to: `/events/${id}` },
        ]"
      />
    </div>

    <UPageHeader :title="event?.name ?? ''" :description="dateRange" />

    <div
      v-if="recurringDays.length"
      class="flex items-center gap-2 text-sm text-muted"
    >
      <UIcon name="i-lucide-repeat" class="size-4" />
      <span>Wiederholung:</span>
      <UBadge
        v-for="day in recurringDays"
        :key="day"
        color="neutral"
        variant="subtle"
        size="sm"
      >
        {{ day }}
      </UBadge>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <OverviewCard
        title="Material Listen"
        icon="i-lucide-clipboard-list"
        item-icon="i-lucide-clipboard-list"
        :items="lists ?? []"
        empty-description="Noch keine Materiallisten angelegt."
        :to-for="eventListTo"
        :meta="itemsCount"
      >
        <template #action>
          <CreateEventList :event-id="id" @refresh="refreshLists()" />
        </template>
      </OverviewCard>

      <OverviewCard
        title="Teilnehmerlisten"
        icon="i-lucide-users"
        item-icon="i-lucide-user"
        :items="participantLists ?? []"
        empty-description="Noch keine Teilnehmerlisten angelegt."
        :to-for="participantListTo"
        :meta="createdMeta"
      >
        <template #action>
          <AddParticipantList
            :event-id="id"
            @refresh="refreshParticipantLists()"
          />
        </template>
      </OverviewCard>

      <OverviewCard
        title="Notizen"
        icon="i-lucide-notebook-pen"
        item-icon="i-lucide-file-text"
        :items="notes ?? []"
        empty-description="Noch keine Notizen erstellt."
        :to-for="noteTo"
        :meta="updatedMeta"
      >
        <template #action>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            :to="`/events/${id}/notes/create`"
          />
        </template>
      </OverviewCard>

      <OverviewCard
        title="Einkaufslisten"
        icon="i-lucide-shopping-cart"
        item-icon="i-lucide-shopping-bag"
        :items="shoppingLists ?? []"
        empty-description="Noch keine Einkaufslisten angelegt."
        :meta="itemsCount"
      >
        <template #action>
          <CreateShoppingList
            :event-id="id"
            @refresh="refreshShoppingLists()"
          />
        </template>
      </OverviewCard>
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

const DAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "";

type OverviewItem = {
  id: string;
  name?: string;
  items?: unknown[];
  created?: string;
  updated?: string;
};

const eventListTo = (item: OverviewItem) =>
  `/events/${id.value}/lists/${item.id}`;
const participantListTo = (item: OverviewItem) =>
  `/events/${id.value}/participants/${item.id}`;
const noteTo = (item: OverviewItem) => `/events/${id.value}/notes/${item.id}`;

const itemsCount = (item: OverviewItem) =>
  `${(item.items ?? []).length} Einträge`;
const createdMeta = (item: OverviewItem) => formatDate(item.created);
const updatedMeta = (item: OverviewItem) => formatDate(item.updated);

const { data: event } = await useAsyncData(
  () => `event-${id.value}`,
  () =>
    pb
      .collection(Collections.Events)
      .getOne<EventsResponse<number[]>>(id.value),
);

const { data: lists, refresh: refreshLists } = await useAsyncData(
  () => `event-lists-${id.value}`,
  () =>
    pb.collection(Collections.Eventlists).getFullList<EventlistsResponse>({
      filter: `event = "${id.value}"`,
      sort: "-updated",
      requestKey: null,
    }),
);

const { data: notes, refresh: refreshNotes } = await useAsyncData(
  () => `event-notes-${id.value}`,
  () =>
    pb.collection(Collections.Notes).getFullList<NotesResponse>({
      filter: `event = "${id.value}"`,
      sort: "-updated",
      requestKey: null,
    }),
);

const { data: participantLists, refresh: refreshParticipantLists } =
  await useAsyncData(
    () => `event-participantlists-${id.value}`,
    () =>
      pb
        .collection(Collections.Participantlists)
        .getFullList<ParticipantlistsResponse>({
          filter: `event = "${id.value}"`,
          sort: "-updated",
          requestKey: null,
        }),
  );

const { data: shoppingLists, refresh: refreshShoppingLists } =
  await useAsyncData(
    () => `event-shoppinglists-${id.value}`,
    () =>
      pb
        .collection(Collections.Shoppinglists)
        .getFullList<ShoppinglistsResponse>({
          filter: `event = "${id.value}"`,
          sort: "-updated",
          requestKey: null,
        }),
  );

useRealtimeRefresh("eventlists", refreshLists);
useRealtimeRefresh("notes", refreshNotes);
useRealtimeRefresh("participantlists", refreshParticipantLists);
useRealtimeRefresh("shoppinglists", refreshShoppingLists);

const dateRange = computed(() => {
  const start = formatDate(event.value?.startDate);
  const end = formatDate(event.value?.endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
});

const recurringDays = computed(() => {
  const raw = event.value?.daysOfWeek;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((d) => DAY_NAMES[d % 7])
    .filter((d): d is string => Boolean(d));
});
</script>
