<template>
  <UModal
    :title="invoice.name || 'Datei Vorschau'"
    :ui="{ content: 'max-w-5xl' }"
  >
    <UTooltip text="Datei ansehen">
      <UButton icon="i-lucide-eye" size="xs" variant="ghost" color="neutral" />
    </UTooltip>

    <template #body>
      <div class="flex flex-col items-center gap-4">
        <img
          v-if="isImage"
          :src="url"
          class="max-w-full max-h-[70vh] rounded-lg object-contain"
          :alt="invoice.name"
        />
        <iframe
          v-else-if="isPdf"
          :src="url"
          class="w-full h-[70vh] rounded-lg border border-default"
        />
        <div v-else class="flex flex-col items-center gap-3 py-8 text-muted">
          <UIcon name="i-lucide-file" class="size-12" />
          <p class="text-sm">Keine Vorschau verfügbar.</p>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-between w-full gap-2">
        <UButton
          variant="outline"
          color="neutral"
          label="Schließen"
          @click="close"
        />
        <UButton
          icon="i-lucide-external-link"
          label="Im Browser öffnen"
          :to="url"
          target="_blank"
          @click="close"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{ invoice: InvoicesResponse }>();

const { pb } = usePocketbase();

const url = computed(() => pb.files.getURL(props.invoice, props.invoice.file));

const isImage = computed(() =>
  /\.(jpg|jpeg|png|webp|gif)$/i.test(props.invoice.file ?? ""),
);
const isPdf = computed(() => /\.pdf$/i.test(props.invoice.file ?? ""));
</script>
