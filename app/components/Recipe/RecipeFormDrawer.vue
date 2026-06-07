<template>
  <FormDrawer
    v-model:open="open"
    :title="title"
    :loading="loading"
    :state="state"
    :trigger-label="triggerLabel"
    :trigger-icon="triggerIcon"
    @submit="emit('submit')"
    @close="emit('close')"
  >
    <template v-if="$slots.trigger" #trigger="slotProps">
      <slot name="trigger" v-bind="slotProps" />
    </template>

    <RecipeMetaFields v-model="state" />

    <UFormField label="Zubereitung" name="preparation" class="w-full">
      <UEditor
        v-slot="{ editor }"
        v-model="state.preparation"
        content-type="html"
        :ui="{ base: 'py-3 min-h-48' }"
        class="w-full rounded-md border border-default"
      >
        <UEditorToolbar
          :editor="editor"
          :items="toolbarItems"
          class="border-b border-muted py-1.5 overflow-x-auto px-2"
        />
      </UEditor>
    </UFormField>

    <UFormField label="Zutaten" name="ingredients" class="w-full">
      <div class="flex flex-col gap-2">
        <div
          v-for="(row, i) in ingredientRows"
          :key="row._key"
          class="flex gap-2 items-center"
        >
          <UInput
            v-model="row.name"
            placeholder="Zutat"
            class="flex-1"
            size="sm"
          />
          <UInput
            v-model.number="row.amount"
            type="number"
            min="0"
            placeholder="Menge"
            class="w-20"
            size="sm"
          />

          <USelect
            v-model="row.unit"
            :items="unitOptions"
            placeholder="Einh."
            class="w-24"
            size="sm"
          />
          <UButton
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="xs"
            type="button"
            @click="removeRow(i)"
          />
        </div>
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="sm"
          label="Zutat hinzufügen"
          class="w-full justify-center"
          type="button"
          @click="addRow()"
        />
      </div>
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
import type { EditorToolbarItem } from "@nuxt/ui";

export type IngredientRow = {
  _key: number;
  id?: string;
  name: string;
  amount?: number;
  unit?: string;
};

defineProps({
  title: { type: String, required: true },
  loading: { type: Boolean, default: false },
  triggerLabel: { type: String, default: "" },
  triggerIcon: { type: String, default: "" },
});

const emit = defineEmits<{ submit: []; close: [] }>();

const open = defineModel<boolean>("open", { default: false });
const state = defineModel<Record<string, any>>("state", { required: true });
const ingredientRows = defineModel<IngredientRow[]>("ingredientRows", {
  default: () => [],
});

const unitOptions = Object.values(ShoppinglistsitemsUnitOptions);

let keyCounter = 0;
const addRow = () =>
  ingredientRows.value.push({
    _key: keyCounter++,
    name: "",
    amount: undefined,
    unit: undefined,
  });

const removeRow = (i: number) => ingredientRows.value.splice(i, 1);

const toolbarItems = [
  [
    {
      icon: "i-lucide-heading",
      content: { align: "start" },
      items: [
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
      ],
    },
  ],
  [
    { kind: "mark", mark: "bold", icon: "i-lucide-bold" },
    { kind: "mark", mark: "italic", icon: "i-lucide-italic" },
    { kind: "mark", mark: "underline", icon: "i-lucide-underline" },
  ],
  [
    { kind: "node", icon: "i-lucide-list" },
    { kind: "node", icon: "i-lucide-list-ordered" },
  ],
] satisfies EditorToolbarItem[][];
</script>
