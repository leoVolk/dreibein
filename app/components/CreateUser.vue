<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton
      @click="open = true"
      icon="i-lucide-plus"
      label="Benutzer anlegen"
    />

    <template #body>
      <div class="flex flex-col p-4 min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Neuen Benutzer erstellen</span>
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

          <UFormField class="w-full" label="E-Mail" name="email">
            <UInput size="lg" class="w-full" v-model="state.email" />
          </UFormField>

          <UFormField class="w-full" label="Passwort" name="password">
            <UInput
              size="lg"
              class="w-full"
              v-model="state.password"
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
                  ></UButton>
                  <UButton
                    variant="ghost"
                    size="sm"
                    :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="show ? 'Hide password' : 'Show password'"
                    :aria-pressed="show"
                    aria-controls="password"
                    @click="show = !show"
                  ></UButton>
                </div>
              </template>
            </UInput>
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

const emit = defineEmits(["refresh"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const show = ref(false);

const state = reactive({
  name: "",
  email: "",
  password: "",
  emailVisibility: true,
});

const onSubmit = async () => {
  const record = await pb
    .collection("users")
    .create({ ...state, passwordConfirm: state.password });

  await pb.collection("users").requestPasswordReset(record.email);
};

const onAbort = async () => {
  Object.assign(state, { name: "", email: "" });
  open.value = false;
};

const generatePassword = () => {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    password = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }

  state.password = password;
};
</script>

<style></style>
