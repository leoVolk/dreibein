<template>
  <div>Hello from Events</div>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const events = ref();

const getLists = async () => {
  events.value = await pb.collection("events").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: null,
  });
};

await getLists();
</script>

<style></style>
