<template>
  <UFormField label="Name" name="name" class="w-full">
    <UInput
      v-model="model.name"
      size="lg"
      class="w-full"
      placeholder="z.B. Nudeln"
    />
  </UFormField>

  <div class="flex gap-4">
    <UFormField label="Menge" name="amount" class="flex-1">
      <UInput
        v-model.number="model.amount"
        type="number"
        min="0"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Einheit" name="unit" class="flex-1">
      <USelect
        v-model="model.unit"
        size="lg"
        class="w-full"
        :items="unitOptions"
        placeholder="Einheit"
      />
    </UFormField>
  </div>

  <UFormField label="Kategorie" name="category" class="w-full">
    <USelect
      v-model="model.category"
      size="lg"
      class="w-full"
      :items="categoryOptions"
      placeholder="Kategorie wählen"
    />
  </UFormField>

  <UFormField label="Notiz" name="note" class="w-full">
    <UInput
      v-model="model.note"
      size="lg"
      class="w-full"
      placeholder="Optional"
    />
  </UFormField>
</template>

<script lang="ts" setup>
const model = defineModel<Record<string, any>>({ required: true });

const unitOptions = Object.values(ShoppinglistsitemsUnitOptions);
const categoryOptions = Object.values(ShoppinglistsitemsCategoryOptions);
</script>
