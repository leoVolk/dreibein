<template>
  <UCard>
    <template #header>
      <h3 class="text-lg flex items-center gap-2">
        <UIcon name="i-lucide-pie-chart" class="size-5 text-primary" />
        <span>Material-Status</span>
        <UBadge color="neutral" variant="subtle" size="sm">
          {{ total }}
        </UBadge>
      </h3>
    </template>

    <UEmpty
      v-if="!total"
      icon="i-lucide-package"
      size="sm"
      description="Noch keine Materialien erfasst."
    />

    <DonutChart
      v-else
      :data="data"
      :categories="categories"
      :radius="120"
      :arc-width="22"
      :pad-angle="0.02"
      :height="280"
    />
  </UCard>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const STATUSES = [
  { key: "none", label: "Intakt", color: "var(--ui-color-primary-500)" },
  { key: "checkedOut", label: "In Benutzung", color: "var(--ui-color-info-500)" },
  { key: "repair", label: "In Reparatur", color: "var(--ui-color-warning-500)" },
  { key: "damaged", label: "Beschädigt", color: "var(--ui-color-error-500)" },
] as const;

const { data: counts, refresh: refreshCounts } = await useAsyncData(
  "dashboard-status-counts",
  async () => {
    const results = await Promise.all(
      STATUSES.map((s) =>
        pb.collection(Collections.Items).getList(1, 1, {
          filter: pb.filter("status = {:status}", { status: s.key }),
          requestKey: null,
        }),
      ),
    );
    return results.map((r) => r.totalItems);
  },
  { default: () => STATUSES.map(() => 0) },
);

const data = computed(() => counts.value ?? []);
const total = computed(() =>
  data.value.reduce((acc, n) => acc + (n ?? 0), 0),
);

const categories = computed(() =>
  Object.fromEntries(
    STATUSES.map((s) => [s.key, { name: s.label, color: s.color }]),
  ),
);

useRealtimeRefresh("items", refreshCounts);
</script>
