<template>
  <div>
    <UPageColumns>
      <UPageCard
        v-for="note in props.notes"
        variant="subtle"
        class="overflow-hidden"
        spotlight
        spotlight-color="primary"
        :to="`/events/${eventId}/notes/${note.id}`"
      >
        <template #header>
          <h3 class="text-xl font-medium">{{ note.name }}</h3>
        </template>

        <template #description>
          <p class="text-muted" v-html="trimContent(note.content)"></p>
        </template>
      </UPageCard>
    </UPageColumns>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  notes: {
    type: Object as () => NotesRecord[],
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
});

const trimContent = (content: string | undefined) => {
  if (!content) return "";

  return content.substring(0, 256) + (content.length > 256 ? "..." : "");
};
</script>

<style></style>
