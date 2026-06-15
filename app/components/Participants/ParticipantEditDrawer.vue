<template>
  <FormDrawer
    v-model:open="open"
    title="Teilnehmer bearbeiten"
    :loading="saving"
    :state="state"
    @submit="onSubmit"
    @close="resetState"
  >
    <template #trigger="{ open: openDrawer }">
      <UButton
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        @click="openDrawer"
      />
    </template>

    <!-- Personal -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted">
      Persönlich
    </p>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Vorname" name="firstname" required class="w-full">
        <UInput v-model="state.firstname" class="w-full" />
      </UFormField>
      <UFormField label="Nachname" name="lastname" required class="w-full">
        <UInput v-model="state.lastname" class="w-full" />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Stufe" name="rank" class="w-full">
        <UInput v-model="state.rank" class="w-full" />
      </UFormField>
      <UFormField label="Alter" name="age" class="w-full">
        <UInput v-model.number="state.age" type="number" class="w-full" />
      </UFormField>
    </div>

    <div class="flex gap-6">
      <USwitch v-model="state.isLeader" label="Leitung" />
      <USwitch v-model="state.paid" label="Beitrag bezahlt" />
    </div>

    <!-- Contact -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Kontakt
    </p>

    <UFormField label="E-Mail" name="email" class="w-full">
      <UInput v-model="state.email" type="email" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Mobil" name="mobile" class="w-full">
        <UInput v-model="state.mobile" class="w-full" />
      </UFormField>
      <UFormField label="Telefon" name="phone" class="w-full">
        <UInput v-model="state.phone" class="w-full" />
      </UFormField>
    </div>

    <!-- Guardian -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Erziehungsberechtigte/r
    </p>

    <UFormField label="Name" name="nameGuardian" class="w-full">
      <UInput v-model="state.nameGuardian" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="E-Mail" name="emailGuardian" class="w-full">
        <UInput v-model="state.emailGuardian" type="email" class="w-full" />
      </UFormField>
      <UFormField label="Telefon" name="phoneGuardian" class="w-full">
        <UInput v-model="state.phoneGuardian" class="w-full" />
      </UFormField>
    </div>

    <!-- Address -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Adresse
    </p>

    <UFormField label="Straße" name="street" class="w-full">
      <UInput v-model="state.street" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-3 gap-4">
      <UFormField label="PLZ" name="zip" class="w-full">
        <UInput v-model.number="state.zip" type="number" class="w-full" />
      </UFormField>
      <UFormField label="Ort" name="city" class="col-span-2 w-full">
        <UInput v-model="state.city" class="w-full" />
      </UFormField>
    </div>

    <!-- Emergency contacts -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Notfallkontakte
    </p>

    <UFormField label="Notfallkontakt 1" name="emergency1" class="w-full">
      <UInput v-model="state.emergency1" class="w-full" />
    </UFormField>

    <UFormField label="Notfallkontakt 2" name="emergency2" class="w-full">
      <UInput v-model="state.emergency2" class="w-full" />
    </UFormField>

    <!-- Health -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Gesundheit
    </p>

    <UFormField label="Allergien" name="allergies" class="w-full">
      <UTextarea v-model="state.allergies" class="w-full" :rows="2" />
    </UFormField>

    <UFormField label="Ernährung" name="dietaryPreferences" class="w-full">
      <UTextarea v-model="state.dietaryPreferences" class="w-full" :rows="2" />
    </UFormField>

    <UFormField label="Krankheiten" name="illnesses" class="w-full">
      <UTextarea v-model="state.illnesses" class="w-full" :rows="2" />
    </UFormField>

    <UFormField label="Medikamente" name="medications" class="w-full">
      <UTextarea v-model="state.medications" class="w-full" :rows="2" />
    </UFormField>

    <UFormField label="Sonstiges" name="other" class="w-full">
      <UTextarea v-model="state.other" class="w-full" :rows="2" />
    </UFormField>

    <!-- Medical supplies -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Berechtigung
    </p>

    <div class="grid grid-cols-2 gap-3">
      <UCheckbox v-model="state.disinfection" label="Desinfektion" />
      <UCheckbox v-model="state.fever" label="Fieberthermometer" />
      <UCheckbox v-model="state.splinter" label="Splitterpinzette" />
      <UCheckbox v-model="state.tick" label="Zeckenpinzette" />
    </div>

    <!-- Notes -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Notizen
    </p>

    <UFormField name="notes" class="w-full">
      <UTextarea v-model="state.notes" class="w-full" :rows="3" />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const props = defineProps<{
  participant: ParticipantsResponse;
}>();

const emit = defineEmits<{ refresh: [] }>();

const { pb } = usePocketbase();
const toastError = useToastError();
const toast = useToast();

const open = ref(false);
const saving = ref(false);

const buildState = () => ({
  firstname: props.participant.firstname,
  lastname: props.participant.lastname,
  rank: props.participant.rank,
  age: props.participant.age,
  isLeader: props.participant.isLeader,
  paid: props.participant.paid,
  email: props.participant.email,
  mobile: props.participant.mobile,
  phone: props.participant.phone,
  nameGuardian: props.participant.nameGuardian,
  emailGuardian: props.participant.emailGuardian,
  phoneGuardian: props.participant.phoneGuardian,
  emergency1: props.participant.emergency1,
  emergency2: props.participant.emergency2,
  street: props.participant.street,
  zip: props.participant.zip,
  city: props.participant.city,
  allergies: props.participant.allergies,
  dietaryPreferences: props.participant.dietaryPreferences,
  illnesses: props.participant.illnesses,
  medications: props.participant.medications,
  other: props.participant.other,
  disinfection: props.participant.disinfection,
  fever: props.participant.fever,
  splinter: props.participant.splinter,
  tick: props.participant.tick,
  notes: props.participant.notes,
});

const state = reactive(buildState());

const resetState = () => Object.assign(state, buildState());

const onSubmit = async () => {
  saving.value = true;
  try {
    await pb
      .collection(Collections.Participants)
      .update(props.participant.id, state);
    toast.add({ title: "Teilnehmer gespeichert", icon: "i-lucide-check" });
    open.value = false;
    emit("refresh");
  } catch (error: any) {
    toastError(error);
  } finally {
    saving.value = false;
  }
};
</script>
