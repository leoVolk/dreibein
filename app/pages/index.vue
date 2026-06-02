<template>
  <div class="flex flex-col gap-6">
    <UBreadcrumb :items="[{ label: 'Home', to: '/' }]" />

    <UPageHeader title="Dashboard">
      <template #description>
        Gut Pfad,
        <span class="text-primary font-semibold">{{ user?.name }}</span
        ><span>!</span>
      </template>
    </UPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatTile
        label="Läger & Aktionen"
        :value="stats.events"
        icon="i-lucide-flame-kindling"
        to="/events"
      />
      <StatTile
        label="Material Listen"
        :value="stats.lists"
        icon="i-lucide-clipboard-list"
        to="/lists"
      />
      <StatTile
        label="Materialien"
        :value="stats.items"
        icon="i-lucide-package"
        to="/items"
      />
      <StatTile
        label="Mitglieder "
        :value="stats.members"
        icon="i-lucide-users"
        to="/members"
      />
    </div>

    <MembersByGroupChart />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <OverviewCard
        title="Anstehende Läger & Aktionen"
        icon="i-lucide-calendar-clock"
        item-icon="i-lucide-flame-kindling"
        :items="upcomingEvents ?? []"
        empty-description="Keine bevorstehenden Läger oder Aktionen."
        :to-for="eventTo"
        :meta="eventDateMeta"
      />

      <UCard>
        <template #header>
          <div class="flex justify-between items-center gap-2">
            <h3 class="text-lg flex items-center gap-2">
              <UIcon
                name="i-lucide-triangle-alert"
                class="size-5 text-warning"
              />
              <span>Material braucht Aufmerksamkeit</span>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ attentionItems?.length ?? 0 }}
              </UBadge>
            </h3>
          </div>
        </template>

        <ul v-if="attentionItems?.length" class="flex flex-col">
          <li
            v-for="(item, index) in attentionItems"
            :key="item.id"
            :class="[
              'flex items-center justify-between gap-2 py-2',
              index !== attentionItems.length - 1
                ? 'border-b border-default'
                : '',
            ]"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <UIcon
                name="i-lucide-package"
                class="size-4 text-muted shrink-0"
              />
              <span class="truncate">{{ item.name || "Ohne Titel" }}</span>
            </div>
            <ItemStatusBadge :status="item.status" />
          </li>
        </ul>
        <UEmpty
          v-else
          icon="i-lucide-check-circle"
          size="sm"
          description="Alles in Ordnung – kein Material braucht aktuell Aufmerksamkeit."
        />
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <OverviewCard
        title="Zuletzt bearbeitete Listen"
        icon="i-lucide-history"
        item-icon="i-lucide-clipboard-list"
        :items="recentLists ?? []"
        empty-description="Noch keine Listen vorhanden."
        :to-for="listTo"
        :meta="updatedMeta"
      />

      <OverviewCard
        title="Zuletzt bearbeitete Läger & Aktionen"
        icon="i-lucide-history"
        item-icon="i-lucide-flame-kindling"
        :items="recentEvents ?? []"
        empty-description="Noch keine Läger oder Aktionen vorhanden."
        :to-for="eventTo"
        :meta="updatedMeta"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

type Bare = {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  updated?: string;
};

const today = new Date().toISOString().slice(0, 10);

const eventTo = (item: Bare) => `/events/${item.id}`;
const listTo = (item: Bare) => `/lists/${item.id}`;

const eventDateMeta = (item: Bare) => {
  const start = formatEventDate(item.startDate);
  const end = formatEventDate(item.endDate);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end || "";
};

const updatedMeta = (item: Bare) => formatEventDate(item.updated);

const { data: stats, refresh: refreshStats } = await useAsyncData(
  "dashboard-stats",
  async () => {
    const [events, lists, items, members] = await Promise.all([
      pb.collection("events").getList(1, 1, { requestKey: null }),
      pb.collection("lists").getList(1, 1, { requestKey: null }),
      pb.collection("items").getList(1, 1, { requestKey: null }),
      pb.collection("members").getList(1, 1, { requestKey: null }),
    ]);
    return {
      events: events.totalItems,
      lists: lists.totalItems,
      items: items.totalItems,
      members: members.totalItems,
    };
  },
  { default: () => ({ events: 0, lists: 0, items: 0, members: 0 }) },
);

const { data: upcomingEvents, refresh: refreshUpcoming } = await useAsyncData(
  "dashboard-upcoming-events",
  () =>
    pb.collection(Collections.Events).getList<EventsResponse>(1, 5, {
      filter: `endDate >= "${today}" || startDate >= "${today}"`,
      sort: "startDate",
      requestKey: null,
    }),
  { transform: (res) => res.items, default: () => [] as EventsResponse[] },
);

const { data: attentionItems, refresh: refreshAttention } = await useAsyncData(
  "dashboard-attention-items",
  () =>
    pb.collection(Collections.Items).getList<ItemsResponse>(1, 6, {
      filter: 'status != "none"',
      sort: "-updated",
      requestKey: null,
    }),
  { transform: (res) => res.items, default: () => [] as ItemsResponse[] },
);

const { data: recentLists, refresh: refreshRecentLists } = await useAsyncData(
  "dashboard-recent-lists",
  () =>
    pb.collection(Collections.Lists).getList<ListsResponse>(1, 5, {
      sort: "-updated",
      requestKey: null,
    }),
  { transform: (res) => res.items, default: () => [] as ListsResponse[] },
);

const { data: recentEvents, refresh: refreshRecentEvents } = await useAsyncData(
  "dashboard-recent-events",
  () =>
    pb.collection(Collections.Events).getList<EventsResponse>(1, 5, {
      sort: "-updated",
      requestKey: null,
    }),
  { transform: (res) => res.items, default: () => [] as EventsResponse[] },
);

useRealtimeRefresh("events", () => {
  refreshStats();
  refreshUpcoming();
  refreshRecentEvents();
});

useRealtimeRefresh("lists", () => {
  refreshStats();
  refreshRecentLists();
});

useRealtimeRefresh("items", () => {
  refreshStats();
  refreshAttention();
});

useRealtimeRefresh("members", () => {
  refreshStats();
});
</script>
