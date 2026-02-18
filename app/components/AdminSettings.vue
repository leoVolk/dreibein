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

          <UAlert
            color="warning"
            title="Bei Import werden alle vorherigen Mitglieder & evtl. vorgenommenen Änderungen überschrieben bzw gelöscht."
            icon="i-lucide-triangle-alert"
          />

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
                  size="lg"
                  :label="namiFile ? `${namiFile.name}` : 'Upload image'"
                  @click="open()"
                  trailing-icon="i-lucide-upload"
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

          <div v-if="namiFileData.length" class="flex justify-end">
            <UButton
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

const namiFile = ref();
const namiFileData = ref<any[]>([]);
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

const onNamiFileImport = () => {};
</script>

<style></style>
