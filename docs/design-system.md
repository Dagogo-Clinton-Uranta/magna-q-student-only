# MediNexus design system

This is the code reference for the **Open Fashion–derived MediNexus system**.
Its source design is the Figma file “Open Fashion — Free eCommerce UI Kit
(Community)”, particularly its `Typography`, `Color Guide`, `Button`, `Tag`,
`Header`, and `Footer` components.

The goal is not to turn a medical-learning product into a fashion shop. We use
the source system's elegant typography, warm neutrals, four-point rhythm,
restrained geometry, and clear hierarchy while retaining accessible medical
status colours, readable long-form content, and large interaction targets.

## 1. Foundations

The source of truth is `src/app/globals.css`. Variables under `:root` are the
code equivalent of Figma variables. `tailwind.config.ts` exposes semantic
utilities such as `bg-brand-600`, `text-body`, `bg-soft`, and `border-line`.

### Colour roles

| Role             | Value     | Use                                                     |
| ---------------- | --------- | ------------------------------------------------------- |
| Primary          | `#A8715A` | Brand emphasis, selected states, focus-adjacent accents |
| Secondary        | `#DD8560` | Small highlights and active emphasis                    |
| Title            | `#202224` | Headings and high-emphasis text                         |
| Body             | `#333333` | Paragraphs and controls                                 |
| Label            | `#555555` | Secondary text and metadata                             |
| Placeholder      | `#888888` | Input placeholder text only                             |
| Border           | `#DEDEDE` | Dividers, fields, and outlined controls                 |
| Soft background  | `#F8F0E7` | Warm feature panels and callouts                        |
| Input background | `#F9F9F9` | Form controls and filled tags                           |
| Off-white        | `#FCFCFC` | Main application canvas                                 |

Black remains the strongest action colour because that is how the source
button system establishes hierarchy. Red, amber, and green remain reserved for
errors, warnings, and success; never replace those functional meanings with
brand brown.

### Typography

Tenor Sans is the Figma system's font. The app loads it from Google Fonts and
falls back to platform sans-serif fonts if unavailable.

- Display title: 18px / 40px, uppercase, 4px tracking.
- Subtitle: 16px / 24px, uppercase, 2px tracking.
- Small subtitle: 14px / 20px, uppercase, 2px tracking.
- Body large: 16px / 24px.
- Body medium: 14px / 24px.
- Body small: 12px / 18px.

Page headings can scale above the source mobile kit, but keep regular weight,
compact line height, and deliberate letter spacing. Avoid heavy bold type as a
default; hierarchy should come from size, spacing, contrast, and casing.

### Spacing and shape

Use Tailwind's four-pixel spacing scale. The source design is intentionally
square and restrained: default controls have no radius, content surfaces use
only 2–6px, and pills are reserved for tags. Avoid decorative shadows; use
`shadow-card` for separation and `shadow-lift` only for overlays or heroes.

## 2. Components

Code-native primitives live in `src/components/ui`:

- `Button` and `buttonStyles`: Primary, secondary, ghost, and danger; S/M/L
  heights of 40/48/56px; optional leading and trailing icons.
- `Badge`: Filled, outlined, and accent tags based on the Figma Tag component.
- `Field`: Label, input, hint, error, and accessible description wiring.
- `Surface`: Default, warm-soft, and field-toned content containers.
- `LoadingSpinner`: Shared asynchronous feedback.
- `PageTransition` and `Reveal`: Subtle motion with reduced-motion support.

The legacy `.button-primary`, `.button-secondary`, `.button-ghost`, `.input`,
`.card`, `.tag`, and `.eyebrow` classes remain available while older pages are
migrated. Their definitions use the same tokens as the React primitives.

## 3. Shared application patterns

- `BrandMark` owns the MediNexus wordmark and medical symbol.
- `SiteHeader` is public navigation.
- `AppShell` and `SidebarNav` form the authenticated workspace.
- `ConditionalSiteFooter` renders only on public marketing and legal pages.
- Live question-taking and video-recording experiences remain visually focused.

## 4. Accessibility rules

- Interactive targets remain at least 44px, even though the Figma system has a
  40px small button.
- Keyboard focus uses the secondary orange and must never be removed.
- Never communicate correctness, errors, or recording state through colour
  alone.
- Icon-only controls need an accessible name.
- Respect reduced motion and high-contrast player settings.
- Long clinical content must retain comfortable line height and width.

## 5. Adding a page

Use the appropriate shared shell, one clear page heading, an optional eyebrow,
and `Surface` or `.card` for grouped content. Use only one primary action in a
region. Prefer semantic tokens over raw hex values or one-off colors. Check the
page at 320px, 768px, and 1280px and navigate it with a keyboard before release.
