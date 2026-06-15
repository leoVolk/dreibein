<template>
  <UModal v-model:open="open" title="PDF Export">
    <template #body>
      <div class="flex flex-col divide-y divide-default">
        <div
          v-for="option in options"
          :key="option.key"
          class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div class="flex items-start gap-3">
            <UIcon :name="option.icon" class="size-5 mt-0.5 shrink-0 text-muted" />
            <div>
              <p class="font-medium text-sm">{{ option.title }}</p>
              <p class="text-xs text-muted mt-0.5">{{ option.description }}</p>
            </div>
          </div>
          <UButton
            icon="i-lucide-download"
            variant="outline"
            color="neutral"
            size="sm"
            class="shrink-0"
            :loading="loading === option.key"
            :disabled="!!loading"
            @click="onExport(option.key)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full">
        <UButton variant="ghost" label="Schließen" @click="open = false" />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  participants: ParticipantsResponse[];
  eventName?: string;
}>();

const { exportRankList, exportDietaryList, exportHealthList } = useParticipantsPDF();
const loading = ref<string | null>(null);

const options = [
  {
    key: "rank",
    icon: "i-lucide-list",
    title: "Teilnehmerliste",
    description: "Alle Teilnehmer mit Name und Stufe, sortiert nach Stufe",
  },
  {
    key: "dietary",
    icon: "i-lucide-salad",
    title: "Ernährung & Allergien",
    description: "Nur Teilnehmer mit Ernährungswünschen oder Allergien",
  },
  {
    key: "health",
    icon: "i-lucide-heart-pulse",
    title: "Gesundheit",
    description: "Nur Teilnehmer mit Krankheiten oder Medikamenten",
  },
];

const onExport = async (key: string) => {
  loading.value = key;
  try {
    if (key === "rank") await exportRankList(props.participants, props.eventName);
    if (key === "dietary") await exportDietaryList(props.participants, props.eventName);
    if (key === "health") await exportHealthList(props.participants, props.eventName);
  } finally {
    loading.value = null;
  }
};
</script>
