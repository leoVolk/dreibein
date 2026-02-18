<template>
  <UCard variant="subtle">
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
            <template #admin-cell="{ row }">
              <UCheckbox
                :disabled="true"
                v-model="row.original.admin"
              ></UCheckbox>
            </template>
          </UTable>
        </div>

        <USeparator class="h-4"></USeparator>

        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h4 class="text-lg flex items-center gap-2">
              <UIcon name="i-lucide-list-plus" class="size-6" />
              <span>NaMi Mitglieder Import</span>
            </h4>
          </div>

          <UAlert color="info" icon="i-lucide-info">
            <template #title>
              Aktuell unterstützt 3Bein nur die NaMi Export Option:
              <span class="underline italic font-semibold"
                >'Mitglieder: Grundinformationen'</span
              >
            </template>
          </UAlert>

          <div class="flex items-center gap-4">
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
                  label="NaMi Liste hochladen"
                  @click="open()"
                  trailing-icon="i-lucide-upload"
                />

                <UButton
                  v-else
                  size="lg"
                  color="error"
                  :label="`${namiFile.name}`"
                  @click="removeFile()"
                  trailing-icon="i-lucide-x"
                />
              </div>
            </UFileUpload>
          </div>

          <UTable
            class="max-h-96"
            sticky
            v-if="namiFile && namiFileData.length"
            :columns="namiColumns"
            :data="namiFileData"
          ></UTable>

          <UAlert
            color="warning"
            title="Bei Import werden alle vorherigen Mitglieder & evtl. vorgenommenen Änderungen überschrieben bzw gelöscht."
            icon="i-lucide-triangle-alert"
          />

          <div v-if="namiFileData.length" class="flex justify-end">
            <UButton
              :loading="importLoading"
              icon="i-lucide-import"
              @click="onNamiFileImport()"
              label="Importieren"
            ></UButton>
          </div>
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
const importLoading = ref(false);
const users = ref();

const getUsers = async () => {
  if (!user.value?.admin) return;

  users.value = await pb.collection("users").getFullList();
};

await getUsers();

const userColumns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "E-Mail",
    accessorKey: "email",
  },
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
];

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

const onNamiFileImport = async () => {
  importLoading.value = true;

  const members = await pb.collection("members").getFullList();

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

  const importBatch = pb.createBatch();

  namiFileData.value.forEach((m: any) => {
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
      groupName: m.Gruppierungsnamemember,
      groupNumber: parseInt(m.Gruppierungsnummer),
    };

    importBatch.collection("members").create(member);
  });

  const result = await importBatch.send();

  importLoading.value = false;

  toast.add({
    title: "Nami Liste importiert",
    icon: "i-lucide-import",
  });
};
</script>

<style></style>
