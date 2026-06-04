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
            :class="row.colorClass"
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
        <span class="rounded-full h-2 w-2" :class="row.colorClass"></span>
        <span>{{ row.name }}</span>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps<{
  stats: {
    nrMitglieder: number;
    statsCategories: { name: string; count: number }[];
  } | null;
}>();

const CATEGORY_COLORS: Record<string, string> = {
  Biber: "bg-white",
  Wölfling: "bg-orange-500",
  Jungpfadfinder: "bg-blue-600",
  Pfadfinder: "bg-green-500",
  Rover: "bg-red-500",
  Vorstand: "bg-yellow-500",
  Rechtsträger: "bg-fuchsia-500",
  Sonstige: "bg-gray-500",
};

const FALLBACK_COLORS = [
  "bg-cyan-500",
  "bg-pink-500",
  "bg-lime-500",
  "bg-indigo-500",
];

const rows = computed(() =>
  (props.stats?.statsCategories ?? []).map((c, i) => ({
    id: c.name,
    name: c.name,
    count: c.count,
    colorClass:
      CATEGORY_COLORS[c.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  })),
);

const total = computed(() => props.stats?.nrMitglieder ?? 0);
</script>
