<template>
  <div class="flex flex-col gap-4">
    <div v-if="section" class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <UIcon
          v-if="section.icon"
          :name="section.icon"
          class="size-6 text-primary shrink-0"
        />
        <h2 class="text-xl font-semibold truncate">{{ section.name }}</h2>
      </div>
      <div class="flex gap-2 shrink-0">
        <FormDrawer
          v-model:open="pageOpen"
          title="Neue Seite"
          :loading="saving"
          :state="pageState"
          @submit="onCreatePage"
          @close="resetPage"
        >
          <template #trigger="{ open: openDrawer }">
            <UButton
              icon="i-lucide-plus"
              color="primary"
              label="Neue Seite"
              @click="openDrawer"
            />
          </template>
          <UFormField label="Titel" name="title" required class="w-full">
            <UInput
              v-model="pageState.title"
              class="w-full"
              size="lg"
              placeholder="Seitentitel"
            />
          </UFormField>
          <UFormField label="Tag" name="tags" class="w-full">
            <USelect
              v-model="pageState.tags"
              :items="tagOptions"
              placeholder="Tag wählen"
              class="w-full"
              size="lg"
            />
          </UFormField>
        </FormDrawer>

        <DeleteConfirmModal
          title="Sektion löschen"
          description="Willst du diese Sektion und alle enthaltenen Untersektionen und Seiten wirklich löschen?"
          confirm-label="Sektion löschen"
          @confirm="onDeleteSection"
        >
          <UButton icon="i-lucide-trash" color="error" variant="outline" />
        </DeleteConfirmModal>
      </div>
    </div>

    <!-- Sub-sections (only shown for top-level sections) -->
    <div v-if="subSections?.length" class="flex flex-col gap-2">
      <p class="text-sm font-medium text-muted">Untersektionen</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NuxtLink
          v-for="sub in subSections"
          :key="sub.id"
          :to="`/wiki/${sub.name}`"
          class="flex items-center gap-3 rounded-lg border border-default p-4 hover:bg-elevated transition-colors"
        >
          <UIcon
            :name="sub.icon || 'i-lucide-folder'"
            class="size-5 text-primary shrink-0"
          />
          <span class="font-medium text-sm">{{ sub.name }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Pages -->
    <div v-if="pages?.length" class="flex flex-col gap-4">
      <p v-if="subSections?.length" class="text-sm font-medium text-muted">
        Seiten
      </p>
      <UPageCard
        v-for="page in pages"
        :key="page.id"
        :title="page.title"
        :to="`/wiki/${sectionName}/${page.title}`"
        :ui="{ container: 'p-4!' }"
        spotlight
        spotlight-color="primary"
      >
      </UPageCard>
    </div>

    <UEmpty
      v-if="!subSections?.length && !pages?.length"
      icon="i-lucide-file-text"
      title="Noch keine Seiten"
      description="Erstelle die erste Seite in dieser Sektion."
      size="sm"
    />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const toastError = useToastError();

const sectionName = route.params.sectionId as string;

const { data: section } = await useAsyncData(
  `wiki-section-${sectionName}`,
  () =>
    pb
      .collection(Collections.Wikisections)
      .getFirstListItem<WikisectionsResponse>(`name = "${sectionName}"`),
);

const { data: subSections } = await useAsyncData(
  `wiki-subsections-${sectionName}`,
  () =>
    pb.collection(Collections.Wikisections).getFullList<WikisectionsResponse>({
      filter: `parent.name = "${sectionName}"`,
      sort: "order,name",
      requestKey: null,
    }),
);

const { data: pages } = await useAsyncData(`wiki-pages-${sectionName}`, () =>
  pb.collection(Collections.Wikipages).getFullList<WikipagesResponse>({
    filter: `section.name = "${sectionName}"`,
    requestKey: null,
  }),
);

const tagOptions = Object.values(WikipagesTagsOptions);

const pageOpen = ref(false);
const saving = ref(false);

const emptyPageState = () => ({
  title: "",
  tags: undefined as WikipagesTagsOptions | undefined,
});
const pageState = reactive(emptyPageState());
const resetPage = () => Object.assign(pageState, emptyPageState());

const onCreatePage = async () => {
  saving.value = true;
  try {
    const record = await pb.collection(Collections.Wikipages).create({
      ...pageState,
      section: section.value!.id,
      content: "",
    });
    toast.add({ title: "Seite erstellt", icon: "i-lucide-file-text" });
    pageOpen.value = false;
    resetPage();
    router.push(`/wiki/${sectionName}/${record.title}`);
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

const onDeleteSection = async (close: () => void) => {
  try {
    // Delete pages in sub-sections, then sub-sections themselves
    if (subSections.value?.length) {
      for (const sub of subSections.value) {
        const subPages = await pb
          .collection(Collections.Wikipages)
          .getFullList({ filter: `section = "${sub.id}"`, requestKey: null });
        await Promise.all(
          subPages.map((p) =>
            pb.collection(Collections.Wikipages).delete(p.id),
          ),
        );
        await pb.collection(Collections.Wikisections).delete(sub.id);
      }
    }
    // Delete direct pages
    const directPages = await pb.collection(Collections.Wikipages).getFullList({
      filter: `section = "${section.value!.id}"`,
      requestKey: null,
    });
    await Promise.all(
      directPages.map((p) => pb.collection(Collections.Wikipages).delete(p.id)),
    );
    await pb.collection(Collections.Wikisections).delete(section.value!.id);
    toast.add({ title: "Sektion gelöscht", icon: "i-lucide-trash" });
    close();
    router.push("/wiki");
  } catch (e: any) {
    toastError(e);
  }
};
</script>
