<template>
  <div class="flex flex-col gap-4 pb-4">
    <div class="flex justify-end">
      <CreateRank @refresh="getRanks()" />
    </div>

    <ul v-if="ranks.length" class="flex flex-col divide-y divide-default">
      <li
        v-for="rank in ranks"
        :key="rank.id"
        draggable="true"
        class="flex items-center gap-3 py-2 px-1 transition-opacity"
        :class="{ 'opacity-40': draggingId === rank.id }"
        @dragstart="draggingId = rank.id"
        @dragend="draggingId = null"
        @dragover.prevent
        @drop.prevent="onRankDrop(rank.id)"
      >
        <UIcon name="i-lucide-grip-vertical" class="size-4 text-muted cursor-grab shrink-0" />
        <span
          class="inline-block size-4 rounded border border-default shrink-0"
          :style="{ backgroundColor: rank.colour }"
        />
        <span class="flex-1 text-sm">{{ rank.name }}</span>
        <span class="text-muted text-xs">{{ rank.colour }}</span>
        <div class="flex gap-1 items-center">
          <EditRank :rank="rank" @refresh="getRanks()" />
          <DeleteConfirmModal
            title="Stufe löschen"
            :description="`Soll die Stufe ${rank.name} wirklich gelöscht werden?`"
            confirm-label="Stufe löschen"
            @confirm="(close: () => void) => onDeleteRankById(rank.id, close)"
          />
        </div>
      </li>
    </ul>

    <UEmpty v-else icon="i-lucide-tag" size="sm" description="Noch keine Stufen angelegt." />
  </div>
</template>

<script lang="ts" setup>
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const ranks = ref<RanksResponse[]>([]);
const draggingId = ref<string | null>(null);

const getRanks = async () => {
  if (!user.value?.admin) return;
  ranks.value = await pb
    .collection(Collections.Ranks)
    .getFullList<RanksResponse>({ sort: "sort,name" });
};

await getRanks();

useRealtimeRefresh(Collections.Ranks, getRanks);

const onRankDrop = async (targetId: string) => {
  if (!draggingId.value || draggingId.value === targetId) return;
  const from = ranks.value.findIndex((r) => r.id === draggingId.value);
  const to = ranks.value.findIndex((r) => r.id === targetId);
  if (from === -1 || to === -1) return;
  const reordered = [...ranks.value];
  const [item] = reordered.splice(from, 1);
  reordered.splice(to, 0, item!);
  ranks.value = reordered;
  draggingId.value = null;
  await Promise.all(
    reordered.map((r, i) => pb.collection(Collections.Ranks).update(r.id, { sort: i })),
  );
};

const onDeleteRankById = async (id: string, close: () => void) => {
  try {
    await pb.collection(Collections.Ranks).delete(id);
    toast.add({ title: "Stufe gelöscht", icon: "i-lucide-trash" });
    close();
    await getRanks();
  } catch (error: any) {
    toastError(error);
  }
};
</script>
