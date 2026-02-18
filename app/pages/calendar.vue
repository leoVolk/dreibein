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

    <UCard variant="subtle">
      <template #header> <h2 class="text-2xl">Kalender</h2></template>
      <template #default>
        <FullCalendar :options="calendarOptions" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/vue3";
import type { CalendarOptions } from "@fullcalendar/core";
import deLocale from "@fullcalendar/core/locales/de";

const { pb } = usePocketbase();

const events = ref();

const getEvents = async () => {
  events.value = await pb.collection("events").getFullList({
    expand: "createdBy,updatedBy",
    requestKey: null,
  });
};

await getEvents();

const calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  dateClick: (info) => {
    console.log(info.dateStr);
  },
  locale: deLocale,
  stickyHeaderDates: true,
  editable: true,
  headerToolbar: {
    left: "prevYear,prev,today,next,nextYear",
    center: "title",
    right: "dayGridWeek,dayGridMonth,dayGridYear",
  },
  events: events.value.map((e: any) => {
    return {
      title: e.name,
      start: e.startDate,
      end: e.endDate,
      daysOfWeek: e.daysOfWeek.length === 0 ? null : e.daysOfWeek,
    };
  }),
};
</script>
