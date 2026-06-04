<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          Teilnehmer
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ participants.length }}
          </UBadge>
        </h3>
      </div>
    </template>

    <ParticipantTable
      v-if="participants.length"
      :participants="participants"
      @refresh="emit('refresh')"
    />

    <UEmpty
      v-else
      icon="i-lucide-users"
      size="sm"
      description="Noch keine Teilnehmer hinzugefügt."
    />
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps<{
  participants: ParticipantsResponse[];
}>();

const emit = defineEmits<{ refresh: [] }>();
</script>
