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

    <UPageHeader :title="event?.name ?? ''" class="border-0 pb-0">
      <template #headline>
        <div
          v-if="recurringDays.length"
          class="flex items-center gap-2 text-sm"
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
        <div v-else>
          {{ dateRange }}
        </div>
      </template>

      <template #description>
        <UTabs
          v-model="activeTab"
          color="primary"
          variant="link"
          :content="false"
          :items="tabItems"
          class="w-full hidden md:block"
        />
        <UTabs
          v-model="activeTab"
          color="primary"
          variant="link"
          orientation="vertical"
          :content="false"
          :items="tabItems"
          class="w-full md:hidden block"
        />
      </template>
    </UPageHeader>

    <div>
      <!-- Übersicht -->
      <div
        v-if="activeTab === 'overview'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <OverviewCard
          title="Material Listen"
          icon="i-lucide-clipboard-list"
          item-icon="i-lucide-clipboard-list"
          :items="(lists ?? []).slice(0, 5)"
          empty-description="Noch keine Materiallisten angelegt."
          :to-for="eventListTo"
          :meta="updatedMeta"
        >
          <template #action>
            <CreateEventList :event-id="id" @refresh="refreshLists()" />
          </template>
        </OverviewCard>

        <OverviewCard
          title="Teilnehmer"
          icon="i-lucide-users"
          item-icon="i-lucide-user"
          :items="participantItems.slice(0, 5)"
          empty-description="Noch keine Teilnehmer hinzugefügt."
          :meta="participantRank"
          :to-for="participantsTo"
        />

        <InvoiceCard
          :invoices="(invoices ?? []).slice(0, 5)"
          :total-value="
            (invoices ?? []).reduce((s, i) => s + (i.value ?? 0), 0)
          "
          :event-id="id"
          :event-name="event?.name"
          @refresh="refreshInvoices()"
        />

        <OverviewCard
          title="Einkaufslisten"
          icon="i-lucide-shopping-cart"
          item-icon="i-lucide-shopping-bag"
          :items="(shoppingLists ?? []).slice(0, 5)"
          empty-description="Noch keine Einkaufslisten angelegt."
          :to-for="shoppingListTo"
        >
          <template #action>
            <CreateShoppingList
              :event-id="id"
              @refresh="refreshShoppingLists()"
            />
          </template>
        </OverviewCard>

        <OverviewCard
          title="Notizen"
          icon="i-lucide-notebook-pen"
          item-icon="i-lucide-file-text"
          :items="(notes ?? []).slice(0, 5)"
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
      </div>

      <!-- Material Listen -->
      <OverviewCard
        v-else-if="activeTab === 'lists'"
        title="Material Listen"
        icon="i-lucide-clipboard-list"
        item-icon="i-lucide-clipboard-list"
        :items="lists ?? []"
        empty-description="Noch keine Materiallisten angelegt."
        :to-for="eventListTo"
        :meta="updatedMeta"
      >
        <template #action>
          <CreateEventList :event-id="id" @refresh="refreshLists()" />
        </template>
      </OverviewCard>

      <!-- Teilnehmer -->
      <ParticipantListCard
        v-else-if="activeTab === 'participants'"
        :participants="participants ?? []"
        @refresh="refreshParticipants()"
      />

      <!-- Rechnungen -->
      <InvoiceCard
        v-else-if="activeTab === 'invoices'"
        :invoices="invoices ?? []"
        :event-id="id"
        :event-name="event?.name"
        @refresh="refreshInvoices()"
      />

      <!-- Einkaufslisten -->
      <OverviewCard
        v-else-if="activeTab === 'shopping'"
        title="Einkaufslisten"
        icon="i-lucide-shopping-cart"
        item-icon="i-lucide-shopping-bag"
        :items="shoppingLists ?? []"
        empty-description="Noch keine Einkaufslisten angelegt."
        :to-for="shoppingListTo"
      >
        <template #action>
          <CreateShoppingList
            :event-id="id"
            @refresh="refreshShoppingLists()"
          />
        </template>
      </OverviewCard>

      <!-- Notizen -->
      <OverviewCard
        v-else-if="activeTab === 'notes'"
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
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);

const validTabs = [
  "overview",
  "lists",
  "participants",
  "invoices",
  "shopping",
  "notes",
];
const activeTab = ref(
  validTabs.includes(route.query.tab as string)
    ? (route.query.tab as string)
    : "overview",
);
const tabItems = [
  { label: "Übersicht", value: "overview" },
  { label: "Material Listen", value: "lists" },
  { label: "Teilnehmer", value: "participants" },
  { label: "Rechnungen", value: "invoices" },
  { label: "Einkaufslisten", value: "shopping" },
  { label: "Notizen", value: "notes" },
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

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } });
});

const eventListTo = (item: OverviewItem) =>
  `/events/${id.value}/lists/${item.id}`;
const noteTo = (item: OverviewItem) => `/events/${id.value}/notes/${item.id}`;
const shoppingListTo = (item: OverviewItem) =>
  `/events/${id.value}/shoppinglists/${item.id}`;

const participantsTo = (item: OverviewItem) =>
  `/events/${id.value}/participants`;

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

const { data: participants, refresh: refreshParticipants } = await useAsyncData(
  () => `event-participants-${id.value}`,
  () =>
    pb.collection(Collections.Participants).getFullList<ParticipantsResponse>({
      filter: `event = "${id.value}"`,
      sort: "lastname",
      requestKey: null,
    }),
);

const participantItems = computed(() =>
  (participants.value ?? []).map((p) => ({
    ...p,
    name: `${p.firstname} ${p.lastname}`.trim(),
  })),
);

const participantRank = (item: any) =>
  [item.rank, item.isLeader ? "Leitung" : ""].filter(Boolean).join(" ");

const { data: notes, refresh: refreshNotes } = await useAsyncData(
  () => `event-notes-${id.value}`,
  () =>
    pb.collection(Collections.Notes).getFullList<NotesResponse>({
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

const { data: invoices, refresh: refreshInvoices } = await useAsyncData(
  () => `event-invoices-${id.value}`,
  () =>
    pb.collection(Collections.Invoices).getFullList<InvoicesResponse>({
      filter: `event = "${id.value}"`,
      sort: "-updated",
      requestKey: null,
    }),
);

useRealtimeRefresh("eventlists", refreshLists);
useRealtimeRefresh("participants", refreshParticipants);
useRealtimeRefresh("notes", refreshNotes);
useRealtimeRefresh("shoppinglists", refreshShoppingLists);
useRealtimeRefresh("invoices", refreshInvoices);

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
