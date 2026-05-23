<template>
  <UCard>
    <template #header>
      <h3 class="text-lg flex items-center gap-2">
        <UIcon name="i-lucide-users" class="size-5 text-primary" />
        <span>Mitglieder je Stufe</span>
        <UBadge color="neutral" variant="subtle" size="sm">
          {{ total }}
        </UBadge>
      </h3>
    </template>

    <UEmpty
      v-if="!rows.length"
      icon="i-lucide-users"
      size="sm"
      description="Noch keine NaMi Mitglieder importiert."
    />

    <ul v-else class="flex flex-row gap-3">
      <li
        v-for="row in rows"
        :key="row.id"
        :style="{
          width: `${(row.count / total) * 100}%`,
        }"
      >
        <div
          class="h-1.5 w-full rounded-full transition-all duration-500"
          :style="{
            backgroundColor: row.color,
          }"
        />
        <div class="flex flex-row justify-between">
          <p class="mt-2 text-sm">{{ row.name }}</p>
          <p class="mt-2 text-sm font-semibold">{{ row.count }}</p>
        </div>
      </li>
    </ul>
  </UCard>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const { data: ranks, refresh: refreshRanks } = await useAsyncData(
  "dashboard-ranks-list",
  () =>
    pb
      .collection(Collections.Ranks)
      .getFullList<RanksResponse>({ sort: "sort,name", requestKey: null }),
  { default: () => [] as RanksResponse[] },
);

const { data: members, refresh: refreshMembers } = await useAsyncData(
  "dashboard-members-by-rank",
  () =>
    pb.collection(Collections.Members).getFullList<MembersResponse>({
      fields: "ranks",
      requestKey: null,
    }),
  { default: () => [] as MembersResponse[] },
);

useRealtimeRefresh(Collections.Members, refreshMembers);
useRealtimeRefresh(Collections.Ranks, refreshRanks);

const rows = computed(() => {
  const rankCounts = new Map<string, number>();
  let noRankCount = 0;

  for (const member of members.value) {
    if (!member.ranks?.length) {
      noRankCount++;
    } else {
      for (const rankId of member.ranks) {
        rankCounts.set(rankId, (rankCounts.get(rankId) ?? 0) + 1);
      }
    }
  }

  const result = ranks.value
    .map((r) => ({
      id: r.id,
      name: r.name || r.id,
      color: r.colour || "var(--ui-color-neutral-400)",
      count: rankCounts.get(r.id) ?? 0,
    }))
    .filter((r) => r.count > 0);

  if (noRankCount > 0) {
    result.push({
      id: "none",
      name: "Ohne Stufe",
      color: "var(--ui-color-neutral-400)",
      count: noRankCount,
    });
  }

  return result;
});

const total = computed(() => rows.value.reduce((acc, r) => acc + r.count, 0));
</script>
