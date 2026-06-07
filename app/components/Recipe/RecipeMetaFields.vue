<template>
  <UFormField label="Name" name="name" class="w-full">
    <UInput
      v-model="model.name"
      size="lg"
      class="w-full"
      placeholder="Rezeptname"
    />
  </UFormField>

  <UFormField label="Portionen" name="servings" class="w-full">
    <UInput
      v-model.number="model.servings"
      type="number"
      min="1"
      size="lg"
      class="w-full"
      placeholder="z.B. 12"
    />
  </UFormField>

  <UFormField label="Kategorie" name="category" class="w-full">
    <USelectMenu
      v-model="model.category"
      :items="categoryOptions"
      multiple
      size="lg"
      class="w-full"
      placeholder="Kategorie wählen"
    />
  </UFormField>

  <UFormField label="Tags" name="tags" class="w-full">
    <USelectMenu
      v-model="model.tags"
      :items="tagOptions"
      multiple
      size="lg"
      class="w-full"
      placeholder="Tags wählen"
    />
  </UFormField>
</template>

<script lang="ts" setup>
const model = defineModel<Record<string, any>>({ required: true });

const categoryOptions = Object.values(RecipesCategoryOptions);
const tagOptions = Object.values(RecipesTagsOptions);
</script>
