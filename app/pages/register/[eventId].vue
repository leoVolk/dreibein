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
          <!-- Persönliche Daten -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Persönliche Daten
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Vorname" required class="w-full">
              <UInput v-model="state.firstname" class="w-full" />
            </UFormField>
            <UFormField label="Nachname" required class="w-full">
              <UInput v-model="state.lastname" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Stufe" class="w-full">
              <USelect
                v-model="state.rank"
                :items="rankOptions"
                placeholder="Bitte wählen..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Geburtsdatum" class="w-full">
              <UInput v-model="state.birthdate" type="date" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Ausweis- / Passnummer" class="w-full">
              <UInput v-model="state.idNumber" class="w-full" />
            </UFormField>
          </div>

          <USeparator />

          <!-- Krankenversicherung -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Krankenversicherung
          </p>

          <UFormField label="Versicherungsart" class="w-full">
            <USelect
              :model-value="state.insuranceType"
              :items="insuranceTypeOptions"
              placeholder="Bitte wählen..."
              class="w-full"
              @update:model-value="state.insuranceType = $event"
            />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Krankenkasse" class="w-full">
              <UInput v-model="state.healthInsurance" class="w-full" />
            </UFormField>
            <UFormField label="Versichert über (Name)" class="w-full">
              <UInput v-model="state.insuranceCoveredBy" class="w-full" />
            </UFormField>
          </div>

          <USeparator />

          <!-- Notfallkontakte -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Notfallkontakte
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Name Notfallkontakt 1" class="w-full">
              <UInput v-model="state.nameEmergency1" class="w-full" />
            </UFormField>
            <UFormField label="Telefon Notfallkontakt 1" class="w-full">
              <UInput v-model="state.phoneEmergency1" class="w-full" />
            </UFormField>
            <UFormField label="Name Notfallkontakt 2" class="w-full">
              <UInput v-model="state.nameEmergency2" class="w-full" />
            </UFormField>
            <UFormField label="Telefon Notfallkontakt 2" class="w-full">
              <UInput v-model="state.phoneEmergency2" class="w-full" />
            </UFormField>
          </div>

          <USeparator />

          <!-- Gesundheitsbogen -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Gesundheitsbogen
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <UTextarea v-model="state.medications" class="w-full" :rows="2" />
            </UFormField>
            <UFormField label="Verbotene Aktivitäten" class="w-full">
              <UTextarea
                v-model="state.forbiddenActivities"
                class="w-full"
                :rows="2"
              />
            </UFormField>
            <UFormField label="Sonstiges" class="w-full">
              <UTextarea v-model="state.other" class="w-full" :rows="2" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Impfungen" class="w-full">
              <UInput v-model="state.vaccination" class="w-full" />
            </UFormField>
            <UFormField label="Datum Tetanus-Impfung" class="w-full">
              <UInput
                v-model="state.dateTetanusVaccination"
                type="date"
                class="w-full"
              />
            </UFormField>
          </div>

          <USeparator />

          <!-- Erlaubnisse -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Erlaubnisse
          </p>

          <p class="text-sm text-muted -mt-2">
            Ich erteile die Erlaubnis für folgende Aktivitäten:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UCheckbox
              v-model="state.swimmer"
              label="Die teilnehmende Person ist Schwimmer/In"
            />
            <UCheckbox
              v-model="state.maySwim"
              label="und darf ohne Aufsicht schwimmen gehen"
            />
            <UCheckbox
              class="col-span-1 sm:col-span-2"
              v-model="state.mayRoam"
              label="Darf in 3er Gruppen eigenständig bei z.B. Stadtausflügen bewegen"
            />
          </div>

          <p class="text-sm text-muted">
            Ich erteile die Erlaubnis, folgende Erste-Hilfe-Maßnahmen
            durchzuführen:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UCheckbox v-model="state.desinfection" label="Desinfektion" />
            <UCheckbox v-model="state.fever" label="Fieberthermometer" />
            <UCheckbox v-model="state.splinter" label="Splitterpinzette" />
            <UCheckbox v-model="state.ticks" label="Zeckenpinzette" />
          </div>

          <USeparator />

          <!-- Einwilligungen -->
          <p class="text-lg font-semibold uppercase tracking-wider text-muted">
            Einwilligungen
          </p>

          <div class="flex flex-col gap-3">
            <UCheckbox
              v-model="state.media"
              label=" Ich stimme zu, dass während des Lagers Fotos und Videos von mir / meinem Kind aufgenommen und im Zusammenhang mit dem Lager zur Veröffentlichung in der Presse sowie auf Veranstaltungen und Internetseiten des Stammes genutzt werden dürfen. * "
            />
            <UCheckbox
              v-model="state.privacyPolicy"
              label=" Die Erhebung und Verarbeitung der hier aufgenommenen Daten erfolgt zum Zweck der oben genannten Aktion und entsprechend unserer Datenschutzerklärung. Mit Übermittlung des Datenblatts durch drücken des Icons „Übermitteln“ am Ende dieser Seite stimmst du / die anmeldenden Eltern der Erhebung und Verarbeitung der hier angegebenen Daten nach diesem Formular und entsprechend unserer Datenschutzerklärung zu. Nach beendigung des Lagers werden die erfassten Daten gelöscht. * "
            />
            <UCheckbox
              v-model="state.permissions"
              label=" Als teilnehmende Person bzw. Erziehungsberechtigte(r) bei minderjährigen Teilnehmenden bestätige ich die Richtigkeit aller gemachten Angaben. Über Änderungen werde ich die Lagerleitung umgehend informieren. Ich / Wir ermächtigen hiermit die Leitung während des Lagers, bei Erkrankung oder Verletzung des Teilnehmers / der Teilnehmerin, alle ärztlich notwendigen Maßnahmen (also evtl. auch Operationen), im Notfall ohne weitere Rücksprachen, einzuleiten. * "
            />
            <UCheckbox
              v-model="state.DSGVO"
              label=" Im Rahmen der Anmeldung zu Veranstaltungen, Freizeiten und Lagern erheben wir auf Grundlage Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a i.V.m. Art. 9 Abs. 2 lit. a DSGVO) gesundheitsbezogene Daten der Teilnehmenden. Hierzu können insbesondere Informationen zu Allergien, Unverträglichkeiten, bestehenden Erkrankungen sowie einzunehmenden Medikamenten gehören.  Diese Daten werden ausschließlich zum Zweck der Fürsorge und Sicherheit während der jeweiligen Veranstaltung verarbeitet. Sie werden ausschließlich den betreuenden Leitungspersonen der Veranstaltung zugänglich gemacht und spätestens 2 Wochen nach Ende der Veranstaltung unwiderruflich gelöscht.  Eine Weitergabe an Dritte erfolgt nicht, es sei denn, dies ist im medizinischen Notfall zur Abwendung einer Gefahr für Leib und Leben der betroffenen Person erforderlich (Art. 9 Abs. 2 lit. c DSGVO).  Die Einwilligung zur Verarbeitung dieser Daten ist freiwillig, jedoch Voraussetzung für die Teilnahme an der jeweiligen Veranstaltung, da wir andernfalls  "
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

const rankOptions = Object.keys(RANK_COLORS).filter(
  (v) => v !== "Vorstand" && v !== "Rechtsträger",
);

const insuranceTypeOptions: string[] = Object.values(
  ParticipantsInsuranceTypeOptions,
);

const submitted = ref(false);
const saving = ref(false);

const state = reactive({
  firstname: "",
  lastname: "",
  rank: undefined as string | undefined,
  birthdate: "",
  idNumber: "",
  swimmer: false,
  insuranceType: undefined as string | undefined,
  healthInsurance: "",
  insuranceCoveredBy: "",
  nameEmergency1: "",
  phoneEmergency1: "",
  nameEmergency2: "",
  phoneEmergency2: "",
  allergies: "",
  dietaryPreferences: "",
  illnesses: "",
  medications: "",
  forbiddenActivities: "",
  other: "",
  vaccination: "",
  dateTetanusVaccination: "",
  maySwim: false,
  mayRoam: false,
  desinfection: false,
  fever: false,
  splinter: false,
  ticks: false,
  media: false,
  DSGVO: false,
  privacyPolicy: false,
  permissions: false,
});

const onSubmit = async () => {
  if (!state.firstname || !state.lastname) return;
  saving.value = true;
  try {
    await pb.collection(Collections.Participants).create({
      event: eventId.value,
      ...state,
      insuranceType: state.insuranceType as
        | (typeof ParticipantsInsuranceTypeOptions)[keyof typeof ParticipantsInsuranceTypeOptions]
        | undefined,
      birthdate: state.birthdate || undefined,
      dateTetanusVaccination: state.dateTetanusVaccination || undefined,
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
