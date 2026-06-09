<template>
  <div class="flex flex-col gap-4">
    <div v-if="section" class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <UIcon
          v-if="section.icon"
          :name="section.icon"
          class="size-6 text-primary shrink-0"
        />
        <h2 class="text-xl font-semibold">{{ section.name }}</h2>
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

    <UEmpty
      v-if="!pages?.length"
      icon="i-lucide-file-text"
      title="Noch keine Seiten"
      description="Erstelle die erste Seite in dieser Sektion."
      size="sm"
    />

    <div v-else class="flex flex-col gap-4">
      <UPageCard
        v-for="page in pages"
        :key="page.id"
        :title="page.title"
        :to="`/wiki/${section?.name}/${page.title}`"
        :description="page.content || '-'"
      />
    </div>
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
    const allPages = await pb.collection(Collections.Wikipages).getFullList({
      filter: `section.name = "${sectionName}"`,
      requestKey: null,
    });
    await Promise.all(
      allPages.map((p) => pb.collection(Collections.Wikipages).delete(p.id)),
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
