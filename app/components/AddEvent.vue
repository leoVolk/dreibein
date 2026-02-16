<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton icon="i-lucide-plus" @click="open = true"
      >Event hinzufügen</UButton
    >

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Neues Event</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm :state="state" class="mt-4 flex flex-col gap-4">
          <UFormField class="w-full" label="Name" name="name">
            <UInput size="lg" class="w-full" v-model="state.name" />
          </UFormField>

          <div class="flex lg:flex-row flex-col gap-4">
            <UFormField class="w-full" label="Start" name="start">
              <UInput type="date" class="w-full" v-model="state.startDate" />
            </UFormField>
            <UFormField class="w-full" label="Ende" name="end">
              <UInput type="date" class="w-full" v-model="state.endDate" />
            </UFormField>
          </div>

          <div class="flex flex-row gap-4 items-center">
            <label for="recurring"> Wiederholung</label>
            <UCheckbox
              v-model="isRecurring"
              name="recurring"
              id="recurring"
              size="lg"
            ></UCheckbox>
          </div>

          <div v-if="isRecurring">
            <UCheckboxGroup
              :items="daysOfWeek"
              variant="table"
              v-model="state.daysOfWeek"
            ></UCheckboxGroup>
          </div>

          <div class="flex gap-4">
            <UButton
              @click="onAbort"
              size="lg"
              class="w-full justify-center"
              color="error"
              icon="i-lucide-save"
            >
              Abbrechen
            </UButton>
            <UButton
              :loading="loading"
              @click="onSubmit"
              size="lg"
              class="w-full justify-center"
              color="success"
              icon="i-lucide-save"
            >
              Speichern
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const isRecurring = ref(false);
const daysOfWeek = ref([
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
]);

const state = reactive({
  name: "",
  createdBy: "",
  updatedBy: "",
  startDate: null,
  endDate: null,
  daysOfWeek: [],
});

const onSubmit = async () => {
  loading.value = true;

  const daysOfWeekIndex = <any>[];

  state.daysOfWeek.forEach((d) =>
    daysOfWeekIndex.push(daysOfWeek.value.indexOf(d)),
  );

  state.daysOfWeek = daysOfWeekIndex;

  const record = await pb
    .collection("events")
    .create({ ...state, createdBy: user.value?.id });

  toast.add({
    title: "Event eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;
};

const onAbort = async () => {
  open.value = false;
};
</script>
