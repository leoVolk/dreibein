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

    <!-- Persönlich -->
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
        <USelect
          v-model="state.rank"
          :items="rankOptions"
          placeholder="Bitte wählen..."
          class="w-full"
        />
      </UFormField>
      <UFormField label="Geburtsdatum" name="birthdate" class="w-full">
        <UInput v-model="state.birthdate" type="date" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Ausweis- / Passnummer" name="idNumber" class="w-full">
      <UInput v-model="state.idNumber" class="w-full" />
    </UFormField>

    <!-- Krankenversicherung -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Krankenversicherung
    </p>

    <UFormField label="Versicherungsart" name="insuranceType" class="w-full">
      <USelect
        :model-value="state.insuranceType"
        :items="insuranceTypeOptions"
        placeholder="Bitte wählen..."
        class="w-full"
        @update:model-value="state.insuranceType = $event"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Krankenkasse" name="healthInsurance" class="w-full">
        <UInput v-model="state.healthInsurance" class="w-full" />
      </UFormField>
      <UFormField label="Versichert über" name="insuranceCoveredBy" class="w-full">
        <UInput v-model="state.insuranceCoveredBy" class="w-full" />
      </UFormField>
    </div>

    <!-- Notfallkontakte -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Notfallkontakte
    </p>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Name Notfallkontakt 1" name="nameEmergency1" class="w-full">
        <UInput v-model="state.nameEmergency1" class="w-full" />
      </UFormField>
      <UFormField label="Telefon Notfallkontakt 1" name="phoneEmergency1" class="w-full">
        <UInput v-model="state.phoneEmergency1" class="w-full" />
      </UFormField>
      <UFormField label="Name Notfallkontakt 2" name="nameEmergency2" class="w-full">
        <UInput v-model="state.nameEmergency2" class="w-full" />
      </UFormField>
      <UFormField label="Telefon Notfallkontakt 2" name="phoneEmergency2" class="w-full">
        <UInput v-model="state.phoneEmergency2" class="w-full" />
      </UFormField>
    </div>

    <!-- Gesundheit -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Gesundheitsbogen
    </p>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Allergien" name="allergies" class="w-full">
        <UInputMenu
          v-model="allergiesSelection"
          :items="ALLERGY_OPTIONS"
          multiple
          create-item
          placeholder="Allergien auswählen oder eingeben..."
          class="w-full"
        />
      </UFormField>
      <UFormField label="Ernährungswünsche" name="dietaryPreferences" class="w-full">
        <UTextarea v-model="state.dietaryPreferences" class="w-full" :rows="2" />
      </UFormField>
      <UFormField label="Krankheiten" name="illnesses" class="w-full">
        <UTextarea v-model="state.illnesses" class="w-full" :rows="2" />
      </UFormField>
      <UFormField label="Medikamente" name="medications" class="w-full">
        <UTextarea v-model="state.medications" class="w-full" :rows="2" />
      </UFormField>
      <UFormField label="Verbotene Aktivitäten" name="forbiddenActivities" class="w-full">
        <UTextarea v-model="state.forbiddenActivities" class="w-full" :rows="2" />
      </UFormField>
      <UFormField label="Sonstiges" name="other" class="w-full">
        <UTextarea v-model="state.other" class="w-full" :rows="2" />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Impfungen" name="vaccination" class="w-full">
        <UInputMenu
          v-model="vaccinationSelection"
          :items="VACCINATION_OPTIONS"
          multiple
          create-item
          placeholder="Impfungen auswählen oder eingeben..."
          class="w-full"
        />
      </UFormField>
      <UFormField label="Datum Tetanus-Impfung" name="dateTetanusVaccination" class="w-full">
        <UInput v-model="state.dateTetanusVaccination" type="date" class="w-full" />
      </UFormField>
    </div>

    <!-- Erlaubnisse -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Erlaubnisse
    </p>

    <div class="grid grid-cols-2 gap-3">
      <UCheckbox v-model="state.swimmer" label="Ist Schwimmer/in" />
      <UCheckbox v-model="state.maySwim" label="Schwimmen erlaubt" />
      <UCheckbox v-model="state.mayRoam" label="Darf Gelände verlassen" class="col-span-2" />
      <UCheckbox v-model="state.desinfection" label="Desinfektion" />
      <UCheckbox v-model="state.fever" label="Fieberthermometer" />
      <UCheckbox v-model="state.splinter" label="Splitterpinzette" />
      <UCheckbox v-model="state.ticks" label="Zeckenpinzette" />
    </div>

    <!-- Einwilligungen -->
    <p class="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
      Einwilligungen
    </p>

    <div class="flex flex-col gap-3">
      <UCheckbox v-model="state.media" label="Medienveröffentlichung" />
      <UCheckbox v-model="state.DSGVO" label="DSGVO" />
      <UCheckbox v-model="state.privacyPolicy" label="Datenschutzrichtlinie" />
      <UCheckbox v-model="state.permissions" label="Alle Erlaubnisse erteilt" />
    </div>
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

const rankOptions = Object.keys(RANK_COLORS);
const insuranceTypeOptions: string[] = Object.values(ParticipantsInsuranceTypeOptions);

const buildState = () => ({
  firstname: props.participant.firstname,
  lastname: props.participant.lastname,
  rank: props.participant.rank,
  birthdate: props.participant.birthdate ?? "",
  idNumber: props.participant.idNumber,
  insuranceType: props.participant.insuranceType as string | undefined,
  healthInsurance: props.participant.healthInsurance,
  insuranceCoveredBy: props.participant.insuranceCoveredBy,
  nameEmergency1: props.participant.nameEmergency1,
  phoneEmergency1: props.participant.phoneEmergency1,
  nameEmergency2: props.participant.nameEmergency2,
  phoneEmergency2: props.participant.phoneEmergency2,
  allergies: props.participant.allergies,
  dietaryPreferences: props.participant.dietaryPreferences,
  illnesses: props.participant.illnesses,
  medications: props.participant.medications,
  forbiddenActivities: props.participant.forbiddenActivities,
  other: props.participant.other,
  vaccination: props.participant.vaccination,
  dateTetanusVaccination: props.participant.dateTetanusVaccination ?? "",
  swimmer: props.participant.swimmer,
  maySwim: props.participant.maySwim,
  mayRoam: props.participant.mayRoam,
  desinfection: props.participant.desinfection,
  fever: props.participant.fever,
  splinter: props.participant.splinter,
  ticks: props.participant.ticks,
  media: props.participant.media,
  DSGVO: props.participant.DSGVO,
  privacyPolicy: props.participant.privacyPolicy,
  permissions: props.participant.permissions,
});

const state = reactive(buildState());

const allergiesSelection = ref<string[]>(parseListString(props.participant.allergies));
const vaccinationSelection = ref<string[]>(parseListString(props.participant.vaccination));

const resetState = () => {
  Object.assign(state, buildState());
  allergiesSelection.value = parseListString(props.participant.allergies);
  vaccinationSelection.value = parseListString(props.participant.vaccination);
};

const onSubmit = async () => {
  saving.value = true;
  try {
    await pb.collection(Collections.Participants).update(props.participant.id, {
      ...state,
      allergies: joinListString(allergiesSelection.value),
      vaccination: joinListString(vaccinationSelection.value),
      insuranceType: state.insuranceType as typeof ParticipantsInsuranceTypeOptions[keyof typeof ParticipantsInsuranceTypeOptions] | undefined,
      birthdate: state.birthdate || undefined,
      dateTetanusVaccination: state.dateTetanusVaccination || undefined,
    });
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
