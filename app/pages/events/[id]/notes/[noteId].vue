<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: 'Notizen', to: '/events' },
          { label: note.name },
        ]"
      />
    </div>

    <UCard variant="subtle">
      <template #header>
        <div v-if="!isEditing" class="flex justify-between items-center">
          <h2 class="text-2xl">{{ note.name }}</h2>

          <UButton
            label="Bearbeiten"
            icon="i-lucide-edit"
            @click="isEditing = !isEditing"
          ></UButton>
        </div>
        <UFormField v-else class="w-full">
          <UInput
            class="w-full"
            placeholder="Titel"
            size="lg"
            v-model="note.name"
          ></UInput>
        </UFormField>
      </template>

      <template #default>
        <div v-if="isEditing">
          <UEditor
            v-slot="{ editor }"
            v-model="note.content"
            :handlers="customHandlers"
            content-type="html"
            :ui="{ base: 'p-8 sm:px-16' }"
            class="w-full min-h-74"
          >
            <UEditorToolbar
              :editor="editor"
              :items="items"
              class="border-b border-muted py-2 overflow-x-auto"
            />
          </UEditor>

          <div class="flex justify-between">
            <UButton
              color="error"
              label="Abbrechen"
              icon="i-lucide-x"
              @click="onAbord"
            ></UButton>
            <UButton
              color="success"
              label="Speichern"
              icon="i-lucide-save"
              @click="onSubmit"
            ></UButton>
          </div>
        </div>
        <MDC v-else :value="note.content" tag="article" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { EditorCustomHandlers, EditorToolbarItem } from "@nuxt/ui";
import type { Editor } from "@tiptap/vue-3";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const route = useRoute();

const toast = useToast();
const loading = ref(false);

const isEditing = ref(false);

const { data: note, refresh } = await useAsyncData<any>(() =>
  pb.collection("eventnotes").getOne(route.params.noteId as string),
);

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) =>
      editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) =>
      editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;

const items = [
  [
    {
      icon: "i-lucide-heading",
      content: {
        align: "start",
      },
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
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-lucide-code",
    },
  ],
] satisfies EditorToolbarItem<typeof customHandlers>[][];

const onSubmit = async () => {
  loading.value = true;

  note.value = await pb
    .collection("eventnotes")
    .update(route.params.noteId as string, note.value);

  toast.add({
    title: "Notiz aktualisiert",
    icon: "i-lucide-save",
  });

  loading.value = false;
  isEditing.value = false;

  refresh();
};

const onAbord = async () => {
  refresh();

  isEditing.value = false;
};
</script>

<style></style>
