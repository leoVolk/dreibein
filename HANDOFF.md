# Handoff

Picking this up on another machine: pull master, then start a fresh
`claude` session inside the project. Everything below is the state of
play and the open follow-ups I'd want a second-session Claude to know
about.

## How to resume

```bash
git pull
claude              # or `claude --continue` if a session exists locally
```

The codebase is the source of truth. There's no in-flight uncommitted
work.

## Recently shipped (last few sessions)

- **Dashboard** (`app/pages/index.vue`) — stat tiles, upcoming events,
  "Material braucht Aufmerksamkeit", recent lists/events,
  `MaterialStatusChart` (donut), `MembersByGroupChart` (bar). All
  realtime-refreshed via `useRealtimeRefresh`.
- **Events / calendar** — `EventEditor.vue` is the controlled drawer the
  calendar opens for create/edit/delete. `AddEvent.vue` stays on the
  events index page (built-in trigger button). Drag/resize on the
  calendar persists via `toNaiveIso`. Recurring storage convention is
  `0=Sun..6=Sat` (matches `Date.getDay()` and FullCalendar).
- **Datetime support** — events now use `<input type="datetime-local">`.
  Read path via `toLocalDateTime`, write path via `toPbDateTime` (pads
  the trailing `:00` PB requires). All helpers live in
  `app/utils/dates.ts`.
- **Events table** — Beginn/Ende cells branch on `daysOfWeek`. Recurring
  events render as e.g. `"Mo, Mi, Fr · 14:30"` (days + time only);
  non-recurring render via `formatEventDate` (date, plus time if non-zero).
- **Members CRUD** — `CreateMember` + `EditMember` drawers, shared
  `MemberFormFields.vue` + `memberForm.ts` (single source of truth for
  the form shape). `members.vue` table got a Stufen column with
  `<RankBadge>` and an actions column.
- **Ranks** — new collection, full CRUD in `AdminSettings.vue`. Reused
  in `RankSelectField.vue` (multi-select with coloured chips) inside
  `CreateUser` / `EditUser` / `CreateMember` / `EditMember`.
- **Realtime refresh** — `app/composables/useRealtimeRefresh.ts` does
  subscribe + microtask-debounce + auto-unsubscribe. Wired into every
  page that fetches lists/events/items/members/users/ranks plus both
  chart components.
- **Toast coverage** — every CRUD path emits a success toast and an error
  toast (`useToastError`). Two previously-silent batch catches in
  `participants/[listId].vue` now surface errors.
- **Light-mode panel bg** — `UDashboardPanel` body got
  `bg-elevated/40 dark:bg-elevated/20` so cards (`bg-default`) pop.

## Open follow-ups (in priority order)

1. **Regenerate types.** `shared/types/pocketbase.ts` predates the
   `ranks` collection and the `users.ranks` / `members.lists` /
   `members.paidLists` / `members.ranks` relation fields. Run
   `npm run generate-types`. After that the string `"ranks"` collection
   calls in `AdminSettings.vue`, `CreateRank.vue`, `EditRank.vue`,
   `RankSelectField.vue`, `RankBadge.vue`, `CreateMember.vue`, and
   `EditMember.vue` can be swapped for `Collections.Ranks` /
   `RanksResponse` for stricter typing.

2. **Migrate legacy `daysOfWeek` data.** Old recurring events were
   stored as `1=Mon..7=Sun`; new code expects `0=Sun..6=Sat`. If you
   have existing recurring events, either re-toggle their days via the
   calendar editor (which writes in the new convention) or write a tiny
   PB JS migration that does `1..6 → unchanged, 7 → 0`. Non-recurring
   events are unaffected.

3. **Repair pre-fix imported members.** Imports from the NaMi importer
   before the field-name fix (`guardianEmail → parentEmail`,
   `birthDate → birthdate`) have those two fields empty. Either
   re-import the Excel or fix affected rows via the new `EditMember`
   drawer.

4. **Pre-datetime events with empty `startDate`/`endDate`.** Events
   created in the very short window after the datetime-local switch and
   before the `toPbDateTime` seconds-padding fix may have empty dates.
   Open them in the editor, set date+time, save.

5. **Timezone.** All datetime helpers treat values as _naive local_.
   Fine while everyone is in CET. If you ever go multi-timezone, the
   place to revisit is `app/utils/dates.ts` (and stop stripping the `Z`).

## Conventions worth keeping in mind

- **No emojis in code or commit-adjacent prose.** Existing commit
  messages use them (`:sparkles:`) — that's user choice, fine to
  continue.
- **`pathPrefix: false`** is on. Components in subdirectories
  (`Event/`, `Item/`, `Participants/`, `Member/`) auto-import by
  filename only, no directory prefix.
- **Permissive form drawers.** `FormDrawer.vue` is the shared shell;
  Create/Edit components customize via `#trigger` slot, `:state`,
  `@submit`, `@close`. Default submit button is `type="submit"` and the
  Abbrechen is `type="button"` (don't add `@click="onSubmit"` to the
  submit button — it'd double-fire).
- **Realtime + cache keys.** Detail pages key `useAsyncData` with the
  route param (`participantlist-${listId}`, `eventlist-${listId}`, …)
  to avoid stale cross-route data.
- **PocketBase filter strings.** Always quote relation IDs:
  `lists.id ?= "value"` (or use `pb.filter("lists.id ?= {:id}", { id })`
  for safety). The bare `~` substring operator works in practice for
  15-char alphanumeric IDs but `?=` is the semantically correct
  multi-relation operator.

## File map of the recent work

- `app/composables/useRealtimeRefresh.ts`, `useToastError.ts`,
  `useTableMeta.ts`
- `app/utils/dates.ts`
- `app/components/FormDrawer.vue`, `DeleteConfirmModal.vue`,
  `ItemStatusBadge.vue`, `StatTile.vue`, `RankBadge.vue`,
  `RankSelectField.vue`, `MaterialStatusChart.vue`,
  `MembersByGroupChart.vue`
- `app/components/Event/*` — `AddEvent`, `EventEditor`,
  `CreateEventList`, `CreateShoppingList`, `AddEventItem`,
  `OverviewCard`
- `app/components/Item/*` — `CreateItem`, `EditItem`
- `app/components/Member/*` — `CreateMember`, `EditMember`,
  `MemberFormFields`, `memberForm.ts`
- `app/components/Participants/*` — `AddParticipantList`,
  `AddParticipants`
- `app/components/CreateRank.vue`, `EditRank.vue`, `CreateUser.vue`,
  `EditUser.vue`, `CreateList.vue`, `EditList.vue`, `AdminSettings.vue`,
  `UserSettings.vue`
