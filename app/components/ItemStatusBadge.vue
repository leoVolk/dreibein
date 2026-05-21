<template>
  <UBadge :color="config.color">{{ config.label }}</UBadge>
</template>

<script lang="ts" setup>
const props = defineProps<{ status?: string }>();

type StatusKey = "none" | "checkedOut" | "repair" | "damaged" | "mildDamage";

const STATUS_MAP: Record<StatusKey, { label: string; color: any }> = {
  none: { label: "Intakt", color: "primary" },
  checkedOut: { label: "In Benutzung", color: "info" },
  repair: { label: "In Reparatur", color: "warning" },
  damaged: { label: "Beschädigt", color: "error" },
  mildDamage: { label: "Leichte Schäden", color: "warning" },
};

const config = computed(() => {
  const key = (props.status as StatusKey) ?? "none";
  return STATUS_MAP[key] ?? STATUS_MAP.none;
});
</script>
