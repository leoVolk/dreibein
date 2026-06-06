<template>
  <div class="h-screen flex flex-col p-4 justify-center items-center">
    <UPageCard class="w-full max-w-md">
      <!-- Expired invite -->
      <template v-if="expiredInvite">
        <div class="flex flex-col items-center gap-4 py-4">
          <UIcon name="i-lucide-clock-alert" class="size-12 text-warning" />
          <h1 class="text-xl font-bold text-center">Einladung abgelaufen</h1>
          <p class="text-sm text-muted text-center">
            Diese Einladung ist abgelaufen. Bitte fordere eine neue Einladung
            an.
          </p>
          <UButton to="/login" variant="ghost" icon="i-lucide-arrow-left">
            Zur Anmeldung
          </UButton>
        </div>
      </template>

      <!-- Invalid / missing invite -->
      <template v-else-if="invalidInvite">
        <div class="flex flex-col items-center gap-4 py-4">
          <UIcon name="i-lucide-link-2-off" class="size-12 text-muted" />
          <h1 class="text-xl font-bold text-center">Einladung ungültig</h1>
          <p class="text-sm text-muted text-center">
            Diese Einladung existiert nicht oder wurde bereits verwendet.
          </p>
          <UButton to="/login" variant="ghost" icon="i-lucide-arrow-left">
            Zur Anmeldung
          </UButton>
        </div>
      </template>

      <!-- Registration form -->
      <template v-else-if="invite">
        <UIcon
          name="i-lucide-tent-tree"
          class="size-12 mx-auto mb-4 text-primary"
        />
        <h1 class="text-2xl text-center font-bold mb-1">Gut Pfad!</h1>
        <p class="text-center text-muted text-sm mb-6">
          Erstelle dein
          <span class="text-primary">III</span
          ><span class="text-foreground font-semibold">Bein</span> Konto.
        </p>

        <UForm
          :state="form"
          class="flex flex-col gap-4"
          @submit.prevent="register"
        >
          <UFormField label="E-Mail" required>
            <UInput
              :model-value="invite.email"
              type="email"
              icon="i-lucide-at-sign"
              class="w-full"
              size="lg"
              disabled
            />
          </UFormField>

          <UFormField label="Name" required>
            <UInput
              v-model="form.name"
              placeholder="Dein Name"
              icon="i-lucide-user"
              class="w-full"
              size="lg"
              autocomplete="name"
            />
          </UFormField>

          <UFormField label="Passwort" required :error="errors.password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Passwort (min. 8 Zeichen)"
              icon="i-lucide-lock"
              class="w-full"
              size="lg"
              autocomplete="new-password"
            />
          </UFormField>

          <UFormField
            label="Passwort bestätigen"
            required
            :error="errors.passwordConfirm"
          >
            <UInput
              v-model="form.passwordConfirm"
              type="password"
              placeholder="Passwort wiederholen"
              icon="i-lucide-lock-keyhole"
              class="w-full"
              size="lg"
              autocomplete="new-password"
            />
          </UFormField>

          <UAlert
            v-if="submitError"
            color="error"
            icon="i-lucide-triangle-alert"
            :title="submitError"
          />

          <UButton
            type="submit"
            class="justify-center"
            size="lg"
            :loading="loading"
            :disabled="!form.name || !form.password || !form.passwordConfirm"
          >
            Konto erstellen
          </UButton>
        </UForm>
      </template>

      <!-- Loading skeleton -->
      <template v-else>
        <div class="flex flex-col gap-4 py-2">
          <USkeleton class="h-8 w-3/4 mx-auto" />
          <USkeleton class="h-4 w-1/2 mx-auto" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>
      </template>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const route = useRoute();
const { pb } = usePocketbase();
const { signup, login, signOut } = usePocketbaseAuth();

type InviteRecord = { id: string; email: string; expires: string };

const invite = ref<InviteRecord | null>(null);
const invalidInvite = ref(false);
const expiredInvite = ref(false);
const loading = ref(false);
const submitError = ref<string | null>(null);

const form = reactive({
  name: "",
  password: "",
  passwordConfirm: "",
});

const errors = reactive({
  password: "",
  passwordConfirm: "",
});

const token = route.params.token as string;

try {
  const record = await pb
    .collection("invites")
    .getFirstListItem<InviteRecord>(`token = "${token}"`);
  if (record.expires && new Date(record.expires) < new Date()) {
    expiredInvite.value = true;
  } else {
    invite.value = record;
  }
} catch {
  invalidInvite.value = true;
}

const validate = () => {
  errors.password = "";
  errors.passwordConfirm = "";
  let valid = true;

  if (form.password.length < 8) {
    errors.password = "Mindestens 8 Zeichen erforderlich.";
    valid = false;
  }
  if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = "Passwörter stimmen nicht überein.";
    valid = false;
  }
  return valid;
};

const register = async () => {
  if (!invite.value || !validate()) return;

  if (pb.authStore.isValid) {
    await signOut();
    await pb.authStore.clear();
  }

  loading.value = true;
  submitError.value = null;

  try {
    const newUser = await signup({
      email: invite.value.email,
      name: form.name,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
    });

    if (!newUser) {
      submitError.value = "Registrierung fehlgeschlagen.";
      return;
    }

    await login({ email: invite.value.email, password: form.password });
    await pb.send(`/api/invites/${invite.value.id}`, { method: "DELETE" });
    await navigateTo("/");
  } catch (e: any) {
    submitError.value =
      e?.response?.message ?? e?.message ?? "Registrierung fehlgeschlagen.";
  } finally {
    loading.value = false;
  }
};
</script>
