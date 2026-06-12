# Alpha Epsilon Tau History Site

The Alpha history website for **Alpha Epsilon Tau · Chi Psi · Purdue University**.

This README is written for **everyone**, including people who have never touched code.
If you just want to add a brother or fix a photo, read the section
[**"How to add or edit a brother"**](#4-how-to-add-or-edit-a-brother) — that's all you need.

---

## 1. The big picture: where does the member data come from?

You do **not** edit member data in this website's code. The names, pledge classes,
photos, big/little connections, etc. all live somewhere else and are pulled in
automatically.

Here is the whole chain, start to finish:

```
   You type info into          A little program            This website reads
   the Notion database   ──►    (the "Worker")        ──►   that list and draws
   (the master list)           hands it out as a list       the pages
```

1. **The Google Sheet** is the **master list** of every brother — one row per
   brother, one column per field. This is the *only* place you edit member
   information. Think of it as the spreadsheet of record (because it literally is one).
2. The **Worker** is a small always-on program (hosted on Cloudflare) that reads
   the Google Sheet and republishes it as a clean web address that the site can read:
   `https://aet-notion-worker.secretary-purduechipsi.workers.dev/api/profiles`
   You can open that link in a browser — it's just a big list of brothers in
   computer format (JSON). *(The web address has "notion" in its name for historical
   reasons; the actual data behind it comes from the Google Sheet.)*
3. **This website** fetches that list every time someone visits and uses it to
   build the Family Tree, the profile pages, and the lineage links.

**What this means in practice:** if you change something in the Google Sheet, it shows
up on the website automatically (usually within a minute or two, after a refresh). You
never have to touch the code or "redeploy" the site to update a brother.

---

## 2. What information each brother has

Each **row** in the Google Sheet is one brother, and each **column** is one of these
fields. The column headers in the Sheet should match these names:

| Field (column)         | Example                          | Notes |
|------------------------|----------------------------------|-------|
| `initiation_number`    | `41`                             | **The most important field.** A unique number. This is the brother's ID. |
| `first_name`           | `Josh`                           | |
| `last_name`            | `Saylor`                         | |
| `nickname`             | `Josh Saylor`                    | Not currently shown on the site. |
| `pledge_class`         | `Beta`                           | |
| `graduation_year`      | `2026`                           | Free text — `"Projected 2026"` is fine. |
| `major`                | `Computer Engineering`           | |
| `hometown`             | `Westfield, IN`                  | |
| `big_initiation_number`| `20`                             | **The big brother's initiation number.** Leave blank for founders. |
| `roles`                | `Exec`                           | Not currently shown on the site. |
| `bio`                  | `...`                            | Optional paragraph. |
| `photo_url`            | a Google Drive link (see below)  | Leave blank and the site shows the brother's initials instead. |

### The two naming rules that matter most ⚠️

Almost every problem with the site comes from breaking one of these two rules.
Read them twice.

#### Rule 1 — Initiation numbers are the glue. They must match exactly.

The Family Tree is built entirely from numbers, **not** names. Each brother points
to their big by the big's **initiation number**.

- Every brother needs a **unique** `initiation_number`.
- A brother's `big_initiation_number` must be the **exact initiation number of an
  existing brother**.
- **Founders** (brothers with no big) leave `big_initiation_number` **blank**.

Example:

```
Josh is #41 and his big is Mike, who is #20.
  →  Josh's  initiation_number      = 41
  →  Josh's  big_initiation_number  = 20   (Mike's number)
```

If you type the *wrong* number (say `big_initiation_number = 200` and nobody is
#200), then Josh simply won't connect to anyone on the tree, and his "Big Brother"
box will say *"Founding Father — no big."* The fix is always: **check the number.**

#### Rule 2 — Photos come from Google Drive and must use the exact link format.

This is the part that trips people up, so it has its own section below.

---

## 3. Photos: the Google Drive convention (read this carefully)

Photos are **not** uploaded to the website. They live in **Google Drive**, and the
Google Sheet just stores a *link* to each photo. The link must be in one specific
format or the photo won't show.

A working photo link looks **exactly** like this:

```
https://drive.google.com/thumbnail?id=FILE_ID_GOES_HERE&sz=w400
```

- `FILE_ID_GOES_HERE` is the photo's unique Google Drive ID.
- `sz=w400` means "shrink it to 400 pixels wide" (keeps the site fast). Leave it as-is.

### How to add a photo — step by step

1. **Upload the photo to the chapter's Google Drive** (use the shared folder so it
   doesn't disappear when someone graduates — see naming tips below).
2. **Make it viewable by anyone with the link.** Right-click the photo → **Share** →
   under *General access* choose **"Anyone with the link"** → role **Viewer**.
   > 🛑 If you skip this, the photo will look broken on the site even though it works
   > for *you* (because you're logged into Google and visitors aren't).
3. **Copy the share link.** It looks like:
   `https://drive.google.com/file/d/`**`1A2B3C4D5E6F7G8H9I`**`/view?usp=sharing`
   The long bolded chunk between `/d/` and `/view` is the **FILE_ID**.
4. **Build the thumbnail link** by dropping that ID into the format from above:
   `https://drive.google.com/thumbnail?id=`**`1A2B3C4D5E6F7G8H9I`**`&sz=w400`
5. **Paste that finished link** into the `photo_url` column in the Google Sheet.

### If a brother has no photo

Leave `photo_url` **blank**. The site automatically shows a purple box with the
brother's initials (e.g. **JS** for Josh Saylor). You don't have to do anything.

### Google Drive naming tips (so photos don't get lost)

- Keep all member photos in **one shared chapter Drive folder**, owned by the chapter
  account (e.g. the secretary's role account) — **not** a personal student account
  that gets deleted after graduation.
- Name each file so a human can find it later, e.g.
  **`41_Saylor_Josh.jpg`** (`initiationNumber_LastName_FirstName`). This makes it
  easy to match a photo back to a brother and to spot missing ones.
- Don't move or delete a photo after you've linked it — that breaks the link. If you
  must replace a photo, upload the new one, get its new link, and update Notion.

---

## 4. How to add or edit a brother

You only ever work in the **Google Sheet**. You never touch this code.

**To add a new brother:**
1. Open the chapter's **Google Sheet** of brothers.
2. Add a new **row** and fill in the columns from the table in
   [Section 2](#2-what-information-each-brother-has).
3. Give them a **unique `initiation_number`**.
4. Set their **`big_initiation_number`** to their big's number (or leave blank if a
   founder). *(Rule 1.)*
5. Add a **photo link** following the Google Drive steps in
   [Section 3](#3-photos-the-google-drive-convention-read-this-carefully), or leave
   it blank for an initials placeholder. *(Rule 2.)*
6. Save. Refresh the website after a minute — they'll appear.

**To edit a brother:** change their row in Notion and refresh the site.

**To fix a broken connection on the Family Tree:** check that the brother's
`big_initiation_number` exactly equals their big's `initiation_number`.

---

## 5. What changed in the website's code (plain-English summary)

The site used to read member data from a database called **Supabase**. It now reads
from the **Google Sheet-backed Worker** described above. Specifically:

- All member data is now fetched in **one single place** in the code
  (`src/hooks/useBrothers.js`). This is the only spot that talks to the Worker.
  Everything else (the family tree, profile pages, links between brothers) asks that
  one place for data, so there's a single source of truth.
- The data is fetched **once per visit and remembered**, so clicking between pages is
  instant and doesn't re-download the list.
- Brothers are now looked up by **initiation number** everywhere (profile page web
  addresses, family tree clicks, lineage links).
- **Photos:** if a brother has no photo, the site now shows a styled **initials
  placeholder** instead of an empty space.
- **Loading & error messages** match the site's purple/gold style. If the member list
  can't be loaded, every page shows: *"Could not load member data. Please try again."*
- The old career fields (employer, job title, LinkedIn, etc.) were removed from
  profile pages because the new data source doesn't include them.

### Files involved (for a future developer)

| File                              | Role |
|-----------------------------------|------|
| `src/hooks/useBrothers.js`        | The **only** place that fetches member data from the Worker. Returns the list, a fast lookup map by initiation number, plus loading/error state. |
| `src/pages/FamilyTree.jsx`        | Draws the family tree from `big_initiation_number → initiation_number`. |
| `src/pages/BrotherProfile.jsx`    | One brother's profile page; includes the initials photo placeholder. |
| `src/components/BrotherLink.jsx`  | A clickable name that links to a brother's profile. |

---

## 6. Known data quirks (good to know)

When this was set up, the live Worker list still had two leftovers from the old
format. They **don't break anything** because the site ignores them, but a future
maintainer should be aware:

- The data still contains a `lodger` field (always `false`). The site doesn't use it.
- The `roles` field comes back as a **list** (e.g. `["#1","Senior at Large"]`) rather
  than a single word. The site doesn't display roles right now, so this is harmless.

There is also some leftover **Supabase / sign-in code**
(`src/lib/supabase.js`, `src/hooks/useAuth.js`, `src/components/EditProfile.jsx`) from
the old setup. It is **not connected to any page** and does not affect the site. It
can be deleted in the future if the chapter decides it isn't needed.

---

## 7. Running the site on your own computer (developers only)

You need [Node.js](https://nodejs.org) installed.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start a local preview, usually at http://localhost:5173
npm run build    # build the production version into /dist
npm run lint     # check the code for problems
```

The site is built with **Vite + React** and deployed on **Cloudflare Pages**. Pushing
to the main branch triggers a new deployment automatically. Remember: **deploying the
site is only needed for code changes** — adding or editing brothers happens entirely
in the Google Sheet and needs no deployment.
