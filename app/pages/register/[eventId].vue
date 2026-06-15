<template>
  <div
    class="min-h-screen bg-background flex items-start justify-center p-4 sm:p-8"
  >
    <div class="w-full max-w-4xl">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <UIcon name="i-lucide-tent" class="size-6 text-primary" />
          <span class="font-semibold text-2xl">
            <span class="text-primary">III</span>Bein
          </span>
        </div>
        <h1 class="text-2xl font-bold">Anmeldung</h1>
        <p v-if="event" class="text-muted mt-1">{{ event.name }}</p>
        <p v-else-if="eventPending" class="text-muted mt-1">Lädt...</p>
        <UAlert
          v-else
          color="error"
          icon="i-lucide-alert-circle"
          title="Veranstaltung nicht gefunden"
          description="Dieser Anmeldelink ist ungültig oder abgelaufen."
        />
      </div>

      <!-- Success -->
      <UCard v-if="submitted">
        <div class="flex flex-col items-center gap-4 py-8 text-center">
          <UIcon name="i-lucide-circle-check" class="size-14 text-success" />
          <div>
            <p class="text-lg font-semibold">Anmeldung erfolgreich!</p>
            <p class="text-muted mt-1">
              Danke für deine Anmeldung zu
              <strong>{{ event?.name }}</strong
              >.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Form -->
      <UCard v-else-if="event">
        <div class="flex flex-col gap-5">
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Persönliche Daten
          </p>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Vorname" required class="w-full">
              <UInput v-model="state.firstname" class="w-full" />
            </UFormField>
            <UFormField label="Nachname" required class="w-full">
              <UInput v-model="state.lastname" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Stufe" class="w-full">
              <USelect
                v-model="state.rank"
                :items="rankOptions"
                placeholder="Bitte wählen..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Alter" class="w-full">
              <UInput v-model.number="state.age" type="number" class="w-full" />
            </UFormField>
          </div>

          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Adresse
          </p>

          <UFormField label="Straße" class="w-full">
            <UInput v-model="state.street" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="PLZ" class="w-full">
              <UInput v-model.number="state.zip" type="number" class="w-full" />
            </UFormField>
            <UFormField label="Ort" class="col-span-2 w-full">
              <UInput v-model="state.city" class="w-full" />
            </UFormField>
          </div>

          <p
            class="text-lg font-semibold uppercase tracking-wider text-muted mt-2"
          >
            Kontakt
          </p>

          <UFormField label="E-Mail" class="w-full">
            <UInput v-model="state.email" type="email" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Mobil" class="w-full">
              <UInput v-model="state.mobile" class="w-full" />
            </UFormField>
            <UFormField label="Telefon" class="w-full">
              <UInput v-model="state.phone" class="w-full" />
            </UFormField>
          </div>

          <p
            class="text-lg font-semibold uppercase tracking-wider text-muted mt-2"
          >
            Erziehungsberechtigte/r
          </p>

          <UFormField label="Name" class="w-full">
            <UInput v-model="state.nameGuardian" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="E-Mail" class="w-full">
              <UInput
                v-model="state.emailGuardian"
                type="email"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Telefon" class="w-full">
              <UInput v-model="state.phoneGuardian" class="w-full" />
            </UFormField>
          </div>

          <p
            class="text-xs font-semibold uppercase tracking-wider text-muted mt-2"
          >
            Notfallkontakte
          </p>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Notfallkontakt 1" class="w-full">
              <UInput v-model="state.emergency1" class="w-full" />
            </UFormField>
            <UFormField label="Notfallkontakt 2" class="w-full">
              <UInput v-model="state.emergency2" class="w-full" />
            </UFormField>
          </div>

          <p
            class="text-lg font-semibold uppercase tracking-wider text-muted mt-2"
          >
            Gesundheitsbogen
          </p>

          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Allergien" class="w-full">
                <UTextarea v-model="state.allergies" class="w-full" :rows="2" />
              </UFormField>
              <UFormField label="Ernährungswünsche" class="w-full">
                <UTextarea
                  v-model="state.dietaryPreferences"
                  class="w-full"
                  :rows="2"
                />
              </UFormField>
              <UFormField label="Krankheiten" class="w-full">
                <UTextarea v-model="state.illnesses" class="w-full" :rows="2" />
              </UFormField>
              <UFormField label="Medikamente" class="w-full">
                <UTextarea
                  v-model="state.medications"
                  class="w-full"
                  :rows="2"
                />
              </UFormField>
              <UFormField label="Sonstiges" class="col-span-2 w-full">
                <UTextarea v-model="state.other" class="w-full" :rows="2" />
              </UFormField>
            </div>

            <p
              class="text-lg font-semibold uppercase tracking-wider text-muted"
            >
              Berechtigung
            </p>

            <p class="text-xs text-muted -mt-2">
              Ich erteile die Erlaubnis, folgende Erste-Hilfe-Maßnahmen bei
              meinem Kind durchzuführen:
            </p>

            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="state.disinfection" label="Desinfektion" />
              <UCheckbox v-model="state.fever" label="Fieberthermometer" />
              <UCheckbox v-model="state.splinter" label="Splitterpinzette" />
              <UCheckbox v-model="state.tick" label="Zeckenpinzette" />
            </div>

            <p
              class="text-lg font-semibold uppercase tracking-wider text-muted"
            >
              Anmerkungen
            </p>

            <UTextarea
              v-model="state.notes"
              placeholder="Weitere Hinweise..."
              class="w-full"
              :rows="3"
            />
          </div>

          <UButton
            label="Anmelden"
            icon="i-lucide-send"
            size="lg"
            block
            :loading="saving"
            :disabled="!state.firstname || !state.lastname"
            @click="onSubmit"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const route = useRoute();
const { pb } = usePocketbase();
const toast = useToast();

const eventId = computed(() => route.params.eventId as string);

const { data: event, pending: eventPending } = await useAsyncData(
  () => `register-event-${eventId.value}`,
  () =>
    pb
      .collection(Collections.Events)
      .getOne<EventsResponse>(eventId.value)
      .catch(() => null),
);

const rankOptions = Object.keys(RANK_COLORS);

const submitted = ref(false);
const saving = ref(false);
const detailsOpen = ref(false);

const state = reactive({
  firstname: "",
  lastname: "",
  rank: undefined as string | undefined,
  age: undefined as number | undefined,
  email: "",
  mobile: "",
  phone: "",
  nameGuardian: "",
  emailGuardian: "",
  phoneGuardian: "",
  emergency1: "",
  emergency2: "",
  allergies: "",
  dietaryPreferences: "",
  illnesses: "",
  medications: "",
  other: "",
  street: "",
  zip: undefined as number | undefined,
  city: "",
  disinfection: false,
  fever: false,
  splinter: false,
  tick: false,
  notes: "",
});

const onSubmit = async () => {
  if (!state.firstname || !state.lastname) return;
  saving.value = true;
  try {
    await pb.collection(Collections.Participants).create({
      event: eventId.value,
      ...state,
    });
    submitted.value = true;
  } catch (error: any) {
    toast.add({
      title: "Fehler bei der Anmeldung",
      description: error?.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    saving.value = false;
  }
};
</script>
