<template>
  <div class="flex flex-col gap-2">
    <div v-if="recentPages?.length" class="flex flex-col gap-2">
      <UCard :ui="{ body: 'p-2!' }">
        <template #header>
          <p class="text-lg font-medium">Zuletzt aktualisiert</p>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="page in recentPages" :key="page.id">
            <NuxtLink
              :to="`/wiki/${page.expand?.section?.name ?? page.section}/${page.title}`"
              class="flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-file-text"
                  class="size-4 text-muted shrink-0"
                />
                <span class="font-medium text-sm">{{ page.title }}</span>
                <UBadge
                  v-if="page.tags"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ page.tags }}
                </UBadge>
              </div>
              <span class="text-xs text-muted">{{
                formatDate(page.updated)
              }}</span>
            </NuxtLink>
          </li>
        </ul>
      </UCard>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-book-open"
      title="Willkommen im Wiki"
      description="Wähle eine Seite aus der Navigation oder erstelle eine neue Sektion."
      size="sm"
    />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();

type PageExpand = { section: WikisectionsResponse };

const { data: recentPages } = await useAsyncData("wiki-recent-pages", () =>
  pb
    .collection(Collections.Wikipages)
    .getList<WikipagesResponse<PageExpand>>(1, 8, { sort: "-updated", expand: "section", requestKey: null })
    .then((r) => r.items),
);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
</script>
