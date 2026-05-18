<template>
  <FormDrawer
    v-model:open="open"
    title="Neuen Benutzer erstellen"
    trigger-label="Benutzer anlegen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <UFormField class="w-full" label="E-Mail" name="email">
      <UInput v-model="state.email" size="lg" class="w-full" />
    </UFormField>

    <UFormField class="w-full" label="Passwort" name="password">
      <UInput
        v-model="state.password"
        size="lg"
        class="w-full"
        :type="show ? 'text' : 'password'"
        :ui="{ trailing: 'pe-1' }"
      >
        <template #trailing>
          <div class="flex gap-2">
            <UButton
              variant="ghost"
              size="sm"
              icon="i-lucide-rotate-ccw"
              @click="generatePassword"
            />
            <UButton
              variant="ghost"
              size="sm"
              :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="show ? 'Hide password' : 'Show password'"
              :aria-pressed="show"
              aria-controls="password"
              @click="show = !show"
            />
          </div>
        </template>
      </UInput>
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const show = ref(false);

const initialState = () => ({
  name: "",
  email: "",
  password: "",
  emailVisibility: true,
});

const state = reactive(initialState());

const onSubmit = async () => {
  loading.value = true;

  try {
    const record = await pb
      .collection("users")
      .create({ ...state, passwordConfirm: state.password });

    toast.add({
      title: "Benutzer erstellt",
      icon: "i-lucide-save",
    });

    await pb.collection("users").requestPasswordReset(record.email);

    toast.add({
      title: "Passwort E-Mail versandt",
      icon: "i-lucide-mail-check",
    });

    emit("refresh");
    Object.assign(state, initialState());
    open.value = false;
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, initialState());
};

const generatePassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  state.password = password;
};
</script>
