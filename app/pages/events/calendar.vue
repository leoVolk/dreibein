<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: 'Kalender', to: '/events/calendar' },
        ]"
      />
    </div>

    <UCard v-if="events.length"> </UCard>
  </div>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const events = ref();

const getEvents = async () => {
  events.value = await pb.collection("events").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: null,
  });
};

await getEvents();
</script>

<style></style>
