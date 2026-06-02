<template>
  <UDashboardGroup>
    <UProgress
      v-if="isLoading"
      animation="carousel"
      size="xs"
      class="fixed top-0 left-0 right-0"
    />
    <UDashboardSidebar :ui="{ footer: 'border-t border-default' }">
      <template #header="{ collapsed }">
        <UIcon name="i-lucide-tent" class="size-5 text-primary" />
        <h2 v-if="!collapsed" class="font-semibold text-2xl">3Bein</h2>
        <UBadge class="hidden lg:block" color="primary" variant="soft" size="sm"
          >v.0.1.0</UBadge
        >
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :label="collapsed ? undefined : 'Search...'"
          :square="collapsed"
          block
        >
        </UDashboardSearchButton>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex-col flex gap-2 w-full">
          <UButton
            :avatar="{
              alt: user?.name,
            }"
            :label="collapsed ? undefined : user?.name"
            color="neutral"
            variant="ghost"
            class="w-full"
            :block="collapsed"
          />
          <UButton
            label="Abmelden"
            variant="outline"
            color="error"
            class="justify-center"
            :block="collapsed"
            @click="onSignOut"
            icon="i-lucide-log-out"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ body: 'bg-elevated/40 dark:bg-elevated/20' }">
      <template #header>
        <UDashboardNavbar class="lg:hidden" toggle-side="right">
          <template #left>
            <UIcon name="i-lucide-tent" class="size-5 text-primary" />
            <h2 class="font-semibold text-2xl">3Bein</h2>
            <UBadge
              class="hidden lg:block"
              color="primary"
              variant="soft"
              size="sm"
              >v.0.1.0</UBadge
            >
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <main class="container">
          <slot />
        </main>
      </template>
    </UDashboardPanel>

    <UDashboardSearch />
  </UDashboardGroup>
</template>
<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const { user, signOut } = usePocketbaseAuth();
const { pb } = usePocketbase();

const router = useRouter();

const { data: lists, refresh: refreshLists } = await useAsyncData<any>(() =>
  pb.collection("lists").getFullList(),
);

const { data: events, refresh: refreshEvents } = await useAsyncData<any>(() =>
  pb.collection("events").getFullList(),
);

const { isLoading } = usePBLoading();

useRealtimeRefresh("lists", refreshLists);
useRealtimeRefresh("events", refreshEvents);

const listLinks = computed(() =>
  lists.value.map((list: any) => ({
    label: list.name,
    icon: "i-lucide-clipboard-list",
    to: `/lists/${list.id}`,
  })),
);

const eventLinks = computed(() =>
  events.value.map((event: any) => ({
    label: event.name,
    icon: "i-lucide-calendar-1",
    to: `/events/${event.id}`,
  })),
);

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: "Home",
      icon: "i-lucide-home",
      to: "/",
    },
    {
      label: "Material Listen",
      icon: "i-lucide-folder",
      to: "/lists",
      defaultOpen: true,
      children: listLinks.value,
    },
    {
      label: "Läger & Aktionen",
      icon: "i-lucide-flame-kindling",
      to: "/events",
      defaultOpen: true,
      children: eventLinks.value,
    },
    {
      label: "Kalender",
      icon: "i-lucide-calendar",
      to: "/calendar",
    },
    {
      label: "Mitglieder",
      icon: "i-lucide-users",
      to: "/members",
    },
    {
      label: "Alle Materialien",
      icon: "i-lucide-list",
      to: "/items",
      defaultOpen: true,
    },
  ],
  [
    {
      label: "Hilfe & Info",
      icon: "i-lucide-info",
      to: "/help",
    },
    {
      label: "Feedback",
      icon: "i-lucide-message-circle-heart",
      to: "/feedback",
    },
    {
      label: "Einstellungen",
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
]);

const onSignOut = () => {
  signOut();

  router.push("/login");
};
</script>
