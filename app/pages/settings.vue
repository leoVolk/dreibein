<template>
  <div class="flex flex-col gap-">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Einstellungen', to: '/settings' },
      ]"
    />

    <h2 class="text-2xl">Einstellungen</h2>

    <div class="flex flex-col gap-8">
      <div class="pt-4">
        <UCard>
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
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-xl flex items-center gap-2">
                <UIcon name="i-lucide-shield-user" class="size-6" /> Admin
                Einstellungen
              </h3>

              <CreateUser></CreateUser>
            </div>
          </template>

          <template #default>
            <UTable :data="users" :columns="columns">
              <template #admin-cell="{ row }">
                <UCheckbox
                  :disabled="true"
                  v-model="row.original.admin"
                ></UCheckbox>
              </template>
            </UTable>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

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
const currentUser = ref();

const getUsers = async () => {
  if (!user.value?.admin) return;

  users.value = await pb.collection("users").getFullList();
};

onMounted(async () => {
  await getUsers();
  userState.username = user.value?.name;
});

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
  {
    header: "E-Mail",
    accessorKey: "email",
  },
  { header: "Admin", accessorKey: "admin" },
  {
    header: "Erstellt am",
    accessorKey: "created",
    cell: ({ row }) => new Date(row.getValue("created")).toDateString(),
  },
  {
    header: "Aktualisiert am",
    accessorKey: "updated",
    cell: ({ row }) => new Date(row.getValue("updated")).toDateString(),
  },
];
</script>
