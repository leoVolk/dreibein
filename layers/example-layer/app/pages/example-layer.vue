<template>
  <div class="flex flex-col gap-6">
    <UPageHeader>
      <template #headline>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-puzzle" class="size-7 text-primary" />
          <h1 class="text-3xl sm:text-4xl font-bold text-highlighted">
            Beispiel-Erweiterung
          </h1>
        </div>
      </template>
      <template #description>
        Dies ist eine Beispielseite, die durch eine Erweiterung hinzugefügt
        wurde. Erweiterungen können Seiten, Komponenten und Composables zur App
        hinzufügen.
      </template>
    </UPageHeader>

    <UCard>
      <template #header>
        <p class="font-medium">Wie funktioniert das?</p>
      </template>
      <div class="flex flex-col gap-3 text-sm text-muted">
        <p>
          Diese Seite stammt aus
          <code class="font-mono bg-elevated px-1 py-0.5 rounded"
            >layers/example-layer/</code
          >
          und wird über das
          <a
            href="https://nuxt.com/docs/guide/going-further/layers"
            target="_blank"
            class="text-primary underline"
            >Nuxt-Layer-System</a
          >
          automatisch in die App eingebunden — kein Eintrag in
          <code class="font-mono bg-elevated px-1 py-0.5 rounded"
            >nuxt.config.ts</code
          >
          nötig.
        </p>
        <p>
          Der Navigationseintrag im Sidebar wurde über
          <code class="font-mono bg-elevated px-1 py-0.5 rounded"
            >useNavExtensions().register()</code
          >
          in einem Nuxt-Plugin registriert.
        </p>
        <p>
          Erweiterungen können außerdem eigene Komponenten, Composables und
          PocketBase-Hooks mitbringen.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: ["auth"] });
</script>
