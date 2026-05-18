<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center gap-2">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon :name="icon" class="size-5 text-primary" />
          <span>{{ title }}</span>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ items.length }}
          </UBadge>
        </h3>

        <slot name="action" />
      </div>
    </template>

    <template #default>
      <ul v-if="items.length" class="flex flex-col">
        <li
          v-for="(item, index) in items"
          :key="item.id"
          :class="[
            'flex items-center justify-between gap-2 py-2',
            index !== items.length - 1 ? 'border-b border-default' : '',
          ]"
        >
          <NuxtLink
            v-if="linkFor(item)"
            :to="linkFor(item)"
            class="flex items-center gap-2 min-w-0 flex-1 hover:text-primary transition-colors cursor-pointer"
          >
            <UIcon
              :name="itemIcon ?? 'i-lucide-circle'"
              class="size-4 text-muted shrink-0"
            />
            <span class="truncate">{{ item.name || "Ohne Titel" }}</span>
          </NuxtLink>

          <div v-else class="flex items-center gap-2 min-w-0 flex-1">
            <UIcon
              :name="itemIcon ?? 'i-lucide-circle'"
              class="size-4 text-muted shrink-0"
            />
            <span class="truncate">{{ item.name || "Ohne Titel" }}</span>
          </div>

          <span v-if="meta" class="text-xs text-muted shrink-0">
            {{ meta(item) }}
          </span>
        </li>
      </ul>

      <UEmpty v-else :icon="icon" size="sm" :description="emptyDescription" />
    </template>
  </UCard>
</template>

<script lang="ts" setup>
type Item = { id: string; name?: string; [key: string]: any };

const props = defineProps<{
  title: string;
  icon: string;
  items: Item[];
  itemIcon?: string;
  emptyDescription?: string;
  toFor?: (item: Item) => string | undefined;
  meta?: (item: Item) => string;
}>();

const linkFor = (item: Item) => props.toFor?.(item);
</script>
