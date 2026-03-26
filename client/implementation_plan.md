# Manual Profile Entry & AI Career Coach Implementation Plan

Add a manual profile creation option with AI-enhanced summaries and a premium, responsive AI Career Coach module.

## Core State Changes

#### [MODIFY] [UserReducer.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/redux/user/UserReducer.js)
- Add `points` field (default: 100).
- Add `mobile`, `skills`, `location`, `experience`, and **`website`** fields to the state to store manual profile data.
- Add `UPDATE_USER_PROFILE` action handler to update these fields.
- **Persistence**: These fields will be automatically persisted to local storage via the existing `redux-localstorage-simple` middleware configuration.

## Proposed Changes

### [Candidate Flow]

#### [NEW] [ManualProfileScreen.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/screens/candidate/ManualProfileScreen.js)
A dedicated standalone screen for manual profile creation, featuring a **Stepper-based layout**. This replaces the previously planned dialog modal.
- **Form Steps**:
  1. **Identity**: Full Name, Email, **Mobile Number** (India-only: `+91`), **Website** (URL), Location, and **About** (with AI assist).
  2. **History**: Work Experience and Education (repeatable card-based entries).
  3. **Expertise**: **Skills** tags and **Languages** list.
- **UX/UI Highlights**:
  - **Header**: Sticky glassmorphism header with title and Points balance (`Chip` with 💎 icon).
  - **Sections**: Use `Paper` cards with light borders (`#e2e8f0`) and subtle shadows.
  - **Responsiveness**: `fullScreen` on mobile (`xs`), `maxWidth="md"` on desktop. Two-column grid for personal/contact fields on larger screens.
  - **Interactions**: Smooth transitions between form sections using `Collapse` or simple state-driven rendering.
- **AI Content Assistance (Points System)**:
  - A "⚡ Magic Improve" button next to multi-line text fields (`About`, `Experience Description`).
  - **Points Cost**: Using AI to generate or improve content will debit points from the user's account (e.g., -10 pts per use).
  - **Confirmation**: A tooltip or small label will clearly state the point cost before the user clicks.
  - **Balance Display**: Current points balance will be visible in the form header or next to the AI buttons.
- **Validation**:
  - Use `react-material-ui-form-validator` for required fields and format checks (email, phone).
  - Data consistency checks (e.g., end date after start date).
- **Styling**: Premium look with glassmorphism or clean card-based sections, consistent with the existing theme.

#### [NEW] [CareerCoach.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/components/profile/CareerCoach.js)
A dedicated module to provide automated career advice.
- **Features**:
  - **Mentorship Suggestions**: AI-generated guidance from virtual mentors in the user's field.
  - **Recommended Courses**: List of curated learning paths with external links (Coursera, Udemy mocks).
  - **Career Tips**: Dynamic tips based on the user's skill gaps and career stage.
- **UX/UI Integration**:
  - **Job Feed Context**: Implement as a toggleable side-panel or a "Coach" tab in the job list area.
  - **Visuals**: Use a slightly distinct sub-theme (e.g., subtle indigo/gold accents) to differentiate from the job feed.
  - **Micro-interactions**: Subtle hover states on suggestion cards; progress indicators for course materials.

#### [MODIFY] [EntryScreen.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/screens/candidate/EntryScreen.js)
- Add a "Fill details manually" button/link under the resume upload section.
- On click, navigate the user to the new `/manual-profile` route.

#### [MODIFY] [Router.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/routes/Router.js)
- Add a new route `{ path: "manual-profile", element: <ManualProfileRoute /> }` as a child of [MainLayout](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/components/layout/MainLayout/index.js#164-195). This ensures the same navigation bar is used.

#### [MODIFY] [MainLayout/index.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/components/layout/MainLayout/index.js)
- Refactor the [NavBar](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/components/layout/MainLayout/index.js#94-163) to use the dynamic `points` balance from Redux instead of hardcoded credits.
- Ensure the [NavBar](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/components/layout/MainLayout/index.js#94-163) is visible and consistent across all states (Entry, Manual Profile, Feed).

#### [MODIFY] [JobFeedScreen.js](file:///c:/Naveen/Jobs/Source/TrotixAI/client/src/screens/candidate/JobFeedScreen.js)
- Integrate the `CareerCoach` module as a side panel or a toggleable view to provide ongoing guidance while browsing jobs.

## Verification Plan

### Automated Tests
- No existing automated tests for the UI components were found in the root or `client` directory.
- Will perform manual verification of the form logic.

### Manual Verification
1. **Empty Form Validation**: Click "Submit" on an empty form and verify that required field errors (Name, Email) appear.
2. **Format Validation**: Enter an invalid email (e.g., "test@") and verify the error message.
3. **Dynamic Fields**: Add multiple education and work experience entries, then remove one, verifying the UI updates correctly.
4. **Successful Flow**:
   - Fill out the entire form.
   - Click "Save & View Jobs".
   - Verify it navigates correctly (e.g., to `/profile` or `/feed`).
5. **Mobile Responsiveness**: Resize the browser and verify the form layout adapts (stacking fields on smaller screens).
