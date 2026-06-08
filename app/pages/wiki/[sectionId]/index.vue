<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Wiki', to: '/wiki' },
        { label: section?.name ?? '...' },
      ]"
    />

    <UPageHeader v-if="section">
      <template #headline>
        <div class="flex justify-between w-full items-center gap-4">
          <div class="flex items-center gap-3">
            <UIcon
              v-if="section.icon"
              :name="section.icon"
              class="size-8 text-primary shrink-0"
            />
            <h1 class="text-3xl sm:text-4xl font-bold text-highlighted">
              {{ section.name }}
            </h1>
          </div>
          <div class="flex gap-2">
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
              description="Willst du diese Sektion wirklich löschen? Alle Seiten werden ebenfalls gelöscht."
              confirm-label="Sektion löschen"
              @confirm="onDeleteSection"
            >
              <UButton icon="i-lucide-trash" color="error" variant="outline" />
            </DeleteConfirmModal>
          </div>
        </div>
      </template>
    </UPageHeader>

    <UContentNavigation v-if="pages?.length" :navigation="navigationItems" />

    <UEmpty
      v-else
      icon="i-lucide-file-text"
      title="Noch keine Seiten"
      description="Erstelle die erste Seite in dieser Sektion."
    >
      <template #actions>
        <FormDrawer
          v-model:open="pageOpen"
          title="Neue Seite"
          :loading="saving"
          :state="pageState"
          trigger-label="Neue Seite"
          trigger-icon="i-lucide-plus"
          @submit="onCreatePage"
          @close="resetPage"
        >
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
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const toastError = useToastError();

const sectionId = route.params.sectionId as string;

const { data: section } = await useAsyncData(`wiki-section-${sectionId}`, () =>
  pb
    .collection(Collections.Wikisections)
    .getOne<WikisectionsResponse>(sectionId),
);

const { data: pages, refresh: refreshPages } = await useAsyncData(
  `wiki-pages-${sectionId}`,
  () =>
    pb.collection(Collections.Wikipages).getFullList<WikipagesResponse>({
      filter: `section = "${sectionId}"`,
      sort: "title",
      requestKey: null,
    }),
);

useRealtimeRefresh("wikipages", refreshPages);

const tagOptions = Object.values(WikipagesTagsOptions);

const navigationItems = computed(() =>
  (pages.value ?? []).map((p) => ({
    title: p.title,
    path: `/wiki/${sectionId}/${p.id}`,
    icon: "i-lucide-file-text",
    badge: p.tags ?? undefined,
  })),
);

const pageOpen = ref(false);
const saving = ref(false);

const emptyPageState = () => ({
  title: "",
  tags: undefined,
});
const pageState = reactive(emptyPageState());
const resetPage = () => Object.assign(pageState, emptyPageState());

const onCreatePage = async () => {
  saving.value = true;
  try {
    const record = await pb.collection(Collections.Wikipages).create({
      ...pageState,
      section: sectionId,
      content: "",
    });
    toast.add({ title: "Seite erstellt", icon: "i-lucide-file-text" });
    pageOpen.value = false;
    resetPage();
    router.push(`/wiki/${sectionId}/${record.id}`);
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

const onDeleteSection = async (close: () => void) => {
  try {
    const allPages = await pb
      .collection(Collections.Wikipages)
      .getFullList({ filter: `section = "${sectionId}"`, requestKey: null });
    await Promise.all(
      allPages.map((p) => pb.collection(Collections.Wikipages).delete(p.id)),
    );
    await pb.collection(Collections.Wikisections).delete(sectionId);
    toast.add({ title: "Sektion gelöscht", icon: "i-lucide-trash" });
    close();
    router.push("/wiki");
  } catch (e: any) {
    toastError(e);
  }
};
</script>
