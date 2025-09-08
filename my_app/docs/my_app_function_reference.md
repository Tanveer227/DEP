# IntelliClinix (my_app) - Function Reference and CVAT Local Setup

## How to use this document
- This Markdown can be exported to PDF using:
  - Node: `npx md-to-pdf my_app/docs/my_app_function_reference.md`
  - VS Code: Open file → Command Palette → “Markdown: Print to PDF”
  - Browser: Use a Markdown preview extension and print to PDF

---

## App Structure (selected files)
- `src/app/newupload/page.tsx`
- `src/app/predictions/page.tsx`
- `src/app/corrected/page.tsx`
- `src/app/login/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/api/create_cvat_task.ts`
- `src/components/DashboardNav.tsx`
- `src/components/ui/*` (generic UI wrappers)
- `src/hooks/use-toast.ts`
- `src/lib/utils.tsx` (utility classnames helper)
- `src/types/index.ts` (shared types)

---

## src/app/newupload/page.tsx
- default export `NewUploadPage()`
  - Purpose: Upload .zip scans, authenticate, kick off backend inference, then redirect to predictions.
  - State:
    - `config`: "2d" | "3d_fullres" – nnUNet configuration to run
    - `selectedDataset`: Dataset key string
    - `selectedFile`: File | null – uploaded .zip
    - `isProcessing`, `isAuthenticated`, `uploadProgress`, `dragActive`
    - Progress UI state: `progressBarText`, `currentStep`
  - Effects:
    - `useEffect(checkAuth)`: Calls `http://localhost:5328/auth/user` to validate session; redirects to `/login` if unauthenticated; caches username in localStorage
    - `useEffect(stepper)`: Updates step indicator and progress label based on state
  - Event handlers:
    - `handleSubmit()`: Validates auth and file → POST `inference/upload` (multipart) → on success POST `inference/run` with job info → toast → redirect `/predictions`
    - `handleDrag/handleDrop/handleFileChange`: Drag-and-drop and input file selection handlers
  - Rendering:
    - Dataset selection cards, file dropzone, config cards, progress bar + submit button

## src/app/predictions/page.tsx
- default export `PredictionsPage()`
  - Purpose: List uploaded NIfTI scans, filter by type, open a gallery preview, send to CVAT, discard files
  - Helpers:
    - `getDisplayName(filename)`: Friendly label for BRATS/LA files
    - `getDatasetType(filename)`: Brain | Heart | Unknown (used for counts and filters)
  - Constants: `BACKEND_URL = http://localhost:5328`
  - Types: uses `NiftiFile` from `@/types`, plus local UI state
  - State:
    - Data: `niftiFiles: NiftiFile[]`, `selectedNiftis: string[]`
    - UI: `isLoading`, `isFetchingFiles`, `isProcessing`, `filter`
    - Modal state: `showCredentialsModal` (CVAT), cred fields, gallery state (`showGallery`, `currentSliceIndex`, `gallerySlices`, `overlayOpacity`, etc.)
    - Counters: `brainCount`, `heartCount`
  - Effects:
    - `useEffect(fetchNiftiFiles)`: GET `/inference/nifti_files`, add `scanType` & `created_at`, sort by `created_at` desc, update counters
  - Actions:
    - `toggleNiftiSelection(id)`: select/deselect rows
    - `handleGalleryOpen(niftiId, jobId)`: fetch original/result slices → open overlay gallery
    - `navigateSlice(direction)`, `handleSliderChange(e)`: gallery navigation
    - `handleSendToCVAT()`: validates selection → opens credentials modal
    - `handleDiscardFiles()`: POST `/cvat/discard_files` with selected ids → refresh list
    - `handleCVATCredentialsSubmit(e)`: POST `/cvat/upload_tasks` with selected ids + CVAT credentials
  - Rendering:
    - Filter tabs, table with selection + actions, right action panel (send/discard), counters, gallery modal

## src/app/corrected/page.tsx
- default export `CorrectedPage()`
  - Purpose: Show “corrected tasks” from backend, allow sending to dataset (CVAT) and initiating nnUNet training
  - Helpers:
    - `getDisplayName(filename)`: Formats names (BRATS to Case X)
    - `getDatasetType(filename)`: Brain | Heart | Unknown
  - State:
    - Lists: `correctedTasks`, `selectedTasks`, `filteredTasks`
    - Modal/UI: `showCredentialsModal`, `showResolutionModal`, `isLoading`, `isProcessing`, `resolution`, `filter`
    - Creds: `cvatUsername`, `cvatPassword`
  - Effects:
    - `useEffect(fetchCorrectedTasks)`: GET `/cvat/corrected-tasks` → map to UI model (displayName, scanType)
  - Actions:
    - `toggleTask(id)`: multi-select
    - `submitToCVAT(e)`: POST `/cvat/send-to-dataset` with selected tasks + CVAT creds
    - `startTraining()`: POST `/train-nnunet` with resolution and selected tasks → route to `/training`
  - Rendering:
    - Filters, table, action buttons, credentials modal, resolution modal

## src/app/login/page.tsx
- default export `LoginPage()`
  - Purpose: Authenticate user against backend and route to `/newupload`
  - State: `username`, `password`, `errorMessage`, `isLoading`
  - Actions:
    - `handleLogin(e)`: POST `/auth/login` with credentials (include cookie) → on success: toast, store token cookie, route to `/newupload`; on failure show error
  - Rendering: Branded login form with validation and loading states

## src/app/layout.tsx
- default export `RootLayout({ children })`
  - Purpose: Global layout wrapper, imports global CSS, sets font variables
- `metadata`: Sets title and description of the app

## src/app/page.tsx
- default export `Home()`
  - Purpose: Root route redirects based on localStorage token/username
  - Effect: If authenticated → `/newupload`; else → `/login`

## src/app/api/create_cvat_task.ts
- default export `handler(req, res)`
  - Purpose: API proxy endpoint to create a CVAT task via backend at `http://localhost:5000/create-cvat-task`
  - Behavior: Only accepts POST; forwards request body to backend and returns the response

## src/components/DashboardNav.tsx
- default export `DashboardNav()`
  - Purpose: Top navigation with links to `newupload`, `predictions`, `corrected`; shows active route; logout button
  - Helpers:
    - `isActive(path)`: highlights active tab
    - `getPageTitle()`: builds breadcrumb title from pathname
    - `handleLogout()`: POST to CVAT logout endpoint (currently remote), clears local session and redirects to `/login`

## src/components/ui/*
- `button.tsx`, `input.tsx`, `alert.tsx`, `card.tsx`, `label.tsx`, `toast.tsx`
  - Purpose: UI primitives and toast system
  - Common patterns: Forwarded refs, className composition using `cn`

## src/hooks/use-toast.ts
- `useToast()`: Small hook wrapping `sonner` to standardize toast API

## src/types/index.ts
- `NiftiFile`: id, filename, jobId, scanType, timestamp, created_at
- `GallerySlices`: original/result arrays + total count
- `LegendItem`: generic color/label/description triple

---

# Run CVAT locally (offline)
The app currently assumes remote CVAT (`https://app.cvat.ai`) in at least one place (`DashboardNav` logout). To run fully offline:

## 1) Install CVAT locally via Docker
- Prereqs: Docker Engine + Docker Compose plugin, 8GB+ RAM recommended
- Clone CVAT and start with Compose:
```
git clone https://github.com/opencv/cvat.git
cd cvat
# Optional: checkout a stable tag
# git checkout v2.16.0

# Start services
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
- Access CVAT web at `http://localhost:8080`
- Create a superuser (prompted on first run). If not prompted:
```
docker compose exec cvat_server python manage.py createsuperuser
```

## 2) Configure CORS/CSRF for your local frontend/backend
- CVAT must allow your origins. In `cvat/.env` set:
```
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```
- Restart CVAT:
```
docker compose down
docker compose up -d
```

## 3) Point your app to local CVAT instead of remote
- Replace any direct references to `https://app.cvat.ai` with `http://localhost:8080`.
  - In `src/components/DashboardNav.tsx` change logout:
    - From: `https://app.cvat.ai/api/auth/logout`
    - To: `http://localhost:8080/api/auth/logout`
- If your backend integrates with CVAT (recommended), configure a single `CVAT_BASE_URL` env and use it everywhere. Example:
  - Backend `.env`:
```
CVAT_BASE_URL=http://localhost:8080
CVAT_USERNAME=<local_admin>
CVAT_PASSWORD=<local_password_or_pat>
```
  - Update backend CVAT client to build URLs like `${CVAT_BASE_URL}/api/...`

## 4) Authentication model for offline
- Prefer Personal Access Tokens (PAT) or basic auth over UI cookies for server‑to‑server calls
- For browser flows using cookies with `fetch`, ensure:
  - `credentials: 'include'` on requests (already used in your code in several places)
  - CVAT is served on same hostname/port or CORS/CSRF is configured as above

## 5) Replace remaining CVAT URLs and test
- Search the repo for `app.cvat.ai` and replace with `http://localhost:8080`
- In your current frontend, the only direct reference is logout in `DashboardNav.tsx`.
- Your app otherwise talks to your backend at `http://localhost:5328` which should proxy to CVAT; make sure the backend is updated to use `CVAT_BASE_URL=http://localhost:8080`.

## 6) Optional: Persist data and backups
- The default Compose files mount volumes; ensure Docker volumes are persisted
- For backups, stop containers and snapshot volumes (or use CVAT export features)

---

# PDF Export quick commands
- Node tool:
```
npm i -D md-to-pdf
npx md-to-pdf my_app/docs/my_app_function_reference.md
```
- Or print via VS Code Markdown preview.
