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

    <!-- Page creation drawer — triggered by context menu -->
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

    <!-- Delete confirmation modal — triggered by context menu -->
    <UModal
      v-model:open="deleteOpen"
      :title="
        deleteTarget?.type === 'section' ? 'Sektion löschen' : 'Seite löschen'
      "
    >
      <template #body>
        <p v-if="deleteTarget?.type === 'section'">
          Willst du die Sektion „{{ deleteTarget.section.name }}" und alle
          enthaltenen Seiten wirklich löschen? Diese Aktion kann nicht
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

// ── Navigation items ──────────────────────────────────────────────────────────

const navigationItems = computed(() =>
  props.sections.map((section) => ({
    label: section.name,
    to: `/wiki/${section.name}`,
    icon: section.icon || "i-lucide-book-open",
    defaultOpen: true,
    children: props.allPages
      .filter((p) => p.section === section.id)
      .map((p) => ({
        label: p.title,
        to: `/wiki/${section.name}/${p.title}`,
        icon: "i-lucide-file-text",
      })),
  })),
);

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

// ── Deletion ──────────────────────────────────────────────────────────────────

type DeleteTarget =
  | { type: "section"; section: WikisectionsResponse }
  | { type: "page"; pageId: string; pageTitle: string; sectionName: string };

const deleteOpen = ref(false);
const deleteDeleting = ref(false);
const deleteTarget = ref<DeleteTarget | null>(null);

const confirmDelete = async (close: () => void) => {
  if (!deleteTarget.value) return;
  deleteDeleting.value = true;
  try {
    if (deleteTarget.value.type === "section") {
      const { section } = deleteTarget.value;
      const pages = await pb.collection(Collections.Wikipages).getFullList({
        filter: `section.name = "${section.name}"`,
        requestKey: null,
      });
      await Promise.all(
        pages.map((p) => pb.collection(Collections.Wikipages).delete(p.id)),
      );
      await pb.collection(Collections.Wikisections).delete(section.id);
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
      contextTarget.value = {
        type: "page",
        section,
        pageTitle,
        pageId: page.id,
      };
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
    return [
      [
        {
          label: `Neue Seite in „${section.name}"`,
          icon: "i-lucide-file-plus",
          onSelect: () => {
            pageTargetSection.value = section;
            pageOpen.value = true;
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
      ],
      [createSection],
    ];
  }

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
