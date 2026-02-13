<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton icon="i-lucide-plus" @click="open = true"
      >Material hinzufügen</UButton
    >

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Material hinzufügen</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm class="mt-4 flex flex-col gap-4">
          <UFormField class="w-full" label="Material auswählen">
            <USelectMenu
              class="w-full"
              v-model="selectedItem"
              :items="mappedItems"
            />
          </UFormField>
        </UForm>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);
const props = defineProps(["listId"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const selectedItem = ref();

const items = await pb.collection("items").getFullList({ requestKey: null });

const mappedItems = items.map((item, i) => ({
  label: item.name,
  value: item,
}));

const onSubmit = async () => {
  loading.value = true;

  await pb.collection("items").create({});
  await pb
    .collection("lists")
    .update(props.listId, { updatedBy: user.value?.id });

  toast.add({
    title: "Eintrag eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  Object.assign(
    {},
    {
      checkout: "",
      description: "",
      id: "",
      image: null,
      name: "",
      quantity: 0,
      status: "none",
      weight: 0,
      list: props.listId,
    },
  );

  loading.value = false;
  open.value = false;
};

const onAbort = async () => {
  open.value = false;
};
</script>
