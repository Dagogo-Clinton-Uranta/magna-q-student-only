export const INTERVIEW_RUBRIC_VERSION = "2026.08.1";

export type CoreInterviewCompetency = {
  id: string;
  name: string;
  description: string;
  anchors: Record<"1" | "2" | "3" | "4" | "5", string>;
};

const competencyEntries = [
  ["clear-structured-communication", "Clear & Structured Communication", "a direct, logically ordered answer with a clear central message"],
  ["relevance-concision", "Relevance & Concision", "selection of relevant detail without avoidable repetition or tangents"],
  ["perspective-taking-listening", "Perspective-Taking & Listening", "attention to another person's perspective and evidence of responsive listening"],
  ["respectful-interpersonal-communication", "Respectful Interpersonal Communication", "clear, respectful communication during routine or difficult interactions"],
  ["adaptability-communication", "Adaptability of Communication", "communication adjusted appropriately to audience, context, and need"],
  ["professionalism", "Professionalism", "reliable conduct, appropriate boundaries, and respect for professional responsibilities"],
  ["integrity", "Integrity", "truthful, principled action despite inconvenience or pressure"],
  ["accountability", "Accountability", "ownership of decisions, contribution, consequences, and corrective action"],
  ["appropriate-escalation", "Appropriate Escalation", "timely involvement of the right supervisor, resource, or authority"],
  ["ethical-reasoning", "Ethical Reasoning", "recognition and balanced analysis of relevant ethical duties and competing considerations"],
  ["team-orientation", "Team Orientation", "work toward a shared goal while valuing complementary roles and contributions"],
  ["conflict-resolution", "Conflict Resolution", "direct, respectful resolution of disagreement focused on facts and shared goals"],
  ["receptiveness-feedback", "Receptiveness to Feedback", "open consideration of feedback without defensiveness and appropriate follow-through"],
  ["self-awareness", "Self-Awareness", "accurate recognition of personal strengths, limits, reactions, and contribution"],
  ["reflection", "Reflection", "meaningful interpretation of experience and its implications for future practice"],
  ["behavior-change", "Behavior Change", "a specific, sustained change resulting from feedback, error, or reflection"],
  ["patient-safety-orientation", "Patient-Safety Orientation", "prioritization of immediate and longer-term protection from preventable harm"],
  ["recognition-limits", "Recognition of Limits", "accurate recognition of uncertainty and the boundaries of personal competence"],
  ["prioritization", "Prioritization", "ordering actions according to urgency, risk, and patient or team need"],
  ["appropriate-initiative-agency", "Appropriate Initiative/Agency", "constructive action within role, competence, and supervision"],
  ["resilience", "Resilience", "continued responsible functioning and recovery during or after difficulty"],
  ["adaptive-coping", "Adaptive Coping", "safe, sustainable strategies for managing stress and maintaining responsibilities"],
  ["help-seeking", "Help-Seeking", "timely use of people and resources when support or expertise is needed"],
  ["leadership-judgment", "Leadership Judgment", "appropriate direction and decisions responsive to people, risk, and context"],
  ["delegation-team-enablement", "Delegation/Team Enablement", "clear delegation that matches roles and enables others to contribute"],
  ["systems-thinking", "Systems Thinking", "recognition of processes, incentives, constraints, and downstream effects"],
  ["motivation", "Motivation", "specific, experience-grounded reasons for pursuing medicine, training, or an opportunity"],
  ["specialty-understanding", "Specialty Understanding", "realistic understanding of a specialty's work, demands, and contribution"],
  ["program-understanding", "Program Understanding", "specific and accurate understanding of a program's distinctive opportunities and context"],
  ["career-alignment", "Career Alignment", "credible connection between prior experience, training choices, and future direction"],
  ["commitment-training", "Commitment to Training", "realistic readiness to learn, contribute, and meet residency responsibilities"],
  ["patient-service-orientation", "Patient/Service Orientation", "focus on patient, community, team, or service outcomes rather than self-promotion"],
  ["cultural-humility", "Cultural Humility", "curiosity, respect, and recognition of the limits of one's own perspective"],
  ["recognition-bias-inequity", "Recognition of Bias/Inequity", "recognition of interpersonal and structural bias, barriers, or unequal outcomes"],
  ["advocacy", "Advocacy", "appropriate action to address a patient's, group's, or system's identified need"],
  ["evidence-based-reasoning", "Evidence-Based Reasoning", "appropriate interpretation and application of evidence with uncertainty and limitations"],
  ["understanding-own-research", "Understanding of Own Research", "accurate explanation of a project's question, methods, role, findings, and limitations"],
  ["intellectual-curiosity", "Intellectual Curiosity", "specific inquiry that deepens understanding and guides further learning"],
  ["preparation", "Preparation", "specific evidence of purposeful research and readiness for the conversation"],
  ["insightful-questioning", "Insightful Questioning", "useful questions grounded in genuine curiosity and available context"],
] as const;

function anchorsFor(name: string, evidence: string): CoreInterviewCompetency["anchors"] {
  return {
    "1": `Provides no usable evidence of ${evidence}, or gives transcript evidence that is materially concerning for ${name}.`,
    "2": `Mentions ${evidence}, but support is vague, incomplete, inconsistent, or mostly hypothetical.`,
    "3": `Provides credible, specific transcript evidence of ${evidence} at the level expected in a residency-practice answer.`,
    "4": `Provides strong, well-selected evidence of ${evidence}, including relevant action, judgment, or outcome.`,
    "5": `Provides exceptional, nuanced evidence of ${evidence}, with clear context, impact, and reflection or transfer to future practice where relevant.`,
  };
}

export const coreInterviewCompetencies: CoreInterviewCompetency[] = competencyEntries.map(
  ([id, name, description]) => ({ id, name, description, anchors: anchorsFor(name, description) }),
);

export type RubricCriterionDefinition = { competencyId: string; weight: number };
export type RubricFamilyDefinition = {
  id: string;
  practiceArea: string;
  criteria: RubricCriterionDefinition[];
  strongSignals: string[];
  concerns: string[];
  criticalElements?: string[];
};

const criterion = (...items: Array<[string, number]>): RubricCriterionDefinition[] =>
  items.map(([competencyId, weight]) => ({ competencyId, weight }));

export const rubricFamilies: RubricFamilyDefinition[] = [
  { id: "communication-interpersonal", practiceArea: "communication-interpersonal", criteria: criterion(["clear-structured-communication", .25], ["perspective-taking-listening", .25], ["respectful-interpersonal-communication", .20], ["adaptability-communication", .20], ["relevance-concision", .10]), strongSignals: ["directly answers the question", "shows listening or perspective-taking", "adapts communication", "uses respectful language", "describes an outcome"], concerns: ["dismisses other perspectives", "labels people negatively without reflection", "unnecessary confrontation", "fails to listen", "excessive blame"] },
  { id: "professionalism-integrity", practiceArea: "professionalism-integrity", criteria: criterion(["accountability", .25], ["professionalism", .20], ["ethical-reasoning", .20], ["appropriate-escalation", .20], ["clear-structured-communication", .15]), strongSignals: ["takes ownership", "does not hide mistakes", "protects patients", "recognizes the professional issue", "escalates appropriately"], concerns: ["conceals error", "dishonesty", "blames others entirely", "ignores safety concern", "inappropriate retaliation"] },
  { id: "teamwork-collaboration", practiceArea: "teamwork-collaboration", criteria: criterion(["team-orientation", .25], ["conflict-resolution", .25], ["perspective-taking-listening", .20], ["accountability", .15], ["patient-service-orientation", .15]), strongSignals: ["seeks perspectives", "communicates directly and respectfully", "focuses on a shared goal", "recognizes own role"], concerns: ["treats conflict as winning", "unnecessary blame", "hero narrative", "petty retaliation", "poor collaboration"] },
  { id: "self-awareness-reflection", practiceArea: "self-awareness-reflection", criteria: criterion(["self-awareness", .20], ["accountability", .25], ["reflection", .25], ["behavior-change", .20], ["clear-structured-communication", .10]), strongSignals: ["owns contribution", "identifies a meaningful lesson", "describes specific change", "shows later improvement", "accepts feedback"], concerns: ["fake weakness", "defensiveness", "blames others", "generic lesson", "no behavior change"] },
  { id: "patient-safety-judgment", practiceArea: "patient-safety-judgment", criteria: criterion(["patient-safety-orientation", .25], ["prioritization", .20], ["appropriate-escalation", .20], ["recognition-limits", .20], ["clear-structured-communication", .15]), strongSignals: ["recognizes immediate risk", "protects the patient first", "acts within competence", "asks for appropriate help", "considers prevention"], concerns: ["delays despite safety risk", "acts beyond competence", "conceals error", "fails to escalate serious concern"], criticalElements: ["recognize immediate safety risk", "act within competence", "escalate serious concern"] },
  { id: "resilience-adaptability", practiceArea: "resilience-adaptability", criteria: criterion(["resilience", .20], ["adaptive-coping", .25], ["appropriate-initiative-agency", .15], ["help-seeking", .20], ["reflection", .20]), strongSignals: ["recognizes challenge realistically", "uses constructive coping", "adapts approach", "maintains responsibilities", "seeks help"], concerns: ["dangerous overwork presented as resilience", "denies stress", "maladaptive coping", "refuses help", "persistent blame"] },
  { id: "leadership-systems", practiceArea: "leadership-systems", criteria: criterion(["leadership-judgment", .20], ["delegation-team-enablement", .20], ["clear-structured-communication", .20], ["systems-thinking", .20], ["accountability", .20]), strongSignals: ["takes appropriate initiative", "shares ownership", "communicates priorities", "considers the broader system", "accepts responsibility"], concerns: ["dominates without listening", "micromanages", "takes others' credit", "avoids accountability", "acts without consultation"] },
  { id: "motivation-values-fit", practiceArea: "motivation-values-fit", criteria: criterion(["motivation", .25], ["preparation", .20], ["career-alignment", .20], ["commitment-training", .20], ["clear-structured-communication", .15]), strongSignals: ["is specific", "grounds motivation in experience", "shows realistic understanding", "connects opportunity to goals", "commits to learning and contribution"], concerns: ["generic praise", "prestige-driven reasoning", "unrealistic expectations", "denigrates other paths", "claims to be overqualified"] },
  { id: "equity-cultural-humility", practiceArea: "equity-cultural-humility", criteria: criterion(["cultural-humility", .25], ["respectful-interpersonal-communication", .20], ["recognition-bias-inequity", .20], ["adaptability-communication", .20], ["advocacy", .15]), strongSignals: ["asks rather than assumes", "recognizes limits of own perspective", "uses interpreters appropriately", "identifies systemic barriers", "acts appropriately"], concerns: ["stereotyping", "assumes culture determines preference", "dismisses inequity", "inappropriate paternalism"] },
  { id: "research-evidence", practiceArea: "research-evidence", criteria: criterion(["understanding-own-research", .25], ["evidence-based-reasoning", .25], ["intellectual-curiosity", .15], ["accountability", .20], ["patient-service-orientation", .15]), strongSignals: ["accurately explains question, method, role, findings, and limitations", "does not exaggerate contribution", "connects evidence to care", "shows curiosity"], concerns: ["cannot explain own project", "claims others' work", "publication-count boasting", "overstates conclusions"] },
];

export const rubricOverrides = {
  programFit: { id: "program-fit", practiceArea: "motivation-values-fit", criteria: criterion(["program-understanding", .25], ["career-alignment", .30], ["preparation", .20], ["commitment-training", .15], ["clear-structured-communication", .10]), strongSignals: ["specific program knowledge", "clear personal connection", "credible contribution and learning goals"], concerns: ["answer could apply unchanged to any program"] },
  specialtyFit: { id: "specialty-fit", practiceArea: "motivation-values-fit", criteria: criterion(["specialty-understanding", .25], ["motivation", .25], ["career-alignment", .20], ["commitment-training", .15], ["clear-structured-communication", .15]), strongSignals: ["experience-based motivation", "realistic view of specialty", "career connection"], concerns: ["generic motivation", "unrealistic specialty expectations", "denigrates other specialties"] },
  closingQuestions: { id: "closing-questions", practiceArea: "communication-interpersonal", criteria: criterion(["insightful-questioning", .30], ["preparation", .25], ["intellectual-curiosity", .20], ["career-alignment", .15], ["respectful-interpersonal-communication", .10]), strongSignals: ["genuine curiosity", "questions useful information not already available", "program-aware follow-up"], concerns: ["no preparation", "questions already answered clearly in available material"] },
} satisfies Record<string, RubricFamilyDefinition>;

export type RubricQuestionShape = {
  id: string;
  text?: string;
  practiceArea: string;
  questionType: "general" | "behavioral" | "situational";
};

export function rubricFamilyForQuestion(
  question: RubricQuestionShape,
): RubricFamilyDefinition {
  if (/(?:why (?:did you (?:apply to|choose)|are you interested in)|what attracted you to).*(?:our|this) program/i.test(question.text ?? "")) return rubricOverrides.programFit;
  if (/why (?:did you choose|are you pursuing|this) (?:the )?(?:specialty|field)|why do you want to be a/i.test(question.text ?? "")) return rubricOverrides.specialtyFit;
  if (/questions? (?:do you have|would you like to ask)|what (?:questions|would you like to know)/i.test(question.text ?? "")) return rubricOverrides.closingQuestions;
  const family = rubricFamilies.find((item) => item.practiceArea === question.practiceArea);
  if (!family) throw new Error(`No rubric family for ${question.practiceArea}.`);
  return {
    ...family,
    criticalElements:
      question.questionType === "situational" &&
      ["professionalism-integrity", "patient-safety-judgment"].includes(question.practiceArea)
        ? family.criticalElements ?? ["identify the central professional or safety issue", "take a safe action", "escalate when required"]
        : family.criticalElements,
  };
}

export function competencyById(id: string) {
  return coreInterviewCompetencies.find((item) => item.id === id);
}
