<template>
  <UCard>
    <template #header>
      <h3 class="text-lg flex items-center gap-2">
        <UIcon name="i-lucide-bar-chart-3" class="size-5 text-primary" />
        <span>Mitglieder je Gruppe</span>
        <UBadge color="neutral" variant="subtle" size="sm">
          {{ total }}
        </UBadge>
      </h3>
    </template>

    <UEmpty
      v-if="!chartData.length"
      icon="i-lucide-users"
      size="sm"
      description="Noch keine NaMi Mitglieder importiert."
    />

    <BarChart
      v-else
      :data="chartData"
      x-axis="group"
      :y-axis="['count']"
      :categories="categories"
      :height="280"
      :y-num-ticks="4"
      :rounded-corners="4"
      :value-label="{ label: (d: any) => d?.count ?? '' }"
    />
  </UCard>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const UNGROUPED_LABEL = "Ohne Gruppe";

const { data: members, refresh: refreshMembers } = await useAsyncData(
  "dashboard-members-by-group",
  () =>
    pb.collection(Collections.Members).getFullList<MembersResponse>({
      fields: "groupName",
      requestKey: null,
    }),
  { default: () => [] as MembersResponse[] },
);

useRealtimeRefresh("members", refreshMembers);

const chartData = computed(() => {
  const buckets = new Map<string, number>();
  for (const m of members.value ?? []) {
    const key = m.groupName?.trim() || UNGROUPED_LABEL;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets, ([group, count]) => ({ group, count })).sort(
    (a, b) => b.count - a.count,
  );
});

const total = computed(() =>
  chartData.value.reduce((acc, row) => acc + row.count, 0),
);

const categories = {
  count: { name: "Mitglieder", color: "var(--ui-color-primary-500)" },
};
</script>
