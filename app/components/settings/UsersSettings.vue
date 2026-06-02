<template>
  <div class="flex flex-col gap-4 pb-4">
    <div class="flex justify-end gap-2">
      <SendInvite />
      <CreateUser @refresh="getUsers()" />
    </div>

    <UTable v-model:column-pinning="columnPinning" :data="users" :columns="columns" sticky>
      <template #ranks-cell="{ row }">
        <div v-if="row.original.expand?.ranks?.length" class="flex flex-wrap gap-1">
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
        <UCheckbox v-model="row.original.admin" @click="onAdminToggle(row)" />
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
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const columnPinning = ref({ right: ["actions"] });
const resetLoading = ref<string | null>(null);
const users = ref<any[]>([]);

const columns: TableColumn<any>[] = [
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

const getUsers = async () => {
  if (!user.value?.admin) return;
  users.value = await pb.collection(Collections.Users).getFullList({ expand: "ranks" });
};

await getUsers();

useRealtimeRefresh(Collections.Users, getUsers);
useRealtimeRefresh(Collections.Ranks, getUsers);

const onAdminToggle = async (row: any) => {
  try {
    await pb.collection(Collections.Users).update(row.original.id, { admin: !row.original.admin });
    toast.add({ title: "Admin Status aktualisiert", icon: "i-lucide-shield-user" });
  } catch (error: any) {
    toastError(error);
  }
};

const onSendPasswordReset = async (row: any, close: () => void) => {
  resetLoading.value = row.original.id;
  try {
    await pb.collection(Collections.Users).requestPasswordReset(row.original.email);
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
</script>
