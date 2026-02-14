<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton
      label="Liste erstellen"
      @click="open = true"
      icon="i-lucide-plus"
    />

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Neue Liste erstellen</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm class="mt-4 flex flex-col gap-4" :state="state">
          <UFormField class="w-full" label="Name" name="name">
            <UInput size="lg" class="w-full" v-model="state.name" />
          </UFormField>

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
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

const router = useRouter();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: "",
  createdBy: "",
  updatedBy: "",
});

const onSubmit = async () => {
  loading.value = true;

  const record = await pb
    .collection("eventlists")
    .create({ ...state, createdBy: user.value?.id });

  toast.add({
    title: "Liste erstellt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;

  router.push(`lists/${record.id}`);
};

const onAbort = async () => {
  Object.assign(state, { name: "", createdBy: "", updatedBy: "" });
  open.value = false;
};
</script>
