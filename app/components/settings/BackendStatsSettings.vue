<template>
  <UCard v-if="!pending && logs?.items?.length">
    <template #header>
      <h3 class="text-xl flex items-center gap-2">
        <UIcon name="i-lucide-heart-pulse" class="size-6" />
        Backend Statistiken
      </h3>
    </template>

    <div class="flex flex-col gap-2 w-fit">
      <p class="text-sm text-primary flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" class="size-4" />
        {{ pb.baseURL }}api
      </p>
      <USeparator />
      <div class="flex gap-1 items-center">
        <UTooltip
          v-for="log in logs.items"
          :key="log.id"
          :text="`${log.message} ${log.data?.error || ''}`"
          :delayDuration="100"
        >
          <span
            class="h-8 w-1 rounded-xs transition-all duration-100"
            :class="log.level == 0 ? 'bg-primary hover:bg-primary-700' : 'bg-error hover:bg-error-700'"
          />
        </UTooltip>
      </div>
      <div class="flex justify-between text-xs text-muted">
        <span>{{ new Date(logs.items[0].created).toLocaleDateString() }}</span>
        <span>{{ new Date(logs.items.at(-1).created).toLocaleDateString() }}</span>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const { data: logs, pending } = useAsyncData("admin-logs", () =>
  pb.send("/api/admin/logs", { method: "GET" }),
);
</script>
