<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :handle="false"
    :dismissible="false"
  >
    <slot name="trigger" :open="openDrawer">
      <UButton
        color="primary"
        :icon="triggerIcon || 'i-lucide-plus'"
        :label="triggerLabel || undefined"
        @click="openDrawer"
      />
    </slot>

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">{{ title }}</span>
          <UIcon
            name="i-lucide-x"
            class="size-8 cursor-pointer"
            @click="close"
          />
        </div>

        <UForm
          :state="state ?? {}"
          class="mt-4 flex flex-col gap-4"
          @submit.prevent="onSubmit"
        >
          <slot />

          <div class="flex gap-4">
            <UButton
              type="button"
              size="lg"
              class="w-full justify-center"
              color="error"
              variant="outline"
              icon="i-lucide-x"
              @click="close"
            >
              Abbrechen
            </UButton>
            <UButton
              :loading="loading"
              type="submit"
              size="lg"
              class="w-full justify-center"
              color="primary"
              icon="i-lucide-save"
            >
              {{ submitLabel }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: { type: String, required: true },
  triggerLabel: { type: String, default: "" },
  triggerIcon: { type: String, default: "" },
  submitLabel: { type: String, default: "Speichern" },
  loading: { type: Boolean, default: false },
  state: { type: Object, default: undefined },
});

const emit = defineEmits<{
  submit: [];
  close: [];
}>();

const open = defineModel<boolean>("open", { default: false });

const openDrawer = () => {
  open.value = true;
};

const close = () => {
  open.value = false;
  emit("close");
};

const onSubmit = () => emit("submit");
</script>
