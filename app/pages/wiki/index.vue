<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Wiki', to: '/wiki' },
      ]"
    />

    <UPageHeader>
      <template #headline>
        <div class="flex justify-between w-full items-center gap-4">
          <h1 class="text-3xl sm:text-4xl font-bold text-highlighted">Wiki</h1>
          <FormDrawer
            v-model:open="sectionOpen"
            title="Neue Sektion"
            :loading="saving"
            :state="sectionState"
            @submit="onCreateSection"
            @close="resetSection"
          >
            <template #trigger="{ open: openDrawer }">
              <UButton
                icon="i-lucide-plus"
                color="primary"
                label="Neue Sektion"
                @click="openDrawer"
              />
            </template>
            <UFormField label="Name" name="name" required class="w-full">
              <UInput
                v-model="sectionState.name"
                class="w-full"
                size="lg"
                placeholder="z.B. Ausrüstung"
              />
            </UFormField>
            <UFormField label="Icon" name="icon" class="w-full">
              <UInput
                v-model="sectionState.icon"
                class="w-full"
                size="lg"
                placeholder="i-lucide-tent"
              />
            </UFormField>
            <UFormField label="Reihenfolge" name="order" class="w-full">
              <UInput
                v-model.number="sectionState.order"
                type="number"
                class="w-full"
                size="lg"
              />
            </UFormField>
          </FormDrawer>
        </div>
      </template>
    </UPageHeader>

    <div class="grid grid-cols-3 gap-6 items-start">
      <div class="col-span-2" v-if="sections?.length">
        <UContentNavigation :navigation="navigationItems" />
      </div>

      <UEmpty
        v-else
        icon="i-lucide-book-open"
        title="Noch keine Sektionen"
        description="Erstelle die erste Sektion für das Wiki."
      >
        <template #actions>
          <FormDrawer
            v-model:open="sectionOpen"
            title="Neue Sektion"
            :loading="saving"
            :state="sectionState"
            trigger-label="Neue Sektion"
            trigger-icon="i-lucide-plus"
            @submit="onCreateSection"
            @close="resetSection"
          >
            <UFormField label="Name" name="name" required class="w-full">
              <UInput v-model="sectionState.name" class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Icon" name="icon" class="w-full">
              <UInput
                v-model="sectionState.icon"
                class="w-full"
                size="lg"
                placeholder="i-lucide-tent"
              />
            </UFormField>
            <UFormField label="Reihenfolge" name="order" class="w-full">
              <UInput
                v-model.number="sectionState.order"
                type="number"
                class="w-full"
                size="lg"
              />
            </UFormField>
          </FormDrawer>
        </template>
      </UEmpty>
      <div v-if="recentPages?.length" class="">
        <UCard :ui="{ body: '!p-2' }">
          <template #header>
            <h2 class="text-lg font-semibold">Zuletzt aktualisiert</h2>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="page in recentPages" :key="page.id">
              <NuxtLink
                :to="`/wiki/${page.section}/${page.id}`"
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
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const { data: sections, refresh: refreshSections } = await useAsyncData(
  "wiki-sections",
  () =>
    pb
      .collection(Collections.Wikisections)
      .getFullList<WikisectionsResponse>({ sort: "order,name" }),
);

const { data: recentPages } = await useAsyncData("wiki-recent-pages", () =>
  pb
    .collection(Collections.Wikipages)
    .getList<WikipagesResponse>(1, 8, { sort: "-updated", requestKey: null })
    .then((r) => r.items),
);

const { data: allPages, refresh: refreshPages } = await useAsyncData(
  "wiki-pages-all",
  () =>
    pb.collection(Collections.Wikipages).getFullList<WikipagesResponse>({
      fields: "id,title,section",
      sort: "title",
      requestKey: null,
    }),
);

const navigationItems = computed(() =>
  (sections.value ?? []).map((section) => ({
    title: section.name,
    path: `/wiki/${section.id}`,
    icon: section.icon || "i-lucide-book-open",
    children: (allPages.value ?? [])
      .filter((p) => p.section === section.id)
      .map((p) => ({
        title: p.title,
        path: `/wiki/${section.id}/${p.id}`,
        icon: "i-lucide-file-text",
      })),
  })),
);

useRealtimeRefresh("wikipages", refreshPages);

useRealtimeRefresh("wikisections", refreshSections);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));

const sectionOpen = ref(false);
const saving = ref(false);

const emptySectionState = () => ({
  name: "",
  icon: "",
  order: (sections.value?.length ?? 0) + 1,
});
const sectionState = reactive(emptySectionState());
const resetSection = () => Object.assign(sectionState, emptySectionState());

const onCreateSection = async () => {
  saving.value = true;
  try {
    await pb.collection(Collections.Wikisections).create(sectionState);
    toast.add({ title: "Sektion erstellt", icon: "i-lucide-book-open" });
    sectionOpen.value = false;
    resetSection();
    await refreshSections();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};
</script>
