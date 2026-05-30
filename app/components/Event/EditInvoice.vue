<template>
  <FormDrawer
    v-model:open="open"
    title="Rechnung bearbeiten"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-lucide-edit"
        color="primary"
        @click="openDrawer"
      />
    </template>

    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <UFormField class="w-full" label="Betrag (€)" name="value">
      <UInput
        v-model="state.value"
        type="number"
        step="0.01"
        min="0"
        size="lg"
        class="w-full"
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
        v-if="invoice.file && !newFile && !removeExistingFile"
        class="flex items-center gap-2 p-3 border border-default rounded-lg mb-2 text-sm"
      >
        <UIcon name="i-lucide-paperclip" class="size-4 text-muted shrink-0" />
        <span class="truncate flex-1">{{ invoice.file }}</span>
        <UButton
          icon="i-lucide-x"
          size="xs"
          variant="ghost"
          color="error"
          @click="removeExistingFile = true"
        />
      </div>

      <div
        class="flex items-center gap-3 p-3 border border-default rounded-lg cursor-pointer hover:border-primary transition-colors"
        @click="fileInput?.click()"
      >
        <UIcon name="i-lucide-paperclip" class="size-4 text-muted shrink-0" />
        <span
          class="text-sm truncate flex-1"
          :class="newFile ? 'text-foreground' : 'text-muted'"
        >
          {{ newFile?.name ?? "Neue Datei auswählen (PDF, Bild)" }}
        </span>
        <UButton
          v-if="newFile"
          icon="i-lucide-x"
          size="xs"
          variant="ghost"
          color="neutral"
          @click.stop="clearNewFile"
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
const props = defineProps<{ invoice: InvoicesResponse }>();
const emit = defineEmits(["refresh"]);

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const open = ref(false);
const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const newFile = ref<File | null>(null);
const removeExistingFile = ref(false);

const paidViaOptions = Object.values(InvoicesPaidViaOptions);
const categoryOptions = Object.values(InvoicesCategoryOptions);

const { data: users } = await useAsyncData("invoice-users", () =>
  pb.collection(Collections.Users).getFullList<UsersResponse>({ sort: "name", requestKey: null }),
  { default: () => [] as UsersResponse[] },
);

const userItems = computed(() =>
  users.value.map((u) => ({ label: u.name || u.email, value: u.id })),
);

const state = reactive({
  name: props.invoice.name ?? "",
  value: props.invoice.value as number | undefined,
  category: props.invoice.category as string | undefined,
  paidVia: props.invoice.paidVia as string | undefined,
  paidBy: props.invoice.paidBy as string | undefined,
});

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  newFile.value = input.files?.[0] ?? null;
  if (newFile.value) removeExistingFile.value = false;
};

const clearNewFile = () => {
  newFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const onSubmit = async () => {
  loading.value = true;
  try {
    const payload: Record<string, any> = {
      name: state.name,
      value: state.value,
      category: state.category,
      paidVia: state.paidVia,
      paidBy: state.paidVia === "User" ? state.paidBy : null,
    };
    if (newFile.value) {
      payload.file = newFile.value;
    } else if (removeExistingFile.value) {
      payload["file-"] = props.invoice.file;
    }

    await pb.collection(Collections.Invoices).update(props.invoice.id, payload);
    toast.add({ title: "Rechnung aktualisiert", icon: "i-lucide-save" });
    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  state.name = props.invoice.name ?? "";
  state.value = props.invoice.value;
  state.category = props.invoice.category;
  state.paidVia = props.invoice.paidVia;
  state.paidBy = props.invoice.paidBy;
  clearNewFile();
  removeExistingFile.value = false;
};
</script>
