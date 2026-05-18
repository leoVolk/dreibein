<template>
  <UModal :title="title">
    <slot>
      <UButton
        size="sm"
        variant="ghost"
        color="error"
        icon="i-lucide-trash"
      />
    </slot>

    <template #body>
      <p>{{ description }}</p>
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
          :label="confirmLabel"
          :loading="loading"
          @click="onConfirm(close)"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: { type: String, required: true },
  description: {
    type: String,
    default:
      "Willst du diesen Eintrag wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden.",
  },
  confirmLabel: { type: String, default: "Löschen" },
});

const emit = defineEmits<{ confirm: [close: () => void] }>();

const loading = ref(false);

const onConfirm = async (close: () => void) => {
  loading.value = true;
  try {
    emit("confirm", close);
  } finally {
    loading.value = false;
  }
};
</script>
