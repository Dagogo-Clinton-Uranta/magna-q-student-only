export type ResourceVideo = {
  id: string;
  title: string;
};

export type ResourceCategory = {
  slug: string;
  title: string;
  description: string;
  videos: ResourceVideo[];
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    slug: "usmle-step-1",
    title: "USMLE 1",
    description:
      "High-yield basic sciences, anatomy, pathology, pharmacology, and practical Step 1 study planning.",
    videos: [
      {
        id: "FaiD84PWdPo",
        title: "High-yield Step 1 pharmacology rapid review",
      },
      {
        id: "4ptd5z12thY",
        title: "The ultimate guide to using First Aid for USMLE Step 1",
      },
      {
        id: "FSmvbtrq7pM",
        title: "USMLE Step 1 biochemistry: 32 high-yield topics",
      },
      {
        id: "057Y6Dygl_w",
        title: "USMLE Step 1: 100 concepts in gross anatomy",
      },
      {
        id: "ruFfBeg05ZM",
        title: "A step-by-step guide to passing USMLE Step 1",
      },
      {
        id: "AdK2m8v90uo",
        title: "Highest-yield topics for USMLE Step 1",
      },
      {
        id: "BOtQJeFE_rc",
        title: "A practical USMLE Step 1 pass strategy",
      },
      {
        id: "17E9nVXwbj4",
        title: "How to study musculoskeletal anatomy for Step 1",
      },
      {
        id: "XFMqoR-5vOg",
        title: "USMLE Step 1 high-yield hematology",
      },
      {
        id: "p067g0IKg4Q",
        title: "High-yield review guide for USMLE Step 1",
      },
    ],
  },
  {
    slug: "usmle-step-2-ck",
    title: "USMLE 2 CK",
    description:
      "Clinical presentations, internal medicine, pediatrics, surgery, ethics, and shelf-exam concepts for Step 2 CK.",
    videos: [
      {
        id: "W7tTAJaVx8Q",
        title: "High-yield Step 2 CK clinical presentations",
      },
      {
        id: "9-hIb2DiOF8",
        title: "High-yield pediatrics for USMLE Step 2 CK",
      },
      {
        id: "8DTYbxtV7Tk",
        title: "High-yield internal medicine review for Step 2 CK",
      },
      {
        id: "QFROL06R-zY",
        title: "High-yield public health review for Step 2 CK",
      },
      {
        id: "W6FLV1CkxHI",
        title: "Behavioral science and ethics high-yield topics",
      },
      {
        id: "OHx7IxN9B_I",
        title: "High-yield orthopedics concepts for Step 2 CK",
      },
      {
        id: "r9gDaOoCDe0",
        title: "USMLE Step 2 CK high-yield facts",
      },
      {
        id: "KP9qlswVY44",
        title: "High-yield ophthalmology review for Step 2 CK",
      },
      {
        id: "STceIk_A1Ic",
        title: "Pediatrics shelf and Step 2 CK review",
      },
      {
        id: "qp1KdMWJWQw",
        title: "Top internal medicine NBME shelf concepts",
      },
    ],
  },
  {
    slug: "usmle-step-3",
    title: "USMLE 3",
    description:
      "Step 3 planning, CCS cases, common orders, ethics, risk factors, and exam-day strategy.",
    videos: [
      {
        id: "V-tvy4DOZ_M",
        title: "USMLE Step 3 format: Day 1 versus Day 2",
      },
      {
        id: "N7Steqg6tSs",
        title: "The ultimate USMLE Step 3 CCS guide",
      },
      {
        id: "peQkem25IIA",
        title: "Step 3 high-yield risk factors",
      },
      {
        id: "RmFDIBLXbAU",
        title: "USMLE Step 3 CCS exam-day walkthrough",
      },
      {
        id: "Ovu3ZyjCwy8",
        title: "USMLE Step 3 CCS cases tutorial",
      },
      {
        id: "NmXM65XHu9k",
        title: "High-yield ethics for Step 3",
      },
      {
        id: "bX3qEtyiNQQ",
        title: "A complete USMLE Step 3 study guide",
      },
      {
        id: "MmzuhvYpoOM",
        title: "Twelve high-yield orders for Step 3 CCS cases",
      },
      {
        id: "NWJxOgbmHG0",
        title: "Step 3 study plan, resources, and assessments",
      },
      {
        id: "KIa53NKJnqk",
        title: "Four high-yield Step 3 CCS cases",
      },
    ],
  },
  {
    slug: "interview-resources",
    title: "Interview resources",
    description:
      "Residency interview preparation, common questions, program questions, introductions, and confident delivery.",
    videos: [
      {
        id: "UudocuS-yjg",
        title: "Tips to ace your residency interview",
      },
      {
        id: "w3Qe4aXmhxs",
        title: "Keys to answering residency interview questions",
      },
      {
        id: "a7yhLL6X_Z0",
        title: "How to prepare for a medical residency interview",
      },
      {
        id: "MOmSR4NAmAo",
        title: "Updated residency interview tips",
      },
      {
        id: "DiUI7_oKxho",
        title: "How to introduce yourself in a residency interview",
      },
      {
        id: "qSfX4LbzXwA",
        title: "How to rock your medical residency interview",
      },
      {
        id: "cN5vYGUlsFA",
        title: "Helpful things to say in a residency interview",
      },
      {
        id: "hI2CbN9Re3U",
        title: "Residency interview preparation advice",
      },
      {
        id: "ay8nRXHigXM",
        title: "A model residency interview walkthrough",
      },
      {
        id: "NGHQG5ZSUqk",
        title: "Questions to ask residency programs",
      },
    ],
  },
];

export function getResourceCategory(slug: string) {
  return RESOURCE_CATEGORIES.find((category) => category.slug === slug);
}
