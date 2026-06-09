<template>
  <div class="flex flex-col gap-4">
    <UPageHeader
      v-if="page"
      class="sticky top-0 px-4 dark:bg-neutral-900/50 bg-neutral-50/50 backdrop-blur-sm"
    >
      <template #headline>
        <div class="flex justify-between w-full items-center gap-4">
          <UInput
            v-if="isEditing"
            v-model="editState.title"
            class="flex-1 text-3xl font-bold"
            size="xl"
            placeholder="Seitentitel"
          />
          <h1
            v-else
            class="text-3xl sm:text-4xl font-bold text-highlighted text-pretty cursor-text"
            @dblclick="startEdit"
          >
            {{ page.title }}
          </h1>
          <div class="flex gap-2">
            <template v-if="isEditing">
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                label="Abbrechen"
                @click="onCancel"
              />
              <UButton
                icon="i-lucide-save"
                color="primary"
                label="Speichern"
                :loading="saving"
                @click="onSave"
              />
            </template>
            <template v-else>
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="outline"
                @click="startEdit"
              />
              <DeleteConfirmModal
                title="Seite löschen"
                description="Willst du diese Seite wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
                confirm-label="Seite löschen"
                @confirm="onDelete"
              >
                <UButton
                  icon="i-lucide-trash"
                  color="error"
                  variant="outline"
                />
              </DeleteConfirmModal>
            </template>
          </div>
        </div>
      </template>
      <template #description>
        <div class="flex items-center gap-2 mt-1">
          <USelect
            v-if="isEditing"
            v-model="editState.tags"
            :items="tagOptions"
            placeholder="Tag wählen"
            size="sm"
            class="w-48"
          />
          <UBadge v-else-if="page.tags" color="neutral" variant="subtle">
            {{ page.tags }}
          </UBadge>
          <span class="text-xs text-muted">
            Zuletzt aktualisiert: {{ formatDate(page.updated) }}
          </span>
        </div>
      </template>
    </UPageHeader>

    <div v-if="page" class="px-4">
      <UEditor
        v-if="isEditing"
        v-slot="{ editor }"
        v-model="editState.content"
        content-type="html"
        :ui="{ base: 'py-4 min-h-96' }"
        class="w-full"
      >
        <UEditorToolbar
          :editor="editor"
          :items="toolbarItems"
          class="border-b border-muted py-1.5 overflow-x-auto px-2"
        />
      </UEditor>
      <div
        v-else-if="page.content"
        class="prose dark:prose-invert max-w-none cursor-text"
        v-html="page.content"
        @dblclick="startEdit"
      />
      <p
        v-else
        class="text-muted text-sm italic cursor-text"
        @dblclick="startEdit"
      >
        Noch kein Inhalt. Klicke auf Bearbeiten, um loszulegen.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EditorToolbarItem } from "@nuxt/ui";

definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const toastError = useToastError();

const sectionName = route.params.sectionId as string;
const pageTitle = route.params.pageId as string;

const { data: page, refresh } = await useAsyncData(`wiki-page-${sectionName}-${pageTitle}`, () =>
  pb
    .collection(Collections.Wikipages)
    .getFirstListItem<WikipagesResponse>(`title = "${pageTitle}" && section.name = "${sectionName}"`),
);

const tagOptions = Object.values(WikipagesTagsOptions);

const isEditing = ref(false);
const saving = ref(false);

const buildEditState = () => ({
  title: page.value?.title ?? "",
  content: page.value?.content ?? "",
  tags: page.value?.tags,
});

const editState = reactive(buildEditState());

const startEdit = () => {
  Object.assign(editState, buildEditState());
  isEditing.value = true;
};

const onCancel = () => {
  Object.assign(editState, buildEditState());
  isEditing.value = false;
};

const onSave = async () => {
  saving.value = true;
  try {
    await pb.collection(Collections.Wikipages).update(page.value!.id, editState);
    toast.add({ title: "Seite gespeichert", icon: "i-lucide-save" });
    isEditing.value = false;
    if (editState.title !== pageTitle) {
      router.replace(`/wiki/${sectionName}/${editState.title}`);
    } else {
      await refresh();
    }
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

const onDelete = async (close: () => void) => {
  try {
    await pb.collection(Collections.Wikipages).delete(page.value!.id);
    toast.add({ title: "Seite gelöscht", icon: "i-lucide-trash" });
    close();
    router.push(`/wiki`);
  } catch (e: any) {
    toastError(e);
  }
};

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));

const toolbarItems = [
  [
    {
      icon: "i-lucide-heading",
      content: { align: "start" },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-lucide-heading-1",
          label: "Überschrift 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Überschrift 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Überschrift 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Überschrift 4",
        },
      ],
    },
  ],
  [
    { kind: "mark", mark: "bold", icon: "i-lucide-bold" },
    { kind: "mark", mark: "italic", icon: "i-lucide-italic" },
    { kind: "mark", mark: "underline", icon: "i-lucide-underline" },
    { kind: "mark", mark: "strike", icon: "i-lucide-strikethrough" },
    { kind: "mark", mark: "code", icon: "i-lucide-code" },
  ],
  [
    { kind: "node", icon: "i-lucide-list" },
    { kind: "node", icon: "i-lucide-list-ordered" },
  ],
] satisfies EditorToolbarItem[][];
</script>
