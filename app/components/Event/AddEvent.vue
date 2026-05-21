<template>
  <FormDrawer
    v-model:open="open"
    title="Neues Event"
    trigger-label="Event hinzufügen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <div class="flex lg:flex-row flex-col gap-4">
      <UFormField class="w-full" label="Start" name="start">
        <UInput
          v-model="state.startDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
      <UFormField class="w-full" label="Ende" name="end">
        <UInput
          v-model="state.endDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex flex-row gap-4 items-center">
      <label for="recurring"> Wiederholung</label>
      <UCheckbox
        id="recurring"
        v-model="isRecurring"
        name="recurring"
        size="lg"
      />
    </div>

    <div v-if="isRecurring">
      <UCheckboxGroup
        v-model="state.daysOfWeek"
        :items="daysOfWeek"
        variant="table"
      />
    </div>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const isRecurring = ref(false);
const daysOfWeek = WEEK_DAYS;

const initialState = () => ({
  name: "",
  startDate: "",
  endDate: "",
  daysOfWeek: [] as string[],
});

const state = reactive(initialState());

const onSubmit = async () => {
  loading.value = true;

  const daysOfWeekIndex = state.daysOfWeek
    .map((d) => DAY_TO_INDEX[d])
    .filter((i): i is number => i !== undefined);

  try {
    await pb.collection("events").create({
      ...state,
      startDate: toPbDateTime(state.startDate),
      endDate: toPbDateTime(state.endDate),
      daysOfWeek: daysOfWeekIndex,
      createdBy: user.value?.id,
    });

    toast.add({ title: "Event eingefügt", icon: "i-lucide-save" });

    emit("refresh");

    Object.assign(state, initialState());
    isRecurring.value = false;
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, initialState());
  isRecurring.value = false;
};
</script>
