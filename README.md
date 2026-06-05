# 3Bein

A self-hosted management platform for scout groups. Built on top of [PocketBase](https://pocketbase.io) and [Nuxt 3](https://nuxt.com), served as a single binary + SPA.

## Features

- **Events** — manage camps and activities with material lists, shopping lists, notes, and invoices
- **Participants** — add members to events, track payment status, export to PDF
- **Members** — live view of your NaMi member list with search and detail drawer
- **Invoices** — track event expenses by category with PDF export and currency calculator
- **Material & Shopping Lists** — real-time collaborative lists per event
- **Calendar** — overview of all upcoming events
- **Invite system** — token-based, time-limited email invites (no open registration)
- **NaMi Integration** — read-only live connection to the DPSG NaMi member database

---

## Self-Hosting with Docker

The recommended way to run 3Bein. The Nuxt frontend is served directly by the PocketBase binary — no separate web server needed.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the repository

```bash
git clone https://github.com/leoVolk/dreibein
cd dreibein
```

### 2. Start the container

```bash
docker-compose up -d
```

The first build takes a few minutes (compiles Go + builds the Nuxt SPA).

### 3. Open the app

Navigate to [http://localhost:8080](http://localhost:8080).

On first boot, PocketBase will prompt you to create a **superuser** (admin) account at [http://localhost:8080/\_/](http://localhost:8080/_/). Do this before anything else.

### 4. Import the database schema

1. Go to [http://localhost:8080/\_/](http://localhost:8080/_/) and log in with your superuser account
2. Navigate to **Settings → Import collections**
3. Upload the `pb_schema.json` file from the root of this repository
4. Confirm the import

This creates all the required collections.

### 5. Invite the first user

User registration is invite-only. Since no users exist yet, create the first invite directly via the PocketBase admin UI:

1. Go to **Collections → invites → New record**
2. Set `email` to the address you want to register with
3. Set `expires` to any future date (e.g. `2099-01-01 00:00:00`)
4. Set `token` to any random string (e.g. `abc123`)
5. Save the record
6. Open `http://localhost:8080/invite/abc123` (replace with your token) and complete registration

All subsequent users can be invited from within the app via **Settings → Einladen**.

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Go](https://go.dev/) 1.25+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
POCKETBASE_URL=http://127.0.0.1:8090/
POCKETBASE_ADMIN_EMAIL=your@email.com
POCKETBASE_ADMIN_PASSWORD=yourpassword
```

`POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` are only needed for the `generate-types` script.

### 3. Start PocketBase

```bash
npm run dev:pocketbase
```

On first run, create a superuser at [http://localhost:8090/\_/](http://localhost:8090/_/) and import `pb_schema.json` as described in step 4 of the Docker setup above.

### 4. Start the Nuxt dev server

In a second terminal:

```bash
npm run dev:nuxt
```

Or run both together with:

```bash
npm run dev:both
```

The app is available at [http://localhost:3000](http://localhost:3000).

---

## NaMi Integration

3Bein can connect to the [DPSG NaMi](https://nami.dpsg.de) member database to display live member data without manual import.

### Setup

1. Log in to 3Bein as an admin user
2. Go to **Settings → NaMi**
3. Enter your NaMi credentials:
   - **Username** — your NaMi login (Mitgliedsnummer)
   - **Password** — your NaMi password
   - **Group ID** — your Stammesnummer (visible in NaMi under your group)
4. Save

Credentials are stored server-side in the `settings` collection in PocketBase and are only accessible to admin users. They are never sent to the browser.

---

## Configuration

| Variable                    | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `POCKETBASE_URL`            | PocketBase URL for local development               |
| `POCKETBASE_ADMIN_EMAIL`    | Superuser email — only used by `generate-types`    |
| `POCKETBASE_ADMIN_PASSWORD` | Superuser password — only used by `generate-types` |

In Docker, no environment variables are required. The frontend uses relative URLs and talks to the PocketBase instance it is served from.

---

## Updating the schema

After making collection changes in the PocketBase admin UI:

1. Regenerate TypeScript types:

```bash
npm run generate-types
```

2. Export the updated schema via **Settings → Export collections** and commit the new `pb_schema.json`.

---

## Tech Stack

| Layer    | Technology                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | [Nuxt 3](https://nuxt.com) (SPA mode)                                          |
| UI       | [Nuxt UI v3](https://ui.nuxt.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Backend  | [PocketBase](https://pocketbase.io) (Go)                                       |
| Hooks    | PocketBase JSVM (JavaScript)                                                   |
| Database | SQLite (embedded in PocketBase)                                                |
