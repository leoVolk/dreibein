<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          <span>Mitglieder je Stufe</span>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ members?.length }}
          </UBadge>
        </h3>
      </div>
    </template>

    <UEmpty
      v-if="!rows.length"
      icon="i-lucide-users"
      size="sm"
      description="Noch keine NaMi Mitglieder importiert."
    />

    <ul v-else class="flex gap-3 md:flex-row flex-col relative">
      <li
        v-for="row in rows"
        :key="row.id"
        class="flex md:block justify-between items-center gap-2 w-full md:w-(--w)"
        :style="{ '--w': `${(row.count / total) * 100}%` }"
      >
        <UTooltip :delayDuration="0">
          <div
            class="h-3 rounded-full transition-all duration-500 w-(--w) md:w-full"
            :style="{ backgroundColor: row.color }"
          />
          <template #content>
            <p class="text-base font-semibold">
              {{ row.name }}: {{ row.count }}
            </p>
          </template>
        </UTooltip>
        <p class="text-sm md:hidden shrink-0">{{ row.count }} {{ row.name }}</p>
      </li>
    </ul>

    <div class="md:flex flex-row gap-2 justify-center hidden">
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
const props = defineProps<{
  members: any[];
}>();

const COLORS = [
  "#f59e0b",
  "#b5669a",
  "#8b5cf6",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const rows = computed(() => {
  const groups: Record<string, number> = {};
  for (const m of props.members ?? []) {
    const stufe = m.entries_stufe || "Keine Stufe";
    groups[stufe] = (groups[stufe] ?? 0) + 1;
  }
  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      id: name,
      name,
      count,
      color: COLORS[i % COLORS.length],
    }));
});

const total = computed(() => props.members?.length ?? 0);
</script>
<style>
.test {
  color: #b5669a;
}
</style>
