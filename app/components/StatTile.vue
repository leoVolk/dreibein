<template>
  <NuxtLink :to="to" class="group block">
    <UCard
      :ui="{
        root: 'transition-all duration-150 group-hover:border-primary group-hover:ring-primary',
      }"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-12 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"
        >
          <UIcon :name="icon" class="size-6" />
        </div>
        <div class="min-w-0">
          <div class="text-2xl font-semibold leading-tight">
            {{ value }}
          </div>
          <div class="text-sm text-muted truncate">{{ label }}</div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  value: number | string;
  icon: string;
  to: string;
}>();
</script>
