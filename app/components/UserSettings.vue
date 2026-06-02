<template>
  <div class="pt-4">
    <UCard>
      <template #header>
        <h3 class="text-xl flex items-center gap-2">
          <UIcon name="i-lucide-user" class="size-6" /> Benutzer Einstellungen
        </h3>
      </template>
      <template #default>
        <UForm class="flex flex-col gap-4" :state="state">
          <div class="grid grid-rows-1 md:grid-cols-2 gap-4">
            <UFormField label="Benutzername">
              <UInput
                v-model="state.username"
                size="lg"
                class="w-full"
              ></UInput>
            </UFormField>
            <UFormField label="E-Mail">
              <UInput
                icon="i-lucide-mail"
                disabled
                v-model="state.email"
                size="lg"
                class="w-full"
              ></UInput>
            </UFormField>
          </div>
          <div class="flex justify-end">
            <UButton
              icon="i-lucide-save"
              color="primary"
              @click="onUserNameChange()"
              label="Speichern"
            ></UButton>
          </div>
        </UForm>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

const toast = useToast();
const toastError = useToastError();

const state = reactive({
  username: user.value?.name,
  email: user.value?.email,
});

const onUserNameChange = async () => {
  if (!user.value?.id) return;

  try {
    await pb.collection("users").update(user.value?.id, {
      name: state.username,
    });

    toast.add({ title: "Nutzerdaten geändert", icon: "i-lucide-save" });
  } catch (error: any) {
    toastError(error);
  }
};

onMounted(async () => {
  state.username = user.value?.name;
  state.email = user.value?.email;
});
</script>

<style></style>
