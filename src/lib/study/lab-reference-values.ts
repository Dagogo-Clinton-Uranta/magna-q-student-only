export type LabReferenceRow = {
  test: string;
  referenceRange: string;
  siInterval: string;
};

export type LabReferenceCategory = {
  id: "serum" | "gases" | "csf" | "hematologic" | "urine" | "bmi";
  label: string;
  title: string;
  groups: Array<{
    title?: string;
    rows: LabReferenceRow[];
  }>;
};

/**
 * Transcribed from NBME_Laboratory_Reference_Values.pdf in the repository root.
 * Keep the conventional and SI columns paired when editing a row.
 */
export const LAB_REFERENCE_CATEGORIES: LabReferenceCategory[] = [
  {
    id: "serum",
    label: "Serum",
    title: "Serum",
    groups: [
      {
        title: "General chemistry — Electrolytes",
        rows: [
          {
            test: "Sodium (Na⁺)",
            referenceRange: "136–146 mEq/L",
            siInterval: "136–146 mmol/L",
          },
          {
            test: "Potassium (K⁺)",
            referenceRange: "3.5–5.0 mEq/L",
            siInterval: "3.5–5.0 mmol/L",
          },
          {
            test: "Chloride (Cl⁻)",
            referenceRange: "95–105 mEq/L",
            siInterval: "95–105 mmol/L",
          },
          {
            test: "Bicarbonate (HCO₃⁻)",
            referenceRange: "22–28 mEq/L",
            siInterval: "22–28 mmol/L",
          },
        ],
      },
      {
        title: "General chemistry",
        rows: [
          {
            test: "Urea nitrogen",
            referenceRange: "7–18 mg/dL",
            siInterval: "2.5–6.4 mmol/L",
          },
          {
            test: "Creatinine",
            referenceRange: "0.6–1.2 mg/dL",
            siInterval: "53–106 μmol/L",
          },
          {
            test: "Glucose",
            referenceRange:
              "Fasting: 70–100 mg/dL\nRandom, non-fasting: <140 mg/dL",
            siInterval: "3.8–5.6 mmol/L\n<7.77 mmol/L",
          },
          {
            test: "Calcium",
            referenceRange: "8.4–10.2 mg/dL",
            siInterval: "2.1–2.6 mmol/L",
          },
          {
            test: "Magnesium (Mg²⁺)",
            referenceRange: "1.5–2.0 mg/dL",
            siInterval: "0.75–1.0 mmol/L",
          },
          {
            test: "Phosphorus (inorganic)",
            referenceRange: "3.0–4.5 mg/dL",
            siInterval: "1.0–1.5 mmol/L",
          },
        ],
      },
      {
        title: "Hepatic",
        rows: [
          {
            test: "Alanine aminotransferase (ALT)",
            referenceRange: "10–40 U/L",
            siInterval: "10–40 U/L",
          },
          {
            test: "Aspartate aminotransferase (AST)",
            referenceRange: "12–38 U/L",
            siInterval: "12–38 U/L",
          },
          {
            test: "Alkaline phosphatase",
            referenceRange: "25–100 U/L",
            siInterval: "25–100 U/L",
          },
          {
            test: "Bilirubin, total / direct",
            referenceRange: "0.1–1.0 mg/dL / 0.0–0.3 mg/dL",
            siInterval: "2–17 μmol/L / 0–5 μmol/L",
          },
          {
            test: "Proteins, total",
            referenceRange: "6.0–7.8 g/dL",
            siInterval: "60–78 g/L",
          },
          {
            test: "Albumin",
            referenceRange: "3.5–5.5 g/dL",
            siInterval: "35–55 g/L",
          },
          {
            test: "Globulin",
            referenceRange: "2.3–3.5 g/dL",
            siInterval: "23–35 g/L",
          },
        ],
      },
      {
        title: "Other, serum",
        rows: [
          {
            test: "Amylase",
            referenceRange: "25–125 U/L",
            siInterval: "25–125 U/L",
          },
          {
            test: "Lipase",
            referenceRange: "13–60 U/L",
            siInterval: "13–60 U/L",
          },
          {
            test: "Creatinine clearance",
            referenceRange: "Male: 97–137 mL/min\nFemale: 88–128 mL/min",
            siInterval: "97–137 mL/min\n88–128 mL/min",
          },
          {
            test: "Creatine kinase",
            referenceRange: "Male: 25–90 U/L\nFemale: 10–70 U/L",
            siInterval: "25–90 U/L\n10–70 U/L",
          },
          {
            test: "Lactate dehydrogenase",
            referenceRange: "45–200 U/L",
            siInterval: "45–200 U/L",
          },
          {
            test: "Osmolality",
            referenceRange: "275–295 mOsmol/kg H₂O",
            siInterval: "275–295 mOsmol/kg H₂O",
          },
          {
            test: "Troponin I",
            referenceRange: "≤0.04 ng/mL",
            siInterval: "≤0.04 μg/L",
          },
          {
            test: "Uric acid",
            referenceRange: "3.0–8.2 mg/dL",
            siInterval: "0.18–0.48 mmol/L",
          },
        ],
      },
      {
        title: "Lipids",
        rows: [
          {
            test: "Cholesterol, total",
            referenceRange: "Normal: <200 mg/dL\nHigh: >240 mg/dL",
            siInterval: "<5.2 mmol/L\n>6.2 mmol/L",
          },
          {
            test: "HDL",
            referenceRange: "40–60 mg/dL",
            siInterval: "1.0–1.6 mmol/L",
          },
          {
            test: "LDL",
            referenceRange: "<160 mg/dL",
            siInterval: "<4.2 mmol/L",
          },
          {
            test: "Triglycerides",
            referenceRange: "Normal: <150 mg/dL\nBorderline: 151–199 mg/dL",
            siInterval: "<1.70 mmol/L\n1.71–2.25 mmol/L",
          },
        ],
      },
      {
        title: "Iron studies",
        rows: [
          {
            test: "Ferritin",
            referenceRange: "Male: 20–250 ng/mL\nFemale: 10–120 ng/mL",
            siInterval: "20–250 μg/L\n10–120 μg/L",
          },
          {
            test: "Iron",
            referenceRange: "Male: 65–175 μg/dL\nFemale: 50–170 μg/dL",
            siInterval: "11.6–31.3 μmol/L\n9.0–30.4 μmol/L",
          },
          {
            test: "Total iron-binding capacity",
            referenceRange: "250–400 μg/dL",
            siInterval: "44.8–71.6 μmol/L",
          },
          {
            test: "Transferrin",
            referenceRange: "200–360 mg/dL",
            siInterval: "2.0–3.6 g/L",
          },
        ],
      },
      {
        title: "Endocrine",
        rows: [
          {
            test: "Follicle-stimulating hormone",
            referenceRange:
              "Male: 4–25 mIU/mL\nFemale, premenopause: 4–30 mIU/mL\nMidcycle peak: 10–90 mIU/mL\nPostmenopause: 40–250 mIU/mL",
            siInterval: "4–25 IU/L\n4–30 IU/L\n10–90 IU/L\n40–250 IU/L",
          },
          {
            test: "Luteinizing hormone",
            referenceRange:
              "Male: 6–23 mIU/mL\nFemale, follicular phase: 5–30 mIU/mL\nMidcycle: 75–150 mIU/mL\nPostmenopause: 30–200 mIU/mL",
            siInterval: "6–23 IU/L\n5–30 IU/L\n75–150 IU/L\n30–200 IU/L",
          },
          {
            test: "Growth hormone — arginine stimulation",
            referenceRange: "Fasting: <5 ng/mL\nProvocative stimuli: >7 ng/mL",
            siInterval: "<5 μg/L\n>7 μg/L",
          },
          {
            test: "Prolactin (hPRL)",
            referenceRange: "Male: <17 ng/mL\nFemale: <25 ng/mL",
            siInterval: "<17 μg/L\n<25 μg/L",
          },
          {
            test: "Cortisol",
            referenceRange:
              "0800 h: 5–23 μg/dL\n1600 h: 3–15 μg/dL\n2000 h: <50% of 0800 h",
            siInterval:
              "138–635 nmol/L\n82–413 nmol/L\nFraction of 0800 h: <0.50",
          },
          {
            test: "TSH",
            referenceRange: "0.4–4.0 μU/mL",
            siInterval: "0.4–4.0 mIU/L",
          },
          {
            test: "Triiodothyronine (T₃) (RIA)",
            referenceRange: "100–200 ng/dL",
            siInterval: "1.5–3.1 nmol/L",
          },
          {
            test: "Triiodothyronine (T₃) resin uptake",
            referenceRange: "25%–35%",
            siInterval: "0.25–0.35",
          },
          {
            test: "Thyroxine (T₄)",
            referenceRange: "5–12 μg/dL",
            siInterval: "64–155 nmol/L",
          },
          {
            test: "Free T₄",
            referenceRange: "0.9–1.7 ng/dL",
            siInterval: "12.0–21.9 pmol/L",
          },
          {
            test: "Thyroidal iodine (¹²³I) uptake",
            referenceRange: "8%–30% of administered dose/24 h",
            siInterval: "0.08–0.30/24 h",
          },
          {
            test: "Intact PTH",
            referenceRange: "10–60 pg/mL",
            siInterval: "10–60 ng/L",
          },
          {
            test: "17-Hydroxycorticosteroids",
            referenceRange: "Male: 3.0–10.0 mg/24 h\nFemale: 2.0–8.0 mg/24 h",
            siInterval: "8.2–27.6 μmol/24 h\n5.5–22.0 μmol/24 h",
          },
          {
            test: "17-Ketosteroids, total",
            referenceRange: "Male: 8–20 mg/24 h\nFemale: 6–15 mg/24 h",
            siInterval: "28–70 μmol/24 h\n21–52 μmol/24 h",
          },
        ],
      },
      {
        title: "Immunoglobulins",
        rows: [
          {
            test: "IgA",
            referenceRange: "76–390 mg/dL",
            siInterval: "0.76–3.90 g/L",
          },
          {
            test: "IgE",
            referenceRange: "0–380 IU/mL",
            siInterval: "0–380 kIU/L",
          },
          {
            test: "IgG",
            referenceRange: "650–1500 mg/dL",
            siInterval: "6.5–15.0 g/L",
          },
          {
            test: "IgM",
            referenceRange: "50–300 mg/dL",
            siInterval: "0.5–3.0 g/L",
          },
        ],
      },
    ],
  },
  {
    id: "gases",
    label: "Gases",
    title: "Gases, arterial blood (room air)",
    groups: [
      {
        rows: [
          {
            test: "PO₂",
            referenceRange: "75–105 mm Hg",
            siInterval: "10.0–14.0 kPa",
          },
          {
            test: "PCO₂",
            referenceRange: "33–45 mm Hg",
            siInterval: "4.4–5.9 kPa",
          },
          {
            test: "pH",
            referenceRange: "7.35–7.45",
            siInterval: "[H⁺] 36–44 nmol/L",
          },
        ],
      },
    ],
  },
  {
    id: "csf",
    label: "Cerebrospinal fluid",
    title: "Cerebrospinal fluid",
    groups: [
      {
        rows: [
          {
            test: "Cell count",
            referenceRange: "0–5/mm³",
            siInterval: "0–5 × 10⁶/L",
          },
          {
            test: "Chloride",
            referenceRange: "118–132 mEq/L",
            siInterval: "118–132 mmol/L",
          },
          {
            test: "Gamma globulin",
            referenceRange: "3%–12% total proteins",
            siInterval: "0.03–0.12",
          },
          {
            test: "Glucose",
            referenceRange: "40–70 mg/dL",
            siInterval: "2.2–3.9 mmol/L",
          },
          {
            test: "Pressure",
            referenceRange: "70–180 mm H₂O",
            siInterval: "70–180 mm H₂O",
          },
          {
            test: "Proteins, total",
            referenceRange: "<40 mg/dL",
            siInterval: "<0.40 g/L",
          },
        ],
      },
    ],
  },
  {
    id: "hematologic",
    label: "Hematologic",
    title: "Hematologic",
    groups: [
      {
        title: "Complete blood count",
        rows: [
          {
            test: "Hematocrit",
            referenceRange: "Male: 41%–53%\nFemale: 36%–46%",
            siInterval: "0.41–0.53\n0.36–0.46",
          },
          {
            test: "Hemoglobin, blood",
            referenceRange: "Male: 13.5–17.5 g/dL\nFemale: 12.0–16.0 g/dL",
            siInterval: "135–175 g/L\n120–160 g/L",
          },
          {
            test: "Mean corpuscular hemoglobin (MCH)",
            referenceRange: "25–35 pg/cell",
            siInterval: "0.39–0.54 fmol/cell",
          },
          {
            test: "Mean corpuscular hemoglobin concentration (MCHC)",
            referenceRange: "31%–36% Hb/cell",
            siInterval: "4.8–5.6 mmol Hb/L",
          },
          {
            test: "Mean corpuscular volume (MCV)",
            referenceRange: "80–100 μm³",
            siInterval: "80–100 fL",
          },
          {
            test: "Volume — Plasma",
            referenceRange: "Male: 25–43 mL/kg\nFemale: 28–45 mL/kg",
            siInterval: "0.025–0.043 L/kg\n0.028–0.045 L/kg",
          },
          {
            test: "Volume — Red cell",
            referenceRange: "Male: 20–36 mL/kg\nFemale: 19–31 mL/kg",
            siInterval: "0.020–0.036 L/kg\n0.019–0.031 L/kg",
          },
          {
            test: "Leukocyte count (WBC)",
            referenceRange: "4500–11,000/mm³",
            siInterval: "4.5–11.0 × 10⁹/L",
          },
          {
            test: "Neutrophils, segmented",
            referenceRange: "54%–62%",
            siInterval: "0.54–0.62",
          },
          {
            test: "Neutrophils, bands",
            referenceRange: "3%–5%",
            siInterval: "0.03–0.05",
          },
          {
            test: "Lymphocytes",
            referenceRange: "25%–33%",
            siInterval: "0.25–0.33",
          },
          {
            test: "Monocytes",
            referenceRange: "3%–7%",
            siInterval: "0.03–0.07",
          },
          {
            test: "Eosinophils",
            referenceRange: "1%–3%",
            siInterval: "0.01–0.03",
          },
          {
            test: "Basophils",
            referenceRange: "0%–0.75%",
            siInterval: "0.00–0.0075",
          },
          {
            test: "Platelet count",
            referenceRange: "150,000–400,000/mm³",
            siInterval: "150–400 × 10⁹/L",
          },
        ],
      },
      {
        title: "Coagulation",
        rows: [
          {
            test: "Partial thromboplastin time (PTT/aPTT), activated",
            referenceRange: "25–40 seconds",
            siInterval: "25–40 seconds",
          },
          {
            test: "Prothrombin time (PT)",
            referenceRange: "11–15 seconds",
            siInterval: "11–15 seconds",
          },
          {
            test: "D-dimer",
            referenceRange: "≤250 ng/mL",
            siInterval: "≤1.4 nmol/L",
          },
        ],
      },
      {
        title: "Other, hematologic",
        rows: [
          {
            test: "Reticulocyte count",
            referenceRange: "0.5%–1.5%",
            siInterval: "0.005–0.015",
          },
          {
            test: "Erythrocyte count (RBC)",
            referenceRange:
              "Male: 4.3–5.9 million/mm³\nFemale: 3.5–5.5 million/mm³",
            siInterval: "4.3–5.9 × 10¹²/L\n3.5–5.5 × 10¹²/L",
          },
          {
            test: "Erythrocyte sedimentation rate (Westergren)",
            referenceRange: "Male: 0–15 mm/h\nFemale: 0–20 mm/h",
            siInterval: "0–15 mm/h\n0–20 mm/h",
          },
          {
            test: "CD4⁺ T-lymphocyte count",
            referenceRange: "≥500/mm³",
            siInterval: "≥0.5 × 10⁹/L",
          },
        ],
      },
      {
        title: "Endocrine",
        rows: [
          {
            test: "Hemoglobin A₁c",
            referenceRange: "≤6%",
            siInterval: "≤42 mmol/mol",
          },
        ],
      },
    ],
  },
  {
    id: "urine",
    label: "Urine",
    title: "Urine",
    groups: [
      {
        rows: [
          {
            test: "Calcium",
            referenceRange: "100–300 mg/24 h",
            siInterval: "2.5–7.5 mmol/24 h",
          },
          {
            test: "Osmolality",
            referenceRange: "50–1200 mOsmol/kg H₂O",
            siInterval: "50–1200 mOsmol/kg H₂O",
          },
          {
            test: "Oxalate",
            referenceRange: "8–40 μg/mL",
            siInterval: "90–445 μmol/L",
          },
          {
            test: "Proteins, total",
            referenceRange: "<150 mg/24 h",
            siInterval: "<0.15 g/24 h",
          },
        ],
      },
    ],
  },
  {
    id: "bmi",
    label: "BMI",
    title: "Body mass index (BMI)",
    groups: [
      {
        rows: [
          {
            test: "Adult",
            referenceRange: "19–25 kg/m²",
            siInterval: "—",
          },
        ],
      },
    ],
  },
];
