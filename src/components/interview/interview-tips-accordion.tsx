"use client";

import { useState } from "react";

const tips = [
  {
    question: "What problem is the residency program trying to solve?",
    answer:
      "You are not being hired simply to perform well in an interview. A program needs residents who are dependable, work hard, support the team, care safely for patients and remain reliable at 2 a.m. Strong programs may also look for future leaders, educators and researchers. Reframe your goal from trying to impress the panel to showing how your presence will make the team stronger.",
  },
  {
    question: "How do I identify and communicate my personal brand?",
    answer:
      "Your brand is the thread connecting your experiences, motivations and future direction. Ask what colleagues rely on you for, which experiences repeatedly mattered to you, and what you want to be known for. Use that thread to make broad answers—especially “Tell me about yourself”—coherent rather than a list of unrelated achievements.",
  },
  {
    question: "How should I adapt my answers to different interviewers?",
    answer:
      "Different programs and interviewers value different parts of your story. Ask transformational questions such as what makes a resident stand out, which resident-growth moment they remember most, or what mistakes they hope new residents avoid. Listen for their values, then connect a truthful experience from your own life to what they shared. Save routine questions about pay and scheduling for an appropriate information session when possible.",
  },
  {
    question: "Why is listening as important as answering?",
    answer:
      "A good interview should become a conversation, not a monologue. Listening helps you understand what the interviewer actually cares about, ask thoughtful follow-up questions and avoid delivering a rehearsed answer that misses the point. Candidates become memorable when the interviewer feels heard and the conversation develops naturally.",
  },
  {
    question: "How can I tell stories that demonstrate my qualities?",
    answer:
      "Show rather than announce. Instead of saying you are clinically strong or willing to advocate for patients, tell a concise story in which your reasoning and actions make those qualities obvious. Choose a situation, explain the challenge, describe what you did, and finish with the result and what changed in your practice. Rehearse the idea and structure—not an exact script—so you can adapt when the prompt changes.",
  },
  {
    question: "What is the smartest way to research a program?",
    answer:
      "Do not try to memorize the entire website. Look for distinctive initiatives, new changes, special tracks, patient populations and areas that genuinely interest you. If possible, speak with someone who knows the program. Turn the research into questions such as “What are you most excited about in the program right now?” or “What challenge is the program working to solve?”",
  },
  {
    question:
      "How should I answer questions about exam failures or other red flags?",
    answer:
      "Address the concern directly. A program may be asking whether the problem will recur, whether you can pass future boards, or whether you are coachable. Acknowledge what happened, explain specifically what you changed and provide evidence that the new approach worked. Do not minimize the issue. The strongest answer demonstrates insight, action and measurable growth.",
  },
  {
    question: "What makes a useful post-interview follow-up?",
    answer:
      "Generic thank-you notes are easy to forget. Refer briefly to a meaningful part of the conversation, especially a story or value the interviewer shared, and explain why it stayed with you. This demonstrates that you listened and reconnects your name to a positive, specific memory. Keep the message professional and respect current Match communication rules.",
  },
  {
    question:
      "How do I balance authenticity with the expectations of a program?",
    answer:
      "Authenticity does not mean saying every thought without judgment, and tailoring does not mean inventing a persona. Ask good questions to discover what the interviewer values, then choose the true parts of your experience that genuinely connect with those values. Never lie; make thoughtful choices about which honest evidence best answers the question.",
  },
  {
    question: "What if I do not have an impressive clinical story?",
    answer:
      "Replace “What is my most impressive story?” with “Which patient or moment affected me most?” Ordinary experiences often reveal powerful qualities when you examine what you noticed, why it mattered, how you responded and what you learned. The emotional and professional meaning of the story is often more memorable than its drama.",
  },
  {
    question: "Should I ask questions throughout or wait until the end?",
    answer:
      "Treat the interview as a balanced professional conversation. When a natural opening appears, it is usually appropriate to ask a relevant question unless the interviewer explicitly asks you to hold questions until the end. Follow their structure, remain attentive to time and avoid forcing questions merely to appear engaged.",
  },
  {
    question: "What is the final mindset to carry into the interview?",
    answer:
      "Write this down before your next interview: “I’m not here to impress them. I’m here to solve their problem.” When you understand your own motivations and approach the program with that service-oriented mindset, your brand, questions and stories become tools for genuine connection rather than a performance.",
  },
];

export function InterviewTipsAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {tips.map((tip, index) => {
        const open = openIndex === index;
        return (
          <article
            key={tip.question}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`tip-${index}`}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold hover:bg-slate-50"
              >
                <span>
                  <span className="mr-3 text-blue-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {tip.question}
                </span>
                <span
                  aria-hidden="true"
                  className={`text-2xl font-light text-blue-700 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={`tip-${index}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="border-t border-slate-100 px-5 py-5 leading-7 text-slate-700">
                  {tip.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
