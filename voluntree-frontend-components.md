# VolunTree — Frontend Components & Features Reference

> **AI-Powered Rural Crisis Reporting & Volunteer Coordination System**
> Google Solutions Challenge · Flutter Android + Web · Rural India

---

## Table of Contents

1. [Mobile App — Field Worker](#1-mobile-app--field-worker)
2. [Mobile App — Volunteer](#2-mobile-app--volunteer)
3. [Web Dashboard — Map & Visualization](#3-web-dashboard--map--visualization)
4. [Web Dashboard — Case Management](#4-web-dashboard--case-management)
5. [Web Dashboard — Volunteer Management](#5-web-dashboard--volunteer-management)
6. [Web Dashboard — Analytics & Reporting](#6-web-dashboard--analytics--reporting)
7. [Web Dashboard — Platform UI](#7-web-dashboard--platform-ui)
8. [Offline & Sync](#8-offline--sync)
9. [AI-Powered UI Elements](#9-ai-powered-ui-elements)
10. [Notifications & Alerts](#10-notifications--alerts)
11. [Accessibility](#11-accessibility)
12. [Localization](#12-localization)

---

## 1. Mobile App — Field Worker

### Authentication
- [ ] Animated splash screen with tree-growth micro-animation
- [ ] Role-based login screen (Field Worker / Volunteer selector)
- [ ] 4-digit PIN entry with custom dot-based keypad (48dp keys)
- [ ] Biometric login (fingerprint via `local_auth`) with fallback to PIN
- [ ] Language selector screen — 6 Indian languages, first-run only, native script display
- [ ] Session persistence (app backgrounded up to 1 hour without re-login)
- [ ] PIN lockout after 3 failed attempts with 30-second countdown timer
- [ ] Error states: shake animation on wrong PIN, no text (icon-only feedback)

### Capture Screen ⭐ *(Core Experience)*
- [ ] Camera viewfinder with green corner-bracket alignment guides
- [ ] Flash toggle button (auto / on / off)
- [ ] Photo capture with auto-compression (max 800px, ~200KB)
- [ ] Video recording support (short clips, auto-compressed)
- [ ] Multi-photo support (up to 5 images per report)
- [ ] Photo annotation tool — draw circles/arrows on image to highlight problem area
- [ ] Voice recorder with live animated waveform bars
- [ ] Real-time speech-to-text transcription display below waveform
- [ ] Language auto-detection for voice input
- [ ] Issue type icon grid (6 tiles: Flood 🌊, Fire 🔥, Health 🏥, Bridge 🌉, Water 💧, Other ➕)
- [ ] Single-selection required before submit; selected tile shows colored border
- [ ] GPS auto-tagging shown as location pill — no manual input needed
- [ ] Manual pin-drop fallback map if GPS is unavailable
- [ ] Optional text note field (auto-populated from voice transcript, editable)
- [ ] Submit CTA — bilingual label (English + regional language on same button)
- [ ] Offline-aware submit: button changes to "Save for Later" when offline
- [ ] GPS status indicator (Active / Searching / Unavailable)
- [ ] Offline/online status pill in camera toolbar

### Offline Queue
- [ ] Persistent dark offline banner at screen top when connectivity is absent
- [ ] Banner auto-dismisses with animation when connection is restored
- [ ] Report cards with three distinct visual states:
  - **Queued** — amber badge, waiting for connectivity
  - **Syncing** — animated green linear progress bar
  - **Failed** — red left-border accent + Retry button
- [ ] Retry button with exponential backoff indicator (shows next retry time)
- [ ] Auto-sync on reconnection — processes queue without user action
- [ ] Per-card checkmark animation on successful sync, card slides up and disappears
- [ ] Empty state — tree illustration + "Sab sync ho gaya!" (All synced!) message
- [ ] Pending count badge on bottom nav icon

### Submission History
- [ ] Timeline-style chronological list of all reports
- [ ] Each card: 48×48dp thumbnail, issue type icon, status badge, location name, relative timestamp
- [ ] Status badges: Pending (amber), Assigned (blue), Resolved (green), Critical (red)
- [ ] Relative timestamps (<24h) switching to absolute dates after
- [ ] Tap to open Report Detail View
- [ ] Report Detail View: full-size photo gallery, voice transcription, coordinator notes, assigned volunteer name, status timeline
- [ ] Pull-to-refresh gesture

### Notifications (Mobile)
- [ ] Firebase push notifications for report status changes (Assigned, Resolved)
- [ ] In-app notification bell icon with unread count badge
- [ ] Notification detail screen with deep-link to relevant report

---

## 2. Mobile App — Volunteer

### Authentication
- [ ] Same PIN + biometric login as Field Worker
- [ ] Role selection routes to Volunteer home on login

### Task List
- [ ] Three-tab layout: **Assigned to Me** / **Near Me** / **Completed**
- [ ] Each task card: urgency color left-border, issue type icon, location, distance, time since reported
- [ ] Urgency chips: Critical (red), High (orange), Medium (amber), Low (green)
- [ ] Pull-to-refresh and background auto-refresh every 60 seconds
- [ ] Empty state per tab with contextual illustration

### Task Detail
- [ ] AI-generated summary card (✦ AI label, plain-language description)
- [ ] Urgency score chip (1–10 with color + text label)
- [ ] Photo gallery (swipeable, full-screen on tap)
- [ ] Voice transcription text display (translated to volunteer's language)
- [ ] In-app map showing task location with pin
- [ ] "Get Directions" button (opens Google Maps / Apple Maps)
- [ ] **Accept** / **Decline** / **Mark as Done** action buttons (full-width, bottom-anchored)
- [ ] Completion form — optional photo upload as proof of resolution
- [ ] Contact Coordinator button (opens WhatsApp or phone dialer)
- [ ] Task status timeline (Assigned → Accepted → In Progress → Done)

### Volunteer Profile & Stats
- [ ] Task completion count (today / this week / all-time)
- [ ] Average response time stat
- [ ] Skill/specialty tags (Medical, Rescue, Logistics, etc.)
- [ ] Availability toggle (Available / Busy / Off Duty)

---

## 3. Web Dashboard — Map & Visualization

### Live Map
- [ ] Interactive map (OpenStreetMap via `flutter_map` or Google Maps SDK)
- [ ] Urgency-colored SVG pins: Red (critical), Orange (high), Yellow (medium), Green (low)
- [ ] Pulsing animation on critical pins to draw immediate attention
- [ ] Volunteer location pins styled as blue diamonds ♦ with live position updates
- [ ] Pin click → right-side Case Detail panel slides in (no page navigation)
- [ ] Cluster view for zoomed-out states — count bubbles merge nearby pins
- [ ] Cluster expands to individual pins on zoom-in
- [ ] Heatmap layer toggle — density-based color overlay by region
- [ ] Region / district boundary overlays (GeoJSON)
- [ ] Map legend (urgency colors + volunteer pin explanation)
- [ ] Full-screen map toggle button

### Timeline & Playback
- [ ] Timeline scrubber — replay incident history over past 24h / 7d / 30d
- [ ] Play/pause controls for timeline animation
- [ ] Speed control (1×, 2×, 4×)

---

## 4. Web Dashboard — Case Management

### Case Queue
- [ ] Sortable table: Urgency (default), Date, Region, Status, Issue Type
- [ ] Filter pills: All / Critical / Pending / Assigned / In Progress / Resolved
- [ ] Search bar (case ID, location name, field worker name)
- [ ] Multi-select checkboxes for bulk assignment
- [ ] Each row: urgency color left-border, case ID, issue type icon, location, reporter, time, status badge
- [ ] Infinite scroll / pagination toggle
- [ ] Column resize and reorder

### Case Detail Panel
- [ ] Slides in from right (max 720px wide), map remains visible behind
- [ ] Photo gallery — 2×2 grid thumbnail, click for full-screen lightbox
- [ ] Video player (if video was submitted)
- [ ] Voice transcription — speech bubble format with field worker avatar
- [ ] Transcription language indicator + "Translate to English" toggle
- [ ] AI Summary card:
  - ✦ AI label (always clearly marked)
  - Urgency score (1–10) with color chip + plain-language label
  - Key finding sentence + supporting detail
  - Auto-generated tags (issue type, affected group, vulnerability indicators)
  - Confidence indicator — if <70%, shows "⚠ Verify manually"
- [ ] Editable AI summary field (coordinator override, saves with timestamp)
- [ ] Case status timeline (Reported → AI Processed → Assigned → In Progress → Resolved)
- [ ] Coordinator internal notes / comments thread
- [ ] Case escalation button (sends WhatsApp + SMS alert to NGO director)
- [ ] Case merge tool (combine duplicate nearby reports)
- [ ] Export case as formatted PDF report

### Assign Panel
- [ ] Searchable volunteer list within panel
- [ ] Each volunteer card: name, distance, current workload count, online/busy/offline status badge
- [ ] AI-suggested volunteers ranked by proximity + skill match (soft recommendation pills)
- [ ] One-click assignment with confirmation dialog
- [ ] Post-assignment: WhatsApp message auto-sent to volunteer (backend-triggered)
- [ ] Assignment history log (who assigned, when)

---

## 5. Web Dashboard — Volunteer Management

### Volunteer Roster
- [ ] Full list with availability status: Online (green), Busy (amber), Offline (gray)
- [ ] Skill/specialty tag filter (Medical, Rescue, Logistics, Communication, Transport)
- [ ] Proximity filter — volunteers within X km of a selected location
- [ ] Volunteer profile card: name, photo, phone, skills, active task count, last seen
- [ ] Availability heatmap by hour-of-day and day-of-week
- [ ] Direct contact button (WhatsApp / phone call) from roster

### Volunteer Performance
- [ ] Per-volunteer stats: tasks completed, avg response time, acceptance rate
- [ ] Leaderboard view (optional, with opt-in consent)
- [ ] Performance trend chart (30-day)

---

## 6. Web Dashboard — Analytics & Reporting

### Summary Stats Bar
- [ ] Total cases today
- [ ] Active (unresolved) cases
- [ ] Resolved cases (today / this week)
- [ ] Average response time
- [ ] Volunteers currently online

### Charts & Visualizations
- [ ] Incident type breakdown — donut chart (Flood / Fire / Health / Bridge / Water / Other)
- [ ] Region-wise incident count — horizontal bar chart
- [ ] Response time trend — 30-day line chart
- [ ] Cases by hour of day — bar chart (helps identify peak hours)
- [ ] Volunteer utilization — stacked bar chart (active vs idle)
- [ ] Urgency distribution — pie chart

### Export & Reporting
- [ ] Exportable CSV (all cases with filters applied)
- [ ] Exportable PDF summary report (branded, shareable with NGO donors)
- [ ] Date range picker for all exports
- [ ] Scheduled weekly email digest to coordinator

---

## 7. Web Dashboard — Platform UI

### Navigation & Layout
- [ ] Persistent top navbar: live case count, volunteers-online count, coordinator avatar
- [ ] Collapsible sidebar (icons-only collapsed / icons + labels expanded)
- [ ] Sidebar items: Live Map, Case Queue, Volunteers, Analytics, Settings
- [ ] Active state highlight on sidebar item
- [ ] Breadcrumb trail in case detail view
- [ ] Keyboard shortcuts for power users:
  - `A` — Open assign panel
  - `E` — Escalate case
  - `R` — Mark resolved
  - `Esc` — Close panel
  - `/` — Focus search bar

### Responsive Layout
- [ ] 3-column layout on desktop (sidebar / map or list / detail panel)
- [ ] 2-column collapse below 960px (sidebar hides, hamburger appears)
- [ ] 1-column mobile view below 640px
- [ ] Touch-friendly card interactions on tablet

### Real-Time Updates
- [ ] WebSocket connection for live case feed (new pin appears without page refresh)
- [ ] Real-time volunteer position updates on map
- [ ] Connection status indicator (live / reconnecting / offline)

### Notifications (Web)
- [ ] Toast notification system (top-right): new case alert, assignment confirmed, case resolved
- [ ] Notification bell with dropdown unread list
- [ ] Browser push notification permission prompt
- [ ] Critical case audio alert (optional, toggle in settings)

### Settings Panel
- [ ] Coordinator profile (name, region, contact)
- [ ] Notification preferences (push, email, WhatsApp digest)
- [ ] Map default zoom and region
- [ ] Language preference
- [ ] Theme toggle (light / dark)
- [ ] API key management (for WhatsApp integration)

---

## 8. Offline & Sync

- [ ] Offline-first data layer — Hive local storage for all pending reports
- [ ] Background sync via `workmanager` — fires automatically when connectivity is restored
- [ ] Sync queue with animated progress indicator per report
- [ ] Exponential backoff retry (1min → 5min → 15min → manual retry)
- [ ] Conflict resolution UI — if same report edited in two places, coordinator is prompted to choose
- [ ] Storage usage indicator in settings (MB used / available)
- [ ] Manual "Clear synced cache" option
- [ ] Offline mode indicator visible from every screen
- [ ] Last-synced timestamp shown in queue screen
- [ ] Reports never deleted from local storage until confirmed synced

---

## 9. AI-Powered UI Elements

- [ ] AI Summary card — ✦ label on every AI-generated content block
- [ ] Urgency score chip (1–10 with color-coded background + plain-language label)
- [ ] Auto-generated tags (issue type, affected group, vulnerability indicators, resource recommendations)
- [ ] Suggested volunteers panel — AI-ranked by proximity, skill match, and current workload
- [ ] Auto-categorization confidence badge (High / Medium / Low confidence indicator)
- [ ] Smart notification prioritization — critical cases surface above routine ones
- [ ] Voice transcription with language auto-detection
- [ ] Real-time transcription preview during recording
- [ ] Coordinator override — any AI field is editable with edit timestamp logged
- [ ] Low-confidence warning — "⚠ Verify manually" banner when AI is uncertain
- [ ] AI processing indicator — "✦ Analyzing..." spinner shown while AI enrichment is in progress

---

## 10. Notifications & Alerts

### Mobile Push Notifications
- [ ] Report status change: Pending → Assigned → Resolved
- [ ] Volunteer: new task assigned (with location and AI summary snippet)
- [ ] Field worker: "Your report was received" confirmation
- [ ] Background sync completion confirmation

### In-App Alerts
- [ ] In-app notification bell with unread count badge
- [ ] Notification list with mark-as-read and clear-all
- [ ] Deep-link from notification to relevant screen/case

### WhatsApp Integration (Backend-Triggered)
- [ ] Volunteer assignment message (auto-sent on coordinator assignment)
  - Includes: location address, photo thumbnail, AI summary, coordinator contact
- [ ] Critical case escalation alert to NGO director
- [ ] Daily summary digest (morning, configurable time)
- [ ] "Report Received" confirmation to field worker on sync

### SMS Fallback
- [ ] SMS alert for critical cases when WhatsApp delivery fails
- [ ] Volunteer notification SMS fallback for non-smartphone users

---

## 11. Accessibility

### Touch & Motor
- [ ] Minimum 48×48dp touch targets on all interactive elements
- [ ] Primary CTA buttons: 64dp tall, full-width on mobile
- [ ] Issue type tiles: 72×72dp with 8dp gap between
- [ ] Voice record FAB: 72dp diameter
- [ ] No accidental-tap risk — 8dp minimum spacing between adjacent touchable elements

### Visual
- [ ] Minimum 4.5:1 contrast ratio (WCAG AA) for all body text
- [ ] Minimum 7:1 contrast ratio (WCAG AAA) for critical alert text
- [ ] Color is never the only differentiator — always paired with icon or label
- [ ] Warm white (#F8F8F6) background reduces OLED glare outdoors
- [ ] High-contrast mode — triple-tap on app logo, increases all contrasts ~40%
- [ ] Large-text mode — scales up to 1.3× without breaking layouts
- [ ] `MediaQuery.textScaleFactor` clamped between 0.85 and 1.3

### Screen Readers
- [ ] Full TalkBack (Android) and VoiceOver (iOS) compatibility
- [ ] Semantic labels on all images, icons, and non-text elements
- [ ] Focus order optimized for screen reader navigation
- [ ] Long-press on any text element triggers TTS (text-to-speech) read-aloud

### Motion
- [ ] Reduced motion mode — disables all non-essential animations
- [ ] Respects `prefers-reduced-motion` system setting
- [ ] No auto-playing video or flashing elements

### Keyboard (Web Dashboard)
- [ ] Full keyboard navigation for all dashboard interactions
- [ ] Visible focus rings on all interactive elements
- [ ] Tab order follows logical reading order
- [ ] Keyboard shortcuts documented in Settings → Help

---

## 12. Localization

### Supported Languages
| Language | Script | Region |
|----------|--------|--------|
| Hindi | Devanagari | North India |
| Marathi | Devanagari | Maharashtra |
| Punjabi | Gurmukhi | Punjab |
| Telugu | Telugu | Andhra / Telangana |
| Tamil | Tamil | Tamil Nadu |
| Kannada | Kannada | Karnataka |
| English | Latin | Fallback / Default |

### Localization Features
- [ ] Complete UI translation for all 6 regional languages
- [ ] Language toggle accessible from bottom nav on every screen
- [ ] First-run language selection screen (native script display per option)
- [ ] Locale persisted in SharedPreferences / Hive
- [ ] Voice input supported in all 6 languages (`speech_to_text` locale config)
- [ ] Voice transcription auto-translated to coordinator's preferred language on dashboard
- [ ] AI summary generated in coordinator's language
- [ ] Number formatting: Indian style (e.g., 1,00,000 for one lakh)
- [ ] Date/time: DD/MM/YYYY format, IST timezone display
- [ ] RTL layout scaffolding in place for future Urdu support
- [ ] Flutter `flutter_localizations` + `intl` package integration
- [ ] String externalization — all UI strings in ARB files, no hardcoded text

---

## Component Priority Matrix

| Component | Platform | Priority | Complexity |
|-----------|----------|----------|------------|
| Capture Screen | Mobile | 🔴 Critical | High |
| Login + Biometric | Mobile | 🔴 Critical | Medium |
| Offline Queue | Mobile | 🔴 Critical | Medium |
| Live Map + Pins | Web | 🔴 Critical | High |
| AI Summary Card | Web | 🔴 Critical | Medium |
| Assign Volunteer Panel | Web | 🔴 Critical | Medium |
| Voice Recorder + Waveform | Mobile | 🟠 High | High |
| Case Detail Panel | Web | 🟠 High | High |
| Volunteer Task List | Mobile | 🟠 High | Low |
| Push Notifications | Both | 🟠 High | Medium |
| WhatsApp Integration | Backend | 🟠 High | Medium |
| Analytics Charts | Web | 🟡 Medium | Medium |
| Photo Annotation | Mobile | 🟡 Medium | High |
| Timeline Scrubber | Web | 🟡 Medium | High |
| Volunteer Performance | Web | 🟡 Medium | Low |
| PDF Export | Web | 🟢 Low | Low |
| SMS Fallback | Backend | 🟢 Low | Low |
| Dark Mode | Both | 🟢 Low | Low |

---

## Flutter Package Dependencies

```yaml
dependencies:
  # State Management
  flutter_riverpod: ^2.4.0

  # Local Storage (Offline-First)
  hive_flutter: ^1.1.0
  hive: ^2.2.3

  # Camera & Media
  camera: ^0.10.0
  image_picker: ^1.0.0
  image_cropper: ^5.0.0

  # Audio
  record: ^5.0.0
  just_audio: ^0.9.0

  # Speech & AI
  speech_to_text: ^6.3.0

  # Location & Maps
  geolocator: ^10.1.0
  flutter_map: ^6.1.0
  latlong2: ^0.9.0

  # Connectivity & Sync
  connectivity_plus: ^5.0.0
  workmanager: ^0.5.0

  # Auth
  local_auth: ^2.1.0

  # Networking
  dio: ^5.4.0
  retrofit: ^4.0.0

  # Notifications
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.3.0

  # Localization
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.0

  # UI Utilities
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0       # Use sparingly — low-end device caution
  fl_chart: ^0.65.0    # For analytics charts (web dashboard)
```

---

*Document last updated: VolunTree v1.0 — Google Solutions Challenge*
*Platforms: Flutter Android (Field Worker + Volunteer) · Flutter Web (Coordinator Dashboard) · WhatsApp (Backend Integration)*
