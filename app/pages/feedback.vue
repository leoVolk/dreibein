<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Feedback', to: '/feedback' },
      ]"
    />

    <UPageHeader
      title="Feedback"
      description="Hilf uns, 3Bein zu verbessern."
    />

    <UCard class="mt-4">
      <template #header>
        <h3 class="text-xl flex items-center gap-2">
          <UIcon name="i-lucide-message-circle-heart" class="size-6" />
          <span>Dein Feedback</span>
        </h3>
      </template>

      <UForm
        :state="form"
        class="flex flex-col gap-4"
        @submit.prevent="onSubmit"
      >
        <UFormField label="Titel" name="title" required>
          <UInput
            v-model="form.title"
            size="lg"
            class="w-full"
            placeholder="Kurze Zusammenfassung"
          />
        </UFormField>

        <UFormField label="Nachricht" name="message" required>
          <UTextarea
            v-model="form.message"
            size="lg"
            class="w-full"
            :rows="8"
            placeholder="Was läuft gut? Was könnte besser sein?"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            :loading="loading"
            :disabled="!form.title || !form.message"
            type="submit"
            color="primary"
            icon="i-lucide-send"
            label="Absenden"
            @click="onSubmit"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();
const loading = ref(false);

const form = reactive({
  title: "",
  message: "",
});

const onSubmit = async () => {
  loading.value = true;
  try {
    // TODO: wire up a feedback collection / endpoint when backend is ready.
    toast.add({
      title: "Danke für dein Feedback!",
      icon: "i-lucide-check",
    });
    form.title = "";
    form.message = "";
  } finally {
    loading.value = false;
  }
};
</script>
