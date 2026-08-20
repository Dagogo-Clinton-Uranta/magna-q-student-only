export type InterviewFeedback = {
  summary: string;
  strengths: string[];
  improvements: string[];
  scores: {
    structure: number;
    clarity: number;
    authenticity: number;
    professionalism: number;
  };
};

export const demoFeedback: InterviewFeedback[] = [
  {
    summary:
      "Your answer felt thoughtful and professional. The central idea was clear, and a more specific closing sentence would make it easier to remember.",
    strengths: [
      "You established context without spending too long on background.",
      "Your tone conveyed calmness and genuine reflection.",
      "The answer stayed connected to residency and patient care.",
    ],
    improvements: [
      "Add one concrete example instead of describing the quality in general terms.",
      "Finish by stating what the experience means for the resident you will become.",
      "Reduce filler words by pausing briefly before each new point.",
    ],
    scores: {
      structure: 78,
      clarity: 82,
      authenticity: 86,
      professionalism: 88,
    },
  },
  {
    summary:
      "You gave a credible answer with a strong beginning. Tightening the middle and naming your personal contribution would make it more persuasive.",
    strengths: [
      "The opening directly addressed the question.",
      "You sounded engaged rather than over-rehearsed.",
      "Your pacing was appropriate for a two-minute response.",
    ],
    improvements: [
      "Use a situation–action–result structure when describing an experience.",
      "Make your individual action distinct from what the whole team did.",
      "Replace one broad statement with an observable result.",
    ],
    scores: {
      structure: 74,
      clarity: 80,
      authenticity: 84,
      professionalism: 85,
    },
  },
  {
    summary:
      "The response showed self-awareness and good professional judgment. It will become stronger when you connect the lesson to the program's needs.",
    strengths: [
      "You acknowledged complexity without becoming defensive.",
      "The answer demonstrated reflection and willingness to improve.",
      "Your delivery was respectful and easy to follow.",
    ],
    improvements: [
      "State the main message in the first 15 seconds.",
      "Use fewer supporting points and develop the best one more fully.",
      "Close with a direct link to reliability, teamwork or patient safety.",
    ],
    scores: {
      structure: 81,
      clarity: 77,
      authenticity: 89,
      professionalism: 90,
    },
  },
];

export function feedbackForQuestion(question: string) {
  const total = [...question].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return demoFeedback[total % demoFeedback.length] ?? demoFeedback[0]!;
}
