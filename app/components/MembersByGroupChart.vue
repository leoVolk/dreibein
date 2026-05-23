<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          <span>Mitglieder je Stufe</span>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ total }}
          </UBadge>
        </h3>

        <UButton
          variant="ghost"
          color="neutral"
          :icon="
            isColumn
              ? 'i-lucide-gallery-vertical'
              : 'i-lucide-gallery-horizontal'
          "
          size="sm"
          @click="isColumn = !isColumn"
        />
      </div>
    </template>

    <UEmpty
      v-if="!rows.length"
      icon="i-lucide-users"
      size="sm"
      description="Noch keine NaMi Mitglieder importiert."
    />

    <ul v-else class="flex gap-3 flex-row">
      <li
        v-for="row in rows"
        :key="row.id"
        :style="{
          width: `${(row.count / total) * 100}%`,
        }"
      >
        <UTooltip :delayDuration="0">
          <div
            class="h-3 w-full rounded-full transition-all duration-500 text-ellipsis"
            :style="{
              backgroundColor: row.color,
            }"
          />

          <template #content>
            <p class="text-base font-semibold">
              {{ row.name }}: {{ row.count }}
            </p>
          </template>
        </UTooltip>
      </li>
    </ul>

    <div class="flex flex-row gap-2 justify-center">
      <div
        v-for="row in rows"
        :key="row.id"
        class="mt-2 text-sm flex gap-2 items-center"
      >
        <span
          class="rounded full h-2 w-2"
          :style="{ backgroundColor: row.color }"
        ></span>
        <span>{{ row.name }}</span>
      </div>
    </div>
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

const isColumn = ref(false);

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
