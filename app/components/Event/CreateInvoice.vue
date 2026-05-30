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

    <CurrencyConverter @use="(v) => (state.value = v)" />

    <UFormField class="w-full" label="Kategorie" name="category">
      <USelect
        v-model="state.category"
        :items="categoryOptions"
        size="lg"
        class="w-full"
        placeholder="Kategorie wählen"
      />
    </UFormField>

    <UFormField class="w-full" label="Bezahlt via" name="paidVia">
      <USelect
        v-model="state.paidVia"
        :items="paidViaOptions"
        size="lg"
        class="w-full"
        placeholder="Zahlungsweg wählen"
      />
    </UFormField>

    <UFormField v-if="state.paidVia === 'User'" class="w-full" label="Bezahlt von" name="paidBy">
      <USelect
        v-model="state.paidBy"
        :items="userItems"
        size="lg"
        class="w-full"
        placeholder="Benutzer wählen"
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

const paidViaOptions = Object.values(InvoicesPaidViaOptions);
const categoryOptions = Object.values(InvoicesCategoryOptions);

const { data: users } = await useAsyncData("invoice-users", () =>
  pb.collection(Collections.Users).getFullList<UsersResponse>({ sort: "name", requestKey: null }),
  { default: () => [] as UsersResponse[] },
);

const userItems = computed(() =>
  users.value.map((u) => ({ label: u.name || u.email, value: u.id })),
);

const initialState = () => ({
  name: "",
  value: undefined as number | undefined,
  category: undefined as string | undefined,
  paidVia: undefined as string | undefined,
  paidBy: undefined as string | undefined,
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
      category: state.category,
      paidVia: state.paidVia,
      paidBy: state.paidVia === "User" ? state.paidBy : null,
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
