<template>
  <div class="flex flex-col gap-4">
    <UAlert
      v-if="namiFileData.length"
      color="error"
      title="Bei Import werden aktuell alle vorherigen Mitglieder überschrieben bzw gelöscht."
      icon="i-lucide-triangle-alert"
    />

    <UAlert color="warning" icon="i-lucide-info">
      <template #title>
        Aktuell unterstützt 3Bein nur die NaMi Export Option:
        <ULink class="text-inverted" to="/help" target="_blank">
          <span class="underline italic font-semibold">'Mitglieder: Grundinformationen'</span>
        </ULink>
      </template>
    </UAlert>

    <div class="flex items-center gap-4 justify-between">
      <UFileUpload
        v-slot="{ open, removeFile }"
        v-model="namiFile"
        size="xl"
        variant="button"
        accept=".xlsx, .xls"
        @update:model-value="handleFileUpload"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            v-if="!namiFile"
            size="lg"
            color="primary"
            label="NaMi Liste importieren"
            icon="i-lucide-import"
            @click="open()"
          />
          <UButton
            v-else
            size="lg"
            color="error"
            :label="namiFile.name"
            icon="i-lucide-x"
            @click="removeFile()"
          />
        </div>
      </UFileUpload>

      <div v-if="namiFile" class="flex items-center gap-4 justify-end">
        <USwitch
          v-model="anonymize"
          label="Daten anonymisieren"
          description="Namen, Adressen und Kontaktdaten werden für Präsentationszwecke durch Platzhalter ersetzt."
        />
        <UButton
          :loading="importLoading"
          icon="i-lucide-upload"
          size="lg"
          label="Hochladen"
          color="primary"
          @click="onNamiFileImport()"
        />
      </div>
    </div>

    <UAlert
      v-if="namiFile && anonymize"
      color="info"
      icon="i-lucide-eye-off"
      title="Vorschau und Import werden anonymisiert"
    />

    <UTable
      v-if="namiFile && previewData.length"
      class="max-h-96"
      sticky
      :columns="namiColumns"
      :data="previewData"
    />
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";
import * as XLSX from "xlsx";

const { pb } = usePocketbase();
const toast = useToast();

const namiFile = ref();
const namiFileData = ref<any[]>([]);
const namiColumns = ref<TableColumn<any>[]>();
const anonymize = ref(false);
const importLoading = ref(false);

const anonymizeNamiRow = (row: any, index: number) => {
  const n = index + 1;
  const gender = String(row.Geschlecht ?? "").toLowerCase();
  const firstName = gender.startsWith("w") ? "Jane" : gender.startsWith("m") ? "John" : "Alex";
  const lastName = "Doe";
  const yearMatch = String(row.GebDatum ?? "").match(/\b(\d{4})\b/);
  const birthYear = yearMatch ? yearMatch[1] : null;

  return {
    ...row,
    Mitgliedsnummer: 100000 + index,
    Vorname: firstName,
    Nachname: lastName,
    Strasse: `Musterstraße ${n}`,
    PLZ: "12345",
    Ort: "Musterstadt",
    EMail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@example.com`,
    EMailErziehungsberechtigter: row.EMailErziehungsberechtigter
      ? `erziehungsberechtigt${n}@example.com`
      : row.EMailErziehungsberechtigter,
    Telefon1: row.Telefon1 ? "+49 30 0000000" : row.Telefon1,
    Telefon2: row.Telefon2 ? "" : row.Telefon2,
    Telefon3: row.Telefon3 ? "" : row.Telefon3,
    GebDatum: birthYear ? `01.01.${birthYear}` : row.GebDatum,
  };
};

const previewData = computed(() =>
  anonymize.value
    ? namiFileData.value.map((row, index) => anonymizeNamiRow(row, index))
    : namiFileData.value,
);

const handleFileUpload = (file: any) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0] as string];
    namiFileData.value = XLSX.utils.sheet_to_json(worksheet as XLSX.WorkSheet);
    namiColumns.value = Object.keys(namiFileData.value[0]).map((col) => ({
      header: col,
      accessorKey: col,
    }));
  };
  reader.readAsArrayBuffer(file);
};

const deleteNaMiMembers = async () => {
  const members = await pb.collection(Collections.Members).getFullList();
  if (!members.length) return;
  const batch = pb.createBatch();
  members.forEach((m) => batch.collection(Collections.Members).delete(m.id));
  await batch.send();
};

const onNamiFileImport = async () => {
  importLoading.value = true;
  try {
    await deleteNaMiMembers();
    const batch = pb.createBatch();
    previewData.value.forEach((m: any) => {
      batch.collection(Collections.Members).create({
        memberNumber: parseInt(m.Mitgliedsnummer),
        firstName: m.Vorname,
        lastName: m.Nachname,
        gender: m.Geschlecht,
        nationality: m.Staatsangehoerigkeit,
        street: m.Strasse,
        postalCode: parseInt(m.PLZ),
        city: m.Ort,
        email: m.EMail,
        parentEmail: m.EMailErziehungsberechtigter,
        phone1: m.Telefon1,
        phone2: m.Telefon2,
        phone3: m.Telefon3,
        birthdate: m.GebDatum,
        membershipType: m.Mitgliedstyp,
        status: m.Status,
        joinDate: m.Eintrittsdatum,
        dataUsageConsent: m.Datenweiterverwendung,
        magazineDelivery: m.Zeitschriftenversand,
        groupName: m.Gruppierungsname,
        groupNumber: parseInt(m.Gruppierungsnummer),
      });
    });
    await batch.send();
    toast.add({ title: "NaMi Liste importiert", icon: "i-lucide-import" });
  } catch (error: any) {
    toast.add({ title: "Fehler beim Import", description: error, icon: "i-lucide-import", color: "error" });
  } finally {
    importLoading.value = false;
  }
};
</script>
