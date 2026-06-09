<template>
  <div>
    <UContextMenu v-if="sections.length" :items="contextMenuItems">
      <UCard
        class="z-auto"
        :ui="{ body: 'p-2!' }"
        @contextmenu.capture="detectContextTarget"
      >
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
    </UContextMenu>

    <UEmpty
      v-else
      icon="i-lucide-book-open"
      title="Noch keine Sektionen"
      size="sm"
    />

    <!-- Page creation drawer -->
    <FormDrawer
      class="hidden"
      v-model:open="pageOpen"
      title="Neue Seite"
      :loading="pageSaving"
      :state="pageState"
      @submit="onCreatePage"
      @close="resetPage"
    >
      <template #trigger />
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

    <!-- Sub-section creation drawer -->
    <FormDrawer
      class="hidden"
      v-model:open="subSectionOpen"
      title="Neue Untersektion"
      :loading="subSectionSaving"
      :state="subSectionState"
      @submit="onCreateSubSection"
      @close="resetSubSection"
    >
      <template #trigger />
      <UFormField label="Name" name="name" required class="w-full">
        <UInput
          v-model="subSectionState.name"
          class="w-full"
          size="lg"
          placeholder="z.B. Zelte"
        />
      </UFormField>
      <UFormField label="Icon" name="icon" class="w-full">
        <UInput
          v-model="subSectionState.icon"
          class="w-full"
          size="lg"
          placeholder="i-lucide-folder"
        />
      </UFormField>
    </FormDrawer>

    <!-- Delete confirmation modal -->
    <UModal
      v-model:open="deleteOpen"
      :title="
        deleteTarget?.type === 'section' ? 'Sektion löschen' : 'Seite löschen'
      "
    >
      <template #body>
        <p v-if="deleteTarget?.type === 'section'">
          Willst du „{{ deleteTarget.section.name }}" und alle enthaltenen
          Untersektionen und Seiten wirklich löschen? Diese Aktion kann nicht
          rückgängig gemacht werden.
        </p>
        <p v-else-if="deleteTarget?.type === 'page'">
          Willst du die Seite „{{ deleteTarget.pageTitle }}" wirklich löschen?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex w-full justify-between gap-2">
          <UButton
            color="neutral"
            variant="outline"
            label="Abbrechen"
            @click="close"
          />
          <UButton
            color="error"
            variant="outline"
            :label="
              deleteTarget?.type === 'section'
                ? 'Sektion löschen'
                : 'Seite löschen'
            "
            :loading="deleteDeleting"
            @click="confirmDelete(close)"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps<{
  sections: WikisectionsResponse[];
  allPages: WikipagesResponse[];
}>();

const emit = defineEmits<{
  createSection: [];
}>();

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const router = useRouter();

// ── Navigation tree ───────────────────────────────────────────────────────────

const buildNavTree = (parentId: string | null): object[] =>
  props.sections
    .filter((s) => (parentId ? s.parent === parentId : !s.parent))
    .map((s) => ({
      label: s.name,
      to: `/wiki/${s.name}`,
      icon: s.icon || "i-lucide-book-open",
      defaultOpen: true,
      children: [
        ...buildNavTree(s.id),
        ...props.allPages
          .filter((p) => p.section === s.id)
          .map((p) => ({
            label: p.title,
            to: `/wiki/${s.name}/${p.title}`,
            icon: "i-lucide-file-text",
          })),
      ],
    }));

const navigationItems = computed(() => buildNavTree(null));

// ── Page creation ─────────────────────────────────────────────────────────────

const pageOpen = ref(false);
const pageSaving = ref(false);
const pageTargetSection = ref<WikisectionsResponse | null>(null);

const tagOptions = Object.values(WikipagesTagsOptions);

const emptyPageState = () => ({
  title: "",
  tags: undefined as unknown as WikipagesResponse["tags"] | undefined,
});
const pageState = reactive(emptyPageState());
const resetPage = () => Object.assign(pageState, emptyPageState());

const onCreatePage = async () => {
  if (!pageTargetSection.value) return;
  pageSaving.value = true;
  try {
    const record = await pb.collection(Collections.Wikipages).create({
      ...pageState,
      section: pageTargetSection.value.id,
      content: "",
    });
    toast.add({ title: "Seite erstellt", icon: "i-lucide-file-text" });
    pageOpen.value = false;
    resetPage();
    router.push(
      `/wiki/${pageTargetSection.value.name}/${record.title ?? pageState.title}`,
    );
  } catch (e: any) {
    toastError(e);
  } finally {
    pageSaving.value = false;
  }
};

// ── Sub-section creation ──────────────────────────────────────────────────────

const subSectionOpen = ref(false);
const subSectionSaving = ref(false);
const subSectionTargetParent = ref<WikisectionsResponse | null>(null);

const emptySubSectionState = () => ({ name: "", icon: "" });
const subSectionState = reactive(emptySubSectionState());
const resetSubSection = () =>
  Object.assign(subSectionState, emptySubSectionState());

const onCreateSubSection = async () => {
  if (!subSectionTargetParent.value) return;
  subSectionSaving.value = true;
  try {
    await pb.collection(Collections.Wikisections).create({
      ...subSectionState,
      parent: subSectionTargetParent.value.id,
    });
    toast.add({ title: "Untersektion erstellt", icon: "i-lucide-folder" });
    subSectionOpen.value = false;
    resetSubSection();
  } catch (e: any) {
    toastError(e);
  } finally {
    subSectionSaving.value = false;
  }
};

// ── Deletion ──────────────────────────────────────────────────────────────────

type DeleteTarget =
  | { type: "section"; section: WikisectionsResponse }
  | { type: "page"; pageId: string; pageTitle: string; sectionName: string };

const deleteOpen = ref(false);
const deleteDeleting = ref(false);
const deleteTarget = ref<DeleteTarget | null>(null);

// Returns all descendants deepest-first so we can delete children before parents.
const getAllDescendants = (parentId: string): WikisectionsResponse[] => {
  const direct = props.sections.filter((s) => s.parent === parentId);
  return [...direct.flatMap((s) => getAllDescendants(s.id)), ...direct];
};

const deleteSectionCascade = async (section: WikisectionsResponse) => {
  const descendants = getAllDescendants(section.id);
  const allIds = [section.id, ...descendants.map((s) => s.id)];
  for (const id of allIds) {
    const pages = await pb
      .collection(Collections.Wikipages)
      .getFullList({ filter: `section = "${id}"`, requestKey: null });
    await Promise.all(
      pages.map((p) => pb.collection(Collections.Wikipages).delete(p.id)),
    );
  }
  // descendants are deepest-first, so children are deleted before their parents
  for (const s of descendants) {
    await pb.collection(Collections.Wikisections).delete(s.id);
  }
  await pb.collection(Collections.Wikisections).delete(section.id);
};

const confirmDelete = async (close: () => void) => {
  if (!deleteTarget.value) return;
  deleteDeleting.value = true;
  try {
    if (deleteTarget.value.type === "section") {
      await deleteSectionCascade(deleteTarget.value.section);
      toast.add({ title: "Sektion gelöscht", icon: "i-lucide-trash" });
      close();
      router.push("/wiki");
    } else {
      const { pageId, sectionName } = deleteTarget.value;
      await pb.collection(Collections.Wikipages).delete(pageId);
      toast.add({ title: "Seite gelöscht", icon: "i-lucide-trash" });
      close();
      router.push(`/wiki/${sectionName}`);
    }
  } catch (e: any) {
    toastError(e);
  } finally {
    deleteDeleting.value = false;
  }
};

// ── Context menu ──────────────────────────────────────────────────────────────

type ContextTarget =
  | { type: "section"; section: WikisectionsResponse }
  | {
      type: "page";
      section: WikisectionsResponse;
      pageTitle: string;
      pageId: string;
    };

const contextTarget = ref<ContextTarget | null>(null);

const detectContextTarget = (e: MouseEvent) => {
  const link = (e.target as Element).closest("a[href]");
  contextTarget.value = null;
  if (!link) return;
  const href = link.getAttribute("href") ?? "";

  // Page link: /wiki/SectionName/PageTitle
  const pageMatch = href.match(/^\/wiki\/([^/]+)\/([^/]+)$/);
  if (pageMatch) {
    const sectionName = decodeURIComponent(pageMatch[1]!);
    const pageTitle = decodeURIComponent(pageMatch[2]!);
    const section = props.sections.find((s) => s.name === sectionName);
    const page = props.allPages.find(
      (p) => p.title === pageTitle && p.section === section?.id,
    );
    if (section && page) {
      contextTarget.value = { type: "page", section, pageTitle, pageId: page.id };
    }
    return;
  }

  // Section link: /wiki/SectionName
  const sectionMatch = href.match(/^\/wiki\/([^/]+)$/);
  if (sectionMatch) {
    const sectionName = decodeURIComponent(sectionMatch[1]!);
    const section = props.sections.find((s) => s.name === sectionName);
    if (section) contextTarget.value = { type: "section", section };
  }
};

const contextMenuItems = computed<ContextMenuItem[][]>(() => {
  const createSection: ContextMenuItem = {
    label: "Neue Sektion",
    icon: "i-lucide-folder-plus",
    onSelect: () => emit("createSection"),
  };

  if (!contextTarget.value) {
    return [[createSection]];
  }

  if (contextTarget.value.type === "section") {
    const { section } = contextTarget.value;
    const actions: ContextMenuItem[] = [
      {
        label: `Neue Seite in „${section.name}"`,
        icon: "i-lucide-file-plus",
        onSelect: () => {
          pageTargetSection.value = section;
          pageOpen.value = true;
        },
      },
      {
        label: `Neue Untersektion in „${section.name}"`,
        icon: "i-lucide-folder-plus",
        onSelect: () => {
          subSectionTargetParent.value = section;
          subSectionOpen.value = true;
        },
      },
      {
        label: "Sektion löschen",
        icon: "i-lucide-trash",
        color: "error" as const,
        onSelect: () => {
          deleteTarget.value = { type: "section", section };
          deleteOpen.value = true;
        },
      },
    ];
    return [actions, [createSection]];
  }

  // Page target
  const { section, pageTitle, pageId } = contextTarget.value;
  return [
    [
      {
        label: "Seite löschen",
        icon: "i-lucide-trash",
        color: "error" as const,
        onSelect: () => {
          deleteTarget.value = {
            type: "page",
            pageId,
            pageTitle,
            sectionName: section.name,
          };
          deleteOpen.value = true;
        },
      },
    ],
    [createSection],
  ];
});
</script>
