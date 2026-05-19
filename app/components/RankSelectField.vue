<template>
  <UFormField class="w-full" label="Stufen" name="ranks">
    <USelectMenu
      v-model="selected"
      :items="items"
      multiple
      value-key="value"
      size="lg"
      class="w-full"
      placeholder="Stufen wählen..."
    >
      <template #default="{ modelValue }">
        <div v-if="modelValue?.length" class="flex flex-wrap gap-1">
          <RankBadge
            v-for="value in modelValue"
            :key="value"
            :name="labelOf(value)"
            :colour="colourOf(value)"
          />
        </div>
        <span v-else class="text-muted">Stufen wählen...</span>
      </template>

      <template #item-label="{ item }">
        <div class="flex items-center gap-2">
          <span
            class="inline-block size-3 rounded-full border border-default"
            :style="{ backgroundColor: item.colour }"
          />
          <span>{{ item.label }}</span>
        </div>
      </template>
    </USelectMenu>
  </UFormField>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

type Rank = { id: string; name: string; colour: string };

const selected = defineModel<string[]>({ default: () => [] });

const { data: ranks } = await useAsyncData("ranks-select", () =>
  pb.collection("ranks").getFullList<Rank>({ sort: "name" }),
);

const items = computed(() =>
  (ranks.value ?? []).map((r) => ({
    label: r.name,
    value: r.id,
    colour: r.colour,
  })),
);

const labelOf = (id: string) =>
  items.value.find((i) => i.value === id)?.label ?? id;
const colourOf = (id: string) =>
  items.value.find((i) => i.value === id)?.colour ?? "#999";
</script>
