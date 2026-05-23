<template>
  <UModal title="In andere Liste verschieben">
    <UButton
      color="secondary"
      variant="ghost"
      size="sm"
      icon="i-lucide-folder-input"
    />

    <template #body>
      <UFormField label="Liste" name="list">
        <USelectMenu
          v-model="selectedList"
          :items="listOptions"
          value-key="value"
          size="lg"
          class="w-full"
          placeholder="Liste auswählen..."
        />
      </UFormField>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-between gap-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Abbrechen"
          @click="close"
        />
        <UButton
          color="primary"
          label="Verschieben"
          icon="i-lucide-folder-input"
          :loading="loading"
          :disabled="!selectedList"
          @click="onSubmit(close)"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const emit = defineEmits(["refresh"]);
const props = defineProps({
  item: {
    type: Object as () => ItemsResponse,
    required: true,
  },
});

const toast = useToast();
const toastError = useToastError();
const loading = ref(false);
const selectedList = ref("");

const { data: lists } = await useAsyncData("all-lists-for-move", () =>
  pb.collection(Collections.Lists).getFullList<ListsResponse>({
    sort: "name",
    requestKey: null,
  }),
);

const listOptions = computed(() =>
  (lists.value ?? [])
    .filter((l) => l.id !== props.item.list)
    .map((l) => ({ label: l.name || l.id, value: l.id })),
);

const onSubmit = async (close: () => void) => {
  if (!selectedList.value) return;
  loading.value = true;
  try {
    await pb.collection(Collections.Items).update(props.item.id, {
      list: selectedList.value,
    });
    toast.add({ title: "Eintrag verschoben", icon: "i-lucide-folder-input" });
    selectedList.value = "";
    emit("refresh");
    close();
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};
</script>
