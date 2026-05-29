<template>
  <FormDrawer
    v-model:open="open"
    title="Rechnung hinzufügen"
    :trigger-label="undefined"
    trigger-icon="i-lucide-plus"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <UFormField class="w-full" label="Name" name="name">
      <UInput
        v-model="state.name"
        size="lg"
        class="w-full"
        placeholder="Rechnungsbezeichnung"
      />
    </UFormField>

    <UFormField class="w-full" label="Betrag (€)" name="value">
      <UInput
        v-model="state.value"
        type="number"
        step="0.01"
        min="0"
        size="lg"
        class="w-full"
        placeholder="0.00"
      />
    </UFormField>

    <UFormField class="w-full" label="Datei" name="file">
      <div
        class="flex items-center gap-3 p-3 border border-default rounded-lg cursor-pointer hover:border-primary transition-colors"
        @click="fileInput?.click()"
      >
        <UIcon name="i-lucide-paperclip" class="size-4 text-muted shrink-0" />
        <span
          class="text-sm truncate flex-1"
          :class="file ? 'text-foreground' : 'text-muted'"
        >
          {{ file?.name ?? "Datei auswählen (PDF, Bild)" }}
        </span>
        <UButton
          v-if="file"
          icon="i-lucide-x"
          size="xs"
          variant="ghost"
          color="neutral"
          @click.stop="file = null"
        />
      </div>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        @change="onFileChange"
      />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const props = defineProps<{ eventId: string }>();
const emit = defineEmits(["refresh"]);

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const open = ref(false);
const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);

const initialState = () => ({
  name: "",
  value: undefined as number | undefined,
});
const state = reactive(initialState());

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
};

const onSubmit = async () => {
  loading.value = true;
  try {
    const payload: Record<string, any> = {
      name: state.name,
      event: props.eventId,
    };
    if (state.value !== undefined) payload.value = state.value;
    if (file.value) payload.file = file.value;

    await pb.collection(Collections.Invoices).create(payload);
    toast.add({ title: "Rechnung hinzugefügt", icon: "i-lucide-save" });
    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, initialState());
  file.value = null;
  if (fileInput.value) fileInput.value.value = "";
};
</script>
