<template>
  <FormDrawer
    v-model:open="open"
    :title="isEdit ? 'Event bearbeiten' : 'Neues Event'"
    :submit-label="isEdit ? 'Aktualisieren' : 'Speichern'"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger>
      <span class="hidden" />
    </template>

    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <div class="flex lg:flex-row flex-col gap-4">
      <UFormField class="w-full" label="Start" name="startDate">
        <UInput
          v-model="state.startDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
      <UFormField class="w-full" label="Ende" name="endDate">
        <UInput
          v-model="state.endDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex flex-row gap-4 items-center">
      <label for="event-editor-recurring">Wiederholung</label>
      <UCheckbox
        id="event-editor-recurring"
        v-model="isRecurring"
        name="recurring"
        size="lg"
      />
    </div>

    <div v-if="isRecurring">
      <UCheckboxGroup
        v-model="state.daysOfWeek"
        :items="DAY_NAMES"
        variant="table"
      />
    </div>

    <div v-if="isEdit" class="border-t border-default pt-4 mt-2">
      <DeleteConfirmModal
        title="Event löschen"
        :description="`Soll das Event ${props.event?.name ?? ''} wirklich gelöscht werden?`"
        confirm-label="Event löschen"
        @confirm="(close: () => void) => onDelete(close)"
      >
        <UButton
          type="button"
          color="error"
          variant="outline"
          icon="i-lucide-trash"
          block
        >
          Event löschen
        </UButton>
      </DeleteConfirmModal>
    </div>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  event?: { id: string; name?: string; startDate?: string; endDate?: string; daysOfWeek?: number[] } | null;
  initialDate?: string | null;
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const loading = ref(false);

const DAY_NAMES = WEEK_DAYS;

const isEdit = computed(() => !!props.event?.id);
const isRecurring = ref(false);

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
};

const buildState = (): FormState => {
  if (props.event) {
    const dayIndices = Array.isArray(props.event.daysOfWeek)
      ? props.event.daysOfWeek
      : [];
    return {
      name: props.event.name ?? "",
      startDate: toLocalDateTime(props.event.startDate),
      endDate: toLocalDateTime(props.event.endDate),
      daysOfWeek: dayIndices
        .map((i) => INDEX_TO_DAY[i])
        .filter((d): d is string => Boolean(d)),
    };
  }
  return {
    name: "",
    startDate: toLocalDateTime(props.initialDate),
    endDate: toLocalDateTime(props.initialDate),
    daysOfWeek: [],
  };
};

const state = reactive<FormState>(buildState());

const seed = () => {
  Object.assign(state, buildState());
  isRecurring.value = state.daysOfWeek.length > 0;
};

watch(open, (next) => {
  if (next) seed();
});

watch(
  () => [props.event, props.initialDate],
  () => {
    if (open.value) seed();
  },
);

const onSubmit = async () => {
  if (!state.name.trim()) {
    toast.add({
      color: "warning",
      title: "Name ist erforderlich",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  loading.value = true;

  const daysOfWeekIndex = isRecurring.value
    ? state.daysOfWeek
        .map((d) => DAY_TO_INDEX[d])
        .filter((i): i is number => i !== undefined)
    : [];

  const payload = {
    name: state.name,
    startDate: toPbDateTime(state.startDate),
    endDate: toPbDateTime(state.endDate),
    daysOfWeek: daysOfWeekIndex,
  };

  try {
    if (isEdit.value && props.event) {
      await pb.collection("events").update(props.event.id, {
        ...payload,
        updatedBy: user.value?.id,
      });
      toast.add({ title: "Event aktualisiert", icon: "i-lucide-save" });
    } else {
      await pb.collection("events").create({
        ...payload,
        createdBy: user.value?.id,
      });
      toast.add({ title: "Event eingefügt", icon: "i-lucide-save" });
    }

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onDelete = async (close: () => void) => {
  if (!props.event) return;
  loading.value = true;
  try {
    await pb.collection("events").delete(props.event.id);
    toast.add({ title: "Event gelöscht", icon: "i-lucide-trash" });
    close();
    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  seed();
};
</script>
