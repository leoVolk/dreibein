<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Kalender', to: '/calendar' },
        ]"
      />
    </div>

    <div>
      <UPageHeader title="Kalender" />

      <FullCalendar class="mt-8" :options="calendarOptions" />
    </div>

    <EventEditor
      v-model:open="editorOpen"
      :event="selectedEvent"
      :initial-date="initialDate"
      @refresh="getEvents()"
    />
  </div>
</template>

<script lang="ts" setup>
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/vue3";
import type { CalendarOptions, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";
import deLocale from "@fullcalendar/core/locales/de";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();
const toast = useToast();
const toastError = useToastError();

type CalEvent = {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
};

const events = ref<CalEvent[]>([]);
const editorOpen = ref(false);
const selectedEvent = ref<CalEvent | null>(null);
const initialDate = ref<string | null>(null);

const getEvents = async () => {
  events.value = await pb.collection("events").getFullList<CalEvent>({
    requestKey: null,
  });
};

await getEvents();

useRealtimeRefresh("events", getEvents);

const stripTz = (value?: string) =>
  value ? value.replace(" ", "T").replace(/Z$/, "").replace(/\.\d+$/, "") : "";

const openCreate = (dateStr?: string) => {
  selectedEvent.value = null;
  initialDate.value = dateStr ?? null;
  editorOpen.value = true;
};

const openEdit = (id: string) => {
  const found = events.value.find((e) => e.id === id);
  if (!found) return;
  selectedEvent.value = found;
  initialDate.value = null;
  editorOpen.value = true;
};

const onDateClick = (info: DateClickArg) => openCreate(info.dateStr);
const onEventClick = (info: EventClickArg) => openEdit(info.event.id);

const persistDates = async (id: string, start: string, end: string | null) => {
  try {
    await pb.collection("events").update(id, {
      startDate: start,
      endDate: end,
      updatedBy: user.value?.id,
    });
    toast.add({ title: "Event verschoben", icon: "i-lucide-calendar-check" });
  } catch (error: any) {
    toastError(error);
    await getEvents();
  }
};

const onEventDrop = (info: EventDropArg) => {
  const start = toNaiveIso(info.event.start);
  const end = info.event.end ? toNaiveIso(info.event.end) : start;
  persistDates(info.event.id, start, end);
};

const onEventResize = (info: EventResizeDoneArg) => {
  const start = toNaiveIso(info.event.start);
  const end = info.event.end ? toNaiveIso(info.event.end) : start;
  persistDates(info.event.id, start, end);
};

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: deLocale,
  stickyHeaderDates: true,
  editable: true,
  selectable: true,
  headerToolbar: {
    left: "prevYear,prev,today,next,nextYear",
    center: "title",
    right: "dayGridWeek,dayGridMonth,dayGridYear",
  },
  dateClick: onDateClick,
  eventClick: onEventClick,
  eventDrop: onEventDrop,
  eventResize: onEventResize,
  events: events.value.map((e) => ({
    id: e.id,
    title: e.name,
    start: stripTz(e.startDate),
    end: stripTz(e.endDate),
    daysOfWeek:
      Array.isArray(e.daysOfWeek) && e.daysOfWeek.length > 0
        ? e.daysOfWeek
        : undefined,
  })),
}));
</script>
