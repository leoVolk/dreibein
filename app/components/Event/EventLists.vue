<template>
  <div>
    <UTable
      v-if="lists.length"
      :data="lists"
      @select="onSelect"
      :columns="columns"
    >
    </UTable>
    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <CreateEventList :event-id="props.eventId"></CreateEventList>
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="emit('refresh')"
        ></UButton>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const props = defineProps({
  lists: {
    type: Object as () => EventlistsRecord[],
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);

const router = useRouter();

const columns: TableColumn<any>[] = [
  { header: "Name", accessorKey: "name" },
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

  {
    header: "",
    accessorKey: "actions",
  },
];

const onSelect = (e: Event, row: TableRow<any>) => {
  router.push(`/events/${props.eventId}/lists/${props.lists[row.index]?.id}`);
};
</script>

<style></style>
