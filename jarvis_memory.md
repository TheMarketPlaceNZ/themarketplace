# THE MARKETPLACE NZ * SYSTEM ARCHITECTURE & ROADMAP
Document Created: May 27, 2026
Status: Active and Secure
Agency Founders: Henk Cloete and Kurt Onvlee

## SYSTEM ARCHITECTURE OVERVIEW

### 1. Main Agency Website Rebuild
* Location: c:/Users/onvle/Desktop/TMP
* Design: Premium carbon hexagon background grid, glassmorphic FOUND, CHOSEN, and GROWTH pricing tiers with integrated collapsible lists.
* Diagnostic Quiz: Five step universal marketing diagnostic audit targeting Waikato business pain points.
* Webhook Integration: Sends complete audit payload to Make Webhook 1.

### 2. Sopo FuiFui Client Portal
* Location: c:/Users/onvle/Desktop/TMP/sopo studio/index.html
* Security: Glassmorphic passcode gate requiring zero server maintenance costs.
* Credentials:
  * Username: Sopo FuiFui
  * Passcode: sopo2026
  * Session validation stored locally in localStorage.
  * Added Feature: Integrated Strategy Desk and voice recorder console in index.html, enabling live meeting recordings directly on mobile browsers.

### 3. Make Automation Scenarios (SOPs)

#### Scenario 1: Intake and Client Option Selection
* Trigger: Webhook 1 (https://hook.us2.make.com/3qv6sbxvr7pfm80sm1roe1be84mohcok)
* Action: Captures lead data, executes Perplexity lead analysis, dispatches dynamic HTML partner alert, and sends selection email to client.
* Email Choice Links:
  * Zoom: https://hook.us2.make.com/4qi8n0kl3w6vaxxmwi9r7dljtqh3hmph?bookingEmail=email&choice=zoom
  * Coffee: https://hook.us2.make.com/4qi8n0kl3w6vaxxmwi9r7dljtqh3hmph?bookingEmail=email&choice=coffee

#### Scenario 2: Choice Processing
* Trigger: Webhook 2 (https://hook.us2.make.com/4qi8n0kl3w6vaxxmwi9r7dljtqh3hmph)
* Router Paths:
  * Zoom Path: Set if choice equals zoom. Schedules Zoom meeting (Pacific/Auckland timezone), emails join link using raw HTML template.
  * Coffee Path: Set if choice equals coffee. Emails confirmation for catching up at The Wooden Spoon in Hamilton.
  * User Experience: Both paths end with a custom HTML Webhook Response returning a gorgeous branded preferences confirmed card.

## SYSTEM UPGRADES ROADMAP

### Step 1: Live Netlify Deployment
* Main site is currently live on a temporary testing domain: `https://radiant-babka-e04348.netlify.app/`
* Sopo studio portal is fully active and live at: `https://radiant-babka-e04348.netlify.app/sopo-studio/`

### Step 2: Main Domain DNS Mapping (With Henk)
* Configure custom domain DNS records in 1st Domains (A records pointing to GitHub Pages or Netlify IPs, CNAME points www).

### Step 3: Choice Notifications & Double Booking Prevention
* Add automatic notification emails inside Scenario 2 when client selects Zoom or Coffee.
* Connect calendar slots to a Google Sheet via Make to automatically grey out already booked timeslots on the frontend calendar.

### Step 4: Multi Client Scaling Setup
* Move the passcode gate to a global login directory (`/studio/`).
* Route users to their specific studio folder based on credentials (e.g. Sopo FuiFui redirects to `/sopo-studio/`).

### Step 5: Enterprise Whisper AI Transcription
* Build an upload recording link inside the Strategy tab to upload heavy WebM files directly to Google Drive.
* Trigger a Make scenario using OpenAI Whisper API to transcribe meeting recordings up to one hour long and output direct written transcripts.

### Step 6: Gary Vee Green Screen System
* Develop Sopo's campaign video hooks, templates, and Gary Vee style green screen content workflows.
