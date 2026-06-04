<template>
  <UCard>
    <template #header>
      <h3 class="text-xl flex items-center gap-2">
        <UIcon name="i-lucide-code-xml" class="size-6" /> Changelog
      </h3>
    </template>
    <template #default>
      <UChangelogVersions>
        <UChangelogVersion
          v-for="(version, index) in changelog"
          :key="index"
          v-bind="version"
        >
          <template #description>
            <ul class="flex flex-col gap-2">
              <li
                v-for="change in (version as ChangelogEntry).changes"
                :key="change.label"
                class="flex items-start gap-2 text-sm"
              >
                <UBadge
                  :color="CHANGE_META[change.type].color"
                  variant="subtle"
                  size="sm"
                  class="mt-0.5 shrink-0"
                >
                  {{ CHANGE_META[change.type].label }}
                </UBadge>
                <span class="text-muted">{{ change.label }}</span>
              </li>
            </ul>
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { changelog, CHANGE_META, type ChangelogEntry } from "~/data/changelog";

definePageMeta({ middleware: ["auth"] });
</script>
