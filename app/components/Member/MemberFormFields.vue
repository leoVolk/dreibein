<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-4">
      <h4 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Persönliches
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Vorname" name="firstName">
          <UInput v-model="state.firstName" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Nachname" name="lastName">
          <UInput v-model="state.lastName" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Geschlecht" name="gender">
          <UInput v-model="state.gender" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Geburtsdatum" name="birthdate">
          <UInput v-model="state.birthdate" size="lg" class="w-full" />
        </UFormField>
      </div>
    </section>

    <USeparator />

    <section class="flex flex-col gap-4">
      <h4 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Kontakt
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="E-Mail" name="email">
          <UInput v-model="state.email" type="email" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="E-Mail Erziehungsberechtigter" name="parentEmail">
          <UInput
            v-model="state.parentEmail"
            type="email"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Telefon 1" name="phone1">
          <UInput v-model="state.phone1" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Telefon 2" name="phone2">
          <UInput v-model="state.phone2" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Telefon 3" name="phone3">
          <UInput v-model="state.phone3" size="lg" class="w-full" />
        </UFormField>
      </div>
    </section>

    <USeparator />

    <section class="flex flex-col gap-4">
      <h4 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Adresse
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Straße" name="street" class="sm:col-span-2">
          <UInput v-model="state.street" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="PLZ" name="postalCode">
          <UInput
            v-model.number="state.postalCode"
            type="number"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ort" name="city">
          <UInput v-model="state.city" size="lg" class="w-full" />
        </UFormField>
        <UFormField
          label="Staatsangehörigkeit"
          name="nationality"
          class="sm:col-span-2"
        >
          <UInput v-model="state.nationality" size="lg" class="w-full" />
        </UFormField>
      </div>
    </section>

    <USeparator />

    <section class="flex flex-col gap-4">
      <h4 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Mitgliedschaft
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Mitgliedsnummer" name="memberNumber">
          <UInput
            v-model.number="state.memberNumber"
            type="number"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Mitgliedstyp" name="membershipType">
          <UInput v-model="state.membershipType" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Status" name="status">
          <UInput v-model="state.status" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Eintrittsdatum" name="joinDate">
          <UInput v-model="state.joinDate" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Gruppe (Name)" name="groupName">
          <UInput v-model="state.groupName" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Gruppe (Nummer)" name="groupNumber">
          <UInput
            v-model.number="state.groupNumber"
            type="number"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>
      <div class="flex flex-wrap gap-6 mt-2">
        <UCheckbox
          v-model="state.dataUsageConsent"
          label="Datenweiterverwendung"
        />
        <UCheckbox
          v-model="state.magazineDelivery"
          label="Zeitschriftenversand"
        />
      </div>
    </section>

    <USeparator />

    <section class="flex flex-col gap-4">
      <h4 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Stufen
      </h4>
      <RankSelectField v-model="state.ranks" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { MemberFormState } from "./memberForm";

defineProps<{ state: MemberFormState }>();
</script>
