/**
 * Every photo on the site, in one place. All are free Unsplash photos, loaded from images.unsplash.com
 * through next/image (next.config.ts allows only that host). No image files live in the repo.
 *
 * Licence check (15 Nov 2026): each `page` below was opened and says "Free to use under the Unsplash License".
 * None is an Unsplash+ photo. Photos are waiting for Abhinav's approval before going live.
 * tests/visuals.test.ts checks that every `src` is on images.unsplash.com.
 */

export type PhotoId = "hero" | "cafe" | "clinic" | "property" | "assistant" | "events" | "team" | "calm";

export type Photo = {
  id: PhotoId;
  /** The image on Unsplash's image host. A fixed, modest source size keeps the optimizer fast. */
  src: string;
  /** The photo's page on unsplash.com, with its licence. */
  page: string;
  photographer: string;
  alt: string;
  /** Where the photo is used. */
  usedIn: string;
  /** Average colour of the photo. Shown while it loads. */
  color: string;
  /** CSS object-position, to keep the subject in frame when cropped. */
  focus?: string;
  /** The page said "Free to use under the Unsplash License" when checked (15 Nov 2026). */
  licenceChecked: true;
};

/** Source size asked from Unsplash. next/image then makes the smaller sizes. Must match next.config.ts. */
export const UNSPLASH_QUERY = "?fm=jpg&q=80&w=2000&fit=max";

const img = (photoId: string) => `https://images.unsplash.com/photo-${photoId}${UNSPLASH_QUERY}`;

export const PHOTOS: Record<PhotoId, Photo> = {
  hero: {
    id: "hero",
    src: img("1788999422969-5583e44d54eb"),
    page: "https://unsplash.com/photos/woman-paying-man-at-cafe-counter-TFm5TGa13IQ",
    photographer: "Ali Aziz",
    alt: "A customer pays at a busy cafe counter under warm pendant lights.",
    usedIn: "HeroScene only, which is off the home page since the 3D hero device (kept for later use)",
    color: "#33332f",
    focus: "60% 50%",
    licenceChecked: true,
  },
  cafe: {
    id: "cafe",
    src: img("1753351052094-460c22920cf2"),
    page: "https://unsplash.com/photos/a-barista-handing-coffee-to-a-customer-at-the-counter-4g_M9D0rn8M",
    photographer: "Vitaly Gariev",
    alt: "A barista hands a takeaway coffee to a customer at a bright cafe counter.",
    usedIn: "Fix scene 0: website and Google (FixScene)",
    color: "#8b929b",
    focus: "55% 40%",
    licenceChecked: true,
  },
  clinic: {
    id: "clinic",
    src: img("1758691462848-31a39258dbd8"),
    page: "https://unsplash.com/photos/doctor-on-phone-working-on-laptop-in-office-egCFrNJ6Djw",
    photographer: "Vitaly Gariev",
    alt: "A doctor takes a call at a tidy clinic desk with a laptop.",
    usedIn: "Fix scene 1: orders, bookings and tickets (FixScene)",
    color: "#7e8781",
    focus: "45% 35%",
    licenceChecked: true,
  },
  property: {
    id: "property",
    src: img("1560448204-e02f11c3d0e2"),
    page: "https://unsplash.com/photos/beige-couch-and-armchair-tHkJAMcO3QE",
    photographer: "Francesca Tosolini",
    alt: "A bright, modern living room with large windows, ready for a viewing.",
    usedIn: "Fix scene 2: CRM (FixScene)",
    color: "#ada498",
    focus: "50% 55%",
    licenceChecked: true,
  },
  assistant: {
    id: "assistant",
    src: img("1758598304346-1b01479f681a"),
    page: "https://unsplash.com/photos/young-woman-looking-at-her-smartphone-on-a-couch-2EYipG0onnE",
    photographer: "Vitaly Gariev",
    alt: "A woman on her sofa types a question on her phone.",
    usedIn: "Fix scene 3: AI assistant (FixScene)",
    color: "#7d7367",
    focus: "62% 40%",
    licenceChecked: true,
  },
  events: {
    id: "events",
    src: img("1540039155733-5bb30b53aa14"),
    page: "https://unsplash.com/photos/crowd-facing-lighted-stage-eXVd7gDPO9A",
    photographer: "ActionVance",
    alt: "A crowd cheers in front of a lit concert stage.",
    usedIn: "Fix scene 4: reminders and updates (FixScene)",
    color: "#5f4c5a",
    focus: "50% 45%",
    licenceChecked: true,
  },
  team: {
    id: "team",
    src: img("1758691736548-073bc97cdff4"),
    page: "https://unsplash.com/photos/man-presenting-to-colleagues-in-a-modern-office-setting-SvYifX5HkeQ",
    photographer: "Vitaly Gariev",
    alt: "A sales team meets in a bright, modern office.",
    usedIn: "Fix scene 5: dashboard (FixScene)",
    color: "#a6afaa",
    focus: "55% 40%",
    licenceChecked: true,
  },
  calm: {
    id: "calm",
    src: img("1449247709967-d4461a6a6103"),
    page: "https://unsplash.com/photos/white-wooden-table-near-brown-chair-nvzvOPQW0gc",
    photographer: "Bench Accounting",
    alt: "A clean white desk and a single chair in a calm, bright room.",
    usedIn: "Stress-free frame (CalmScene)",
    color: "#e9e9e9",
    focus: "60% 60%",
    licenceChecked: true,
  },
};

export const PHOTO_LIST: readonly Photo[] = Object.values(PHOTOS);

/** The photo behind each fix scene, in step order. */
export const FIX_PHOTOS = ["cafe", "clinic", "property", "assistant", "events", "team"] as const satisfies readonly PhotoId[];
