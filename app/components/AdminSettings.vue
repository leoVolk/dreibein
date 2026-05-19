<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-xl flex items-center gap-2">
          <UIcon name="i-lucide-shield-user" class="size-6" /> Admin
          Einstellungen
        </h3>
      </div>
    </template>

    <template #default>
      <div class="flex flex-col gap-4">
        <div>
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg flex items-center gap-2">
              <UIcon name="i-lucide-users" class="size-6" />
              <span>Benutzer</span>
            </h4>

            <CreateUser @refresh="getUsers()"></CreateUser>
          </div>
          <UTable :data="users" :columns="userColumns">
            <template #ranks-cell="{ row }">
              <div
                v-if="row.original.expand?.ranks?.length"
                class="flex flex-wrap gap-1"
              >
                <RankBadge
                  v-for="rank in row.original.expand.ranks"
                  :key="rank.id"
                  :name="rank.name"
                  :colour="rank.colour"
                />
              </div>
              <span v-else class="text-muted text-sm">—</span>
            </template>

            <template #admin-cell="{ row }">
              <UCheckbox
                v-model="row.original.admin"
                @click="onAdminToggle(row)"
              ></UCheckbox>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-1 items-center">
                <EditUser :user="row.original" @refresh="getUsers()" />

                <DeleteConfirmModal
                  title="Passwort zurücksetzen"
                  :description="`Soll wirklich eine Passwort-Reset E-Mail an ${row.original.email} versandt werden?`"
                  confirm-label="E-Mail senden"
                  @confirm="(close: () => void) => onSendPasswordReset(row, close)"
                >
                  <UTooltip text="Passwort-Reset E-Mail senden">
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="primary"
                      icon="i-lucide-mail"
                      :loading="resetLoading === row.original.id"
                    />
                  </UTooltip>
                </DeleteConfirmModal>
              </div>
            </template>
          </UTable>
        </div>

        <USeparator class="h-4"></USeparator>

        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h4 class="text-lg flex items-center gap-2">
              <UIcon name="i-lucide-tag" class="size-6" />
              <span>Stufen</span>
            </h4>

            <CreateRank @refresh="getRanks()" />
          </div>

          <UTable v-if="ranks.length" :data="ranks" :columns="rankColumns">
            <template #colour-cell="{ row }">
              <div class="flex items-center gap-2">
                <span
                  class="inline-block size-4 rounded border border-default"
                  :style="{ backgroundColor: row.original.colour }"
                />
                <span class="text-muted text-sm">{{ row.original.colour }}</span>
              </div>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-1 items-center">
                <EditRank :rank="row.original" @refresh="getRanks()" />

                <DeleteConfirmModal
                  title="Stufe löschen"
                  :description="`Soll die Stufe ${row.original.name} wirklich gelöscht werden?`"
                  confirm-label="Stufe löschen"
                  @confirm="(close: () => void) => onDeleteRank(row, close)"
                />
              </div>
            </template>
          </UTable>

          <UEmpty
            v-else
            icon="i-lucide-tag"
            size="sm"
            description="Noch keine Stufen angelegt."
          />
        </div>

        <USeparator class="h-4"></USeparator>

        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h4 class="text-lg flex items-center gap-2">
              <UIcon name="i-lucide-list-plus" class="size-6" />
              <span>NaMi Mitglieder Import</span>
            </h4>
          </div>

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
                <span class="underline italic font-semibold"
                  >'Mitglieder: Grundinformationen'</span
                >
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
                  @click="open()"
                  icon="i-lucide-import"
                />

                <UButton
                  v-else
                  size="lg"
                  color="error"
                  :label="`${namiFile.name}`"
                  @click="removeFile()"
                  icon="i-lucide-x"
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
                @click="onNamiFileImport()"
                label="Hochladen"
                color="primary"
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
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";
import * as XLSX from "xlsx";

const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();
const toast = useToast();

const namiFile = ref();
const namiFileData = ref<any[]>([]);
const anonymize = ref(false);
const importLoading = ref(false);
const users = ref();

const anonymizeNamiRow = (row: any, index: number) => {
  const n = index + 1;
  const gender = String(row.Geschlecht ?? "").toLowerCase();
  const firstName = gender.startsWith("w")
    ? "Jane"
    : gender.startsWith("m")
      ? "John"
      : "Alex";
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

const getUsers = async () => {
  if (!user.value?.admin) return;

  users.value = await pb.collection("users").getFullList({
    expand: "ranks",
  });
};

await getUsers();

const userColumns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "E-Mail", accessorKey: "email" },
  { header: "Stufen", accessorKey: "ranks" },
  { header: "Admin", accessorKey: "admin" },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toLocaleDateString(),
  },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toLocaleDateString(),
  },
  { header: "", accessorKey: "actions" },
];

const resetLoading = ref<string | null>(null);
const toastError = useToastError();

type Rank = { id: string; name: string; colour: string };
const ranks = ref<Rank[]>([]);

const getRanks = async () => {
  if (!user.value?.admin) return;
  ranks.value = await pb.collection("ranks").getFullList<Rank>({
    sort: "name",
  });
};

await getRanks();

const rankColumns: TableColumn<Rank>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Farbe", accessorKey: "colour" },
  { header: "", accessorKey: "actions" },
];

useRealtimeRefresh("users", getUsers);
useRealtimeRefresh("ranks", () => {
  getRanks();
  getUsers();
});

const onDeleteRank = async (row: any, close: () => void) => {
  try {
    await pb.collection("ranks").delete(row.original.id);
    toast.add({ title: "Stufe gelöscht", icon: "i-lucide-trash" });
    close();
    await getRanks();
  } catch (error: any) {
    toastError(error);
  }
};

const onSendPasswordReset = async (row: any, close: () => void) => {
  resetLoading.value = row.original.id;
  try {
    await pb.collection("users").requestPasswordReset(row.original.email);
    toast.add({
      title: "Passwort-Reset E-Mail versandt",
      description: row.original.email,
      icon: "i-lucide-mail-check",
    });
    close();
  } catch (error: any) {
    toastError(error);
  } finally {
    resetLoading.value = null;
  }
};

const handleFileUpload = (file: any) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0] as string;
    const worksheet = workbook.Sheets[sheetName];

    namiFileData.value = XLSX.utils.sheet_to_json(worksheet as XLSX.WorkSheet);
    createTableHeaders();
  };
  reader.readAsArrayBuffer(file);
};

const namiColumns = ref<TableColumn<any>[]>();

const createTableHeaders = () => {
  const columns: TableColumn<any>[] = Object.keys(namiFileData.value[0]).map(
    (col) => {
      return {
        header: col,
        accessorKey: col,
      };
    },
  );

  namiColumns.value = columns;
};

const deleteNaMiMembers = async () => {
  importLoading.value = true;

  const members = await pb.collection("members").getFullList();

  if (!members.length) return;

  try {
    const deleteBatch = pb.createBatch();

    members.forEach((m) => {
      deleteBatch.collection("members").delete(m.id);
    });

    await deleteBatch.send();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error,
      icon: "i-lucide-import",
      color: "error",
    });
  }

  importLoading.value = false;
};

const onNamiFileImport = async () => {
  await deleteNaMiMembers();

  importLoading.value = true;

  try {
    const importBatch = pb.createBatch();

    previewData.value.forEach((m: any) => {
      const member = {
        memberNumber: parseInt(m.Mitgliedsnummer),
        firstName: m.Vorname,
        lastName: m.Nachname,
        gender: m.Geschlecht,
        nationality: m.Staatsangehoerigkeit,
        street: m.Strasse,
        postalCode: parseInt(m.PLZ),
        city: m.Ort,
        email: m.EMail,
        guardianEmail: m.EMailErziehungsberechtigter,
        phone1: m.Telefon1,
        phone2: m.Telefon2,
        phone3: m.Telefon3,
        birthDate: m.GebDatum,
        membershipType: m.Mitgliedstyp,
        status: m.Status,
        joinDate: m.Eintrittsdatum,
        dataUsageConsent: m.Datenweiterverwendung,
        magazineDelivery: m.Zeitschriftenversand,
        groupName: m.Gruppierungsname,
        groupNumber: parseInt(m.Gruppierungsnummer),
      };

      importBatch.collection("members").create(member);
    });

    const result = await importBatch.send();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error,
      icon: "i-lucide-import",
      color: "error",
    });
  }

  importLoading.value = false;

  toast.add({
    title: "Nami Liste importiert",
    icon: "i-lucide-import",
  });
};

const onAdminToggle = async (row: any) => {
  try {
    await pb.collection("users").update(row.original.id, {
      admin: !row.original.admin,
    });

    toast.add({
      title: "Admin Status aktualisiert",
      icon: "i-lucide-shield-user",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error,
      icon: "i-lucide-shield-user",
      color: "error",
    });
  }
};
</script>

<style></style>
