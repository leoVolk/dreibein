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

    <div class="grid grid-cols-4 gap-6 relative items-start">
      <div class="lg:col-span-1 col-span-4 lg:sticky top-0">
        <UCard class="z-auto" :ui="{ body: 'p-2!' }" v-if="sections?.length">
          <template #header>
            <span class="text-lg font-medium">Inhaltsverzeichnis</span>
          </template>
          <template #default>
            <UNavigationMenu
              :items="navigationItems"
              orientation="vertical"
              highlight
            />
          </template>
        </UCard>

        <UEmpty
          v-else
          icon="i-lucide-book-open"
          title="Noch keine Sektionen"
          size="sm"
        />
      </div>

      <div class="lg:col-span-3 col-span-4">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });

import type { ContextMenuItem } from "@nuxt/ui";

const contextMenuItems = ref<ContextMenuItem[][]>([
  [
    {
      label: "Neue Sektion",
      onSelect() {
        sectionOpen.value = true;
      },
    },
    {
      label: "Neue Seite",
      onSelect(e) {
        console.log(e);
      },
    },
  ],
]);

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
    label: section.name,
    to: `/wiki/${section.name}`,
    icon: section.icon || "i-lucide-book-open",
    defaultOpen: true,
    children: (allPages.value ?? [])
      .filter((p) => p.section === section.id)
      .map((p) => ({
        label: p.title,
        to: `/wiki/${section.name}/${p.title}`,
        icon: "i-lucide-file-text",
      })),
  })),
);

useRealtimeRefresh("wikisections", refreshSections);
useRealtimeRefresh("wikipages", refreshPages);

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
