<template>
  <div class="flex flex-col gap-">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />

    <div class="flex flex-col gap-8">
      <div class="pt-4">
        <UCard variant="subtle">
          <template #header>
            <h3 class="text-xl flex items-center gap-2">
              <UIcon name="i-lucide-user" class="size-6" /> Benutzer
              Einstellungen
            </h3>
          </template>
          <template #default>
            <UForm class="flex flex-col gap-4" :state="userState">
              <UFormField label="Benutzername" class="w-1/2">
                <UInput
                  variant="subtle"
                  v-model="userState.username"
                  size="lg"
                  class="w-full"
                ></UInput>
              </UFormField>
              <div class="flex justify-end">
                <UButton
                  icon="i-lucide-save"
                  @click="onUserNameChange()"
                  label="Speichern"
                ></UButton>
              </div>
            </UForm>
          </template>
        </UCard>
      </div>

      <div v-if="user?.admin">
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
                  <p class="text-lg">
                    {{ namiFile ? namiFile.name : "Datei auswählen" }}
                  </p>
                  <UFileUpload
                    class="max-w-full"
                    size="xl"
                    variant="button"
                    label="Excel Datei hier ablegen"
                    accept=".xlsx, .xls"
                    v-model="namiFile"
                    @update:model-value="handleFileUpload"
                  />
                </div>

                <UTable
                  class="max-h-96"
                  sticky
                  v-if="namiFileData.length"
                  :columns="namiColumns"
                  :data="namiFileData"
                ></UTable>

                <div v-if="namiFileData.length" class="flex justify-end">
                  <UButton
                    icon="i-lucide-import"
                    @click="onUserNameChange()"
                    label="Importieren"
                  ></UButton>
                </div>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import * as XLSX from "xlsx";

const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();

const userState = reactive({
  username: user.value?.name,
});

const onUserNameChange = async () => {
  if (!user.value?.id) return;

  await pb
    .collection("users")
    .update(user.value?.id, { name: userState.username });

  toast.add({
    title: "Benutzername geändert",
    icon: "i-lucide-save",
  });
};

const users = ref();

const getUsers = async () => {
  if (!user.value?.admin) return;

  users.value = await pb.collection("users").getFullList();
};

onMounted(async () => {
  await getUsers();
  userState.username = user.value?.name;
});

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
const namiFile = ref();
const namiFileData = ref<any[]>([]);

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
</script>
