<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :style="{ backgroundColor: colour, color: textColour }"
  >
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  name?: string;
  colour?: string;
}>();

const colour = computed(() => props.colour ?? "#6b7280");

const textColour = computed(() => {
  const hex = colour.value.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff";
});
</script>
