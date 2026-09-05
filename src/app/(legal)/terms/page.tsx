import Link from "next/link";

const effectiveDate = "5 September 2026";

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Terms and Conditions of Use</h1>
      <p>
        <strong>Effective and last updated:</strong> {effectiveDate}
      </p>
      <div className="not-prose my-6 border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <strong>Pre-launch company information.</strong> Before paid public
        launch, replace this notice with the registered Nigerian operator&apos;s
        full legal name, registration number, physical address and working legal
        and support contacts. A Nigerian lawyer should review the final terms,
        especially the subscription, consulting, liability and dispute clauses.
      </div>

      <p>
        These Terms and Conditions (&quot;Terms&quot;) form a binding agreement
        between you and the Nigerian entity that operates Magna-Q
        (&quot;Magna-Q&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;)
        concerning your access to the Magna-Q websites, question banks, study
        and interview tools, residency resources, community features,
        subscriptions and educational or consulting services (together, the
        &quot;Service&quot;).
      </p>
      <p>
        By creating an account, selecting a box that refers to these Terms,
        buying a subscription or using the Service, you agree to these Terms and
        our <Link href="/privacy">Privacy Notice</Link>. If you do not agree, do
        not create an account, purchase or use the Service. If a signed
        consulting agreement, institutional agreement or checkout page contains
        service-specific terms, those terms control only for that service and
        only to the extent of a direct conflict.
      </p>

      <nav aria-label="Terms contents">
        <h2>Contents</h2>
        <ol>
          <li>
            <a href="#eligibility">Eligibility and accounts</a>
          </li>
          <li>
            <a href="#services">The Service</a>
          </li>
          <li>
            <a href="#education-only">Educational purpose and no guarantees</a>
          </li>
          <li>
            <a href="#license">Your limited license</a>
          </li>
          <li>
            <a href="#prohibited-use">Prohibited use and content protection</a>
          </li>
          <li>
            <a href="#analytics">Question-bank analytics and resets</a>
          </li>
          <li>
            <a href="#consulting">Consulting and application support</a>
          </li>
          <li>
            <a href="#interview-ai">Interview practice and AI feedback</a>
          </li>
          <li>
            <a href="#user-content">User content and community rules</a>
          </li>
          <li>
            <a href="#copyright">Copyright complaints</a>
          </li>
          <li>
            <a href="#subscriptions">Prices, subscriptions and cancellation</a>
          </li>
          <li>
            <a href="#refunds">Refunds and service failures</a>
          </li>
          <li>
            <a href="#availability">Changes and availability</a>
          </li>
          <li>
            <a href="#third-parties">Third-party services</a>
          </li>
          <li>
            <a href="#suspension">Suspension and termination</a>
          </li>
          <li>
            <a href="#warranties">Disclaimers and liability</a>
          </li>
          <li>
            <a href="#disputes">Complaints, law and disputes</a>
          </li>
          <li>
            <a href="#general">General provisions</a>
          </li>
        </ol>
      </nav>

      <section id="eligibility">
        <h2>1. Eligibility and accounts</h2>
        <p>
          You must be at least 18 years old and legally capable of entering this
          agreement. The Service is designed for medical students, graduates and
          healthcare professionals; it is not directed to children. You may not
          use the Service where doing so would violate applicable law, sanctions
          or export restrictions.
        </p>
        <p>You agree to:</p>
        <ul>
          <li>
            provide accurate, current and complete registration information;
          </li>
          <li>
            maintain only one personal account unless we approve otherwise;
          </li>
          <li>
            keep your credentials confidential and not permit another person to
            use your account or subscription;
          </li>
          <li>
            promptly update material account information and notify us of
            suspected unauthorized access; and
          </li>
          <li>
            remain responsible for activity reasonably attributable to your
            account until you notify us of compromise.
          </li>
        </ul>
        <p>
          Access purchased by a school, employer or other institution may also
          be subject to its agreement with Magna-Q. The institution may control
          eligibility and the duration of institution-funded access. We will
          tell you before sharing identifiable learning results with an
          institution unless law or the institutional arrangement already
          provides a valid basis and notice for that disclosure.
        </p>
      </section>

      <section id="services">
        <h2>2. The Service</h2>
        <p>Depending on your plan and availability, Magna-Q may provide:</p>
        <ul>
          <li>
            original practice questions, explanations, study blocks, personal
            notes, performance analytics and educational reference materials;
          </li>
          <li>
            USMLE Step 1, Step 2 CK and Step 3 planning resources and learning
            tools;
          </li>
          <li>
            residency directories, opportunity listings, application and Match
            guidance, saved program tools and interview preparation;
          </li>
          <li>
            recorded interview practice, transcription and automated educational
            feedback;
          </li>
          <li>
            community rooms, comments, testimonials and member features; and
          </li>
          <li>
            where separately offered, tutoring, document review, educational
            consulting or residency-application support.
          </li>
        </ul>
        <p>
          Your purchase grants access only to the product, features, period and
          usage limits displayed at checkout. Free features may differ from paid
          features. No physical goods are supplied unless a specific offer says
          otherwise.
        </p>
      </section>

      <section id="education-only">
        <h2>
          3. Educational purpose, professional responsibility and no guarantees
        </h2>
        <p>
          Magna-Q is an independent educational preparation service. It is not a
          medical school, examination authority, credentialing organization,
          residency program, immigration adviser, law firm, recruitment agency
          or healthcare provider. Use of the Service does not create a
          physician-patient, lawyer-client, fiduciary, employment, agency or
          admissions relationship.
        </p>
        <p>
          Content may discuss diseases, diagnosis, treatment, examinations,
          applications, visas and professional decisions, but it is not medical
          advice for a patient and is not legal, immigration, financial or
          licensing advice. Never use a question-bank explanation as the sole
          basis for patient care. Use current authoritative clinical guidance,
          local policy, licensed supervision and your independent professional
          judgment. In an emergency, contact the appropriate local emergency
          service.
        </p>
        <p>
          Requirements, fees, dates, exam formats, scoring rules, visa policies
          and program preferences can change. You are responsible for checking
          current information directly with the relevant official organization
          and for submitting accurate, complete and timely applications.
        </p>
        <p>Magna-Q does not promise or guarantee:</p>
        <ul>
          <li>a USMLE pass, score or improvement of any specified amount;</li>
          <li>
            that a practice score or percentile will predict an official result;
          </li>
          <li>
            an interview, ranking decision, residency or fellowship Match,
            clinical rotation, research position or employment;
          </li>
          <li>
            ECFMG certification, medical licensure, visa sponsorship or any
            immigration result; or
          </li>
          <li>
            acceptance, publication or approval of an application, personal
            statement, research paper or other document.
          </li>
        </ul>
        <p>
          Outcomes depend on factors outside our control, including your prior
          education, study and test-taking decisions, health and circumstances,
          official policies, application record, visa status, program judgment
          and competition. Testimonials describe individual experiences and are
          not promises of typical or future results.
        </p>
      </section>

      <section id="license">
        <h2>4. Ownership and your limited license</h2>
        <p>
          The Service, including its questions, answer choices, explanations,
          diagrams, software, databases, rubrics, videos, guides, selection and
          arrangement, is owned by or licensed to Magna-Q and protected by
          Nigerian, United States and international intellectual-property laws.
        </p>
        <p>
          While your account and applicable subscription are active, we grant
          you a limited, revocable, non-exclusive, non-transferable and
          non-sublicensable license to access the purchased portion of the
          Service for your own personal, non-commercial education. Access is
          licensed, not sold. No ownership right transfers to you.
        </p>
        <p>
          You may print or download only material for which Magna-Q displays an
          express print or download control, solely for your personal
          educational use and without removing attribution or notices. The
          ability to write private notes or view performance reports does not
          grant a right to reproduce the underlying questions.
        </p>
      </section>

      <section id="prohibited-use">
        <h2>5. Prohibited use and protection of question-bank content</h2>
        <p>You must not, directly or through another person or tool:</p>
        <ul>
          <li>
            share, sell, rent, transfer or provide your account or simultaneous
            access to another person;
          </li>
          <li>
            copy, photograph, screen-record, screenshot, print, download,
            transcribe, memorize for reconstruction, publish or redistribute
            protected questions or other content except where an express Service
            control authorizes it;
          </li>
          <li>
            upload protected content to an AI system, flashcard service, shared
            drive, messaging group, forum, tutoring bank, website or any other
            third-party product;
          </li>
          <li>
            scrape, crawl, harvest, bulk-query or use bots, scripts, browser
            automation, extensions or similar means to extract content or data;
          </li>
          <li>
            bypass rate limits, access controls, content protections,
            subscription gates or technical restrictions;
          </li>
          <li>
            reverse engineer, decompile, probe or attempt to discover source
            code, non-public APIs, correct-answer indicators or security
            vulnerabilities, except to the extent a law expressly prohibits
            restricting such activity;
          </li>
          <li>
            create multiple accounts, manipulate network identifiers or use
            another person&apos;s identity to evade restrictions or charges;
          </li>
          <li>
            use the Service to build, train, benchmark or improve a competing
            question bank, model or commercial product;
          </li>
          <li>
            introduce malware, overload the Service, interfere with another
            user, or test security without prior written authorization; or
          </li>
          <li>
            use the Service unlawfully or infringe another person&apos;s rights.
          </li>
        </ul>
        <p>
          We may use proportionate server-side usage records, rate limits and
          concurrent-session signals to detect sharing, automated extraction,
          fraud and security threats as described in the Privacy Notice. A high
          study volume alone is not automatically a violation. Where reasonably
          practicable, we will review context and may ask you to explain unusual
          activity before permanent termination.
        </p>
      </section>

      <section id="analytics">
        <h2>6. Question-bank analytics, availability and resets</h2>
        <p>
          Question counts and content may change as material is added,
          corrected, retired or reclassified. Performance analytics are based on
          the questions available, your recorded activity and Magna-Q&apos;s
          methods. They may differ from official examinations and from other
          preparation products.
        </p>
        <p>
          Test history, notes, marks and reports may be available only during an
          active account or subscription. If a reset feature is offered, the
          interface will explain what is erased before confirmation. A confirmed
          reset may permanently remove performance history and may not be
          reversible. Expiration, cancellation or deletion does not entitle you
          to export protected question content.
        </p>
      </section>

      <section id="consulting">
        <h2>7. Tutoring, consulting and application support</h2>
        <p>
          Any consulting, tutoring, document review or residency support is
          educational. Recommendations are professional opinions, not
          assurances. Another qualified adviser may reasonably recommend a
          different approach. You retain responsibility for every decision,
          statement, deadline, program selection and document submitted in your
          name.
        </p>
        <p>You agree that you will:</p>
        <ul>
          <li>
            provide accurate information and disclose relevant constraints
            needed for the agreed educational work;
          </li>
          <li>
            review all edited documents and ensure that the final version is
            truthful, original and genuinely reflects your experience and voice;
          </li>
          <li>
            never ask a Magna-Q adviser to fabricate experience, impersonate
            you, access an application portal as you, provide leaked examination
            material or misrepresent authorship;
          </li>
          <li>
            independently verify official requirements with ECFMG, FSMB, NBME,
            USMLE, AAMC/MyERAS, NRMP, relevant programs and qualified legal or
            immigration professionals; and
          </li>
          <li>
            attend booked sessions on time and follow the cancellation or
            rescheduling terms clearly disclosed for that service before
            payment.
          </li>
        </ul>
        <p>
          We will not submit applications, rank lists, certifications or legal
          filings on your behalf unless a separate lawful written agreement
          expressly describes the task. Magna-Q will not request your password
          to an official examination, MyERAS, NRMP, immigration or medical
          licensing account.
        </p>
      </section>

      <section id="interview-ai">
        <h2>8. Interview practice and automated feedback</h2>
        <p>
          If you choose recorded interview practice, you authorize us to process
          the recording and transcript to provide that feature as described in
          the <Link href="/privacy">Privacy Notice</Link>. Do not record another
          person without their lawful permission or include patient-identifying,
          confidential or privileged information.
        </p>
        <p>
          Automated feedback can be incomplete, inconsistent or wrong. Scores
          are based on Magna-Q rubrics and are not official predictions or
          decisions by a residency program. Review the transcript and feedback,
          apply your own judgment and consult a qualified human adviser where
          appropriate. You may report an apparent transcription or evaluation
          error through the <Link href="/contact">contact page</Link>.
        </p>
      </section>

      <section id="user-content">
        <h2>9. User content and community rules</h2>
        <p>
          &quot;User Content&quot; means messages, comments, notes, recordings,
          images, testimonials, project descriptions, feedback and other
          material you submit. You retain ownership of your User Content. You
          grant Magna-Q a non-exclusive, worldwide, royalty-free license to
          host, copy, transmit, format, moderate and display it only as needed
          to operate, secure and improve the feature you selected. This
          operational license ends when the content is deleted from active
          systems, except for protected backups, de-identified information and
          copies lawfully retained for legal purposes.
        </p>
        <p>
          Public marketing use of your name, likeness, testimonial or submitted
          project outside the feature you requested requires any separate
          permission required by law. You may withdraw a marketing permission
          prospectively, although this may not require recall of material
          already lawfully printed or distributed.
        </p>
        <p>You represent that your User Content:</p>
        <ul>
          <li>is accurate where presented as fact and is yours to submit;</li>
          <li>
            does not violate privacy, confidentiality, copyright, trademark or
            another person&apos;s rights;
          </li>
          <li>
            does not contain leaked examination questions, patient identifiers,
            application credentials or malicious code; and
          </li>
          <li>
            is not unlawful, fraudulent, impersonating, threatening, harassing,
            hateful, defamatory, exploitative, obscene or spam.
          </li>
        </ul>
        <p>
          We may moderate, restrict or remove User Content that violates these
          Terms or creates a legal, privacy or safety risk. We do not undertake
          to pre-screen every communication. Community content expresses its
          author&apos;s views, not necessarily Magna-Q&apos;s, and should not be
          treated as verified professional advice.
        </p>
      </section>

      <section id="copyright">
        <h2>10. Copyright and intellectual-property complaints</h2>
        <p>
          If you believe material on the Service infringes your rights, send a
          notice through our <Link href="/contact">contact page</Link>{" "}
          identifying the work, the challenged material and its location, your
          contact details, the basis of your claim, and a statement that the
          information is accurate and submitted in good faith by the owner or an
          authorized representative. We may remove or restrict material, notify
          the user who supplied it and consider a valid response or
          counter-notice under applicable law.
        </p>
        <p>
          If Magna-Q seeks United States Digital Millennium Copyright Act safe
          harbor protection for user-hosted material, it must first publish and
          register a qualifying designated agent with the U.S. Copyright Office.
          The pre-launch contact route is not a representation that registration
          has already occurred.
        </p>
      </section>

      <section id="subscriptions">
        <h2>11. Prices, payments, subscriptions and cancellation</h2>
        <p>
          The checkout page will disclose the product, currency, full price,
          taxes or fees collected by us, billing frequency, subscription term,
          renewal terms and cancellation method before you authorize payment.
          Stripe processes payment details under its own terms and privacy
          notice. Your bank or telecommunications provider may charge separate
          currency-conversion, data or transaction fees that we do not control.
        </p>
        <p>
          If you choose a recurring subscription, you expressly authorize
          Magna-Q and Stripe to charge the displayed amount at the displayed
          interval until cancellation. We will provide an electronic
          confirmation that includes the material terms and cancellation
          instructions. A failed or reversed payment may suspend paid access
          while the issue is unresolved.
        </p>
        <p>
          You may cancel an online subscription through the online billing
          management method made available from your account or by contacting
          support. Cancellation stops future renewals and ordinarily takes
          effect at the end of the already-paid billing period, unless the
          interface or applicable law says otherwise. We will not require you to
          use a more burdensome cancellation method than the method legally
          permitted for online enrollment.
        </p>
        <p>
          We will give notices of renewal, trial conversion, material price
          changes and annual subscription reminders where and when applicable
          law requires them. A price change applies prospectively and will not
          alter an already-paid period. If you do not accept a future price, you
          may cancel before it takes effect.
        </p>
      </section>

      <section id="refunds">
        <h2>12. Refunds, cancellations and service failures</h2>
        <p>
          Except where the checkout page provides a more generous policy, fees
          for an already-started digital subscription period are ordinarily not
          refundable merely because you did not use the Service, changed your
          study plan, or lacked a compatible device or internet connection. This
          rule does not remove a right provided by applicable consumer law.
        </p>
        <p>
          If we fail to supply a paid service, materially misdescribe it, make
          it unavailable for a substantial part of the purchased period, or fail
          to perform it with the quality or timeliness required by applicable
          law, contact us promptly. Depending on the circumstances and the law,
          the remedy may include correction, repeat performance, service credit,
          extension, cancellation or a full or proportionate refund. If Magna-Q
          permanently withdraws a prepaid service without a reasonably
          equivalent replacement, we will provide a proportionate refund for the
          unused period unless law requires more.
        </p>
        <p>
          Consulting-session cancellation charges must be reasonable and will be
          disclosed before booking. If Magna-Q cancels a booked service and
          cannot provide a reasonable alternative, you may choose a refund for
          the undelivered service. Nothing in these Terms excludes rights under
          the Nigerian Federal Competition and Consumer Protection Act 2018 or
          mandatory law where you live.
        </p>
      </section>

      <section id="availability">
        <h2>13. Service changes, corrections and availability</h2>
        <p>
          We may correct errors and update, add, retire or reorganize content to
          maintain the Service. We may also perform maintenance or respond to
          security and provider failures. We do not guarantee uninterrupted or
          error-free access, but we will use reasonable care and skill and will
          not use this clause to avoid a mandatory remedy for a material service
          failure.
        </p>
        <p>
          We may discontinue a free feature. If a change materially reduces a
          prepaid feature during its term, we will provide reasonable notice and
          an appropriate remedy where required. Keep independent copies of your
          own permitted records; do not rely on the Service as the only archive
          for an application deadline or professional obligation.
        </p>
      </section>

      <section id="third-parties">
        <h2>14. Third-party services and links</h2>
        <p>
          The Service relies on or links to services such as Supabase,
          Cloudflare, Stripe, Deepgram, OpenAI, official examination and
          residency organizations, and program websites. We are responsible for
          selecting and managing our processors as required by law, but we do
          not control an independent third-party website, its content,
          availability, decisions or separate relationship with you. Review its
          terms and privacy notice before using it.
        </p>
      </section>

      <section id="suspension">
        <h2>15. Suspension, termination and account deletion</h2>
        <p>
          You may stop using the Service, cancel a subscription as described
          above and request account deletion subject to the Privacy Notice. We
          may temporarily restrict access to investigate a credible security,
          fraud, payment, account-sharing, scraping, safety or legal issue.
        </p>
        <p>
          We may terminate access for a material or repeated breach, unlawful
          conduct, non-payment, infringement, threats to users or systems, or
          conduct that makes continued service legally impracticable. Except
          where immediate action is reasonably necessary, we will provide notice
          and a reasonable opportunity to explain or cure the issue. A user may
          appeal through the contact page.
        </p>
        <p>
          Termination ends the content license. Provisions concerning ownership,
          permitted retained data, payment obligations, disclaimers, liability
          and dispute resolution survive where their nature requires it. A
          termination for breach does not automatically eliminate consumer
          remedies unrelated to that breach.
        </p>
      </section>

      <section id="warranties">
        <h2>16. Disclaimers and limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, and subject to the express
          consumer protections in these Terms, the Service is provided on an
          &quot;as available&quot; basis. We do not warrant that every item is
          complete, current or free from error, that every device will be
          compatible, or that educational content will achieve a particular
          outcome. Any implied term that may lawfully be limited is limited to
          the minimum extent permitted.
        </p>
        <p>
          To the fullest extent permitted by law, neither party is liable to the
          other for indirect, incidental, special or consequential loss that was
          not reasonably foreseeable when the contract was made. Magna-Q&apos;s
          aggregate liability arising from a paid Service will not exceed the
          fees you paid for the affected Service during the six months preceding
          the event giving rise to the claim, except where applying that limit
          would be unlawful.
        </p>
        <p>Nothing in these Terms excludes or limits liability for:</p>
        <ul>
          <li>fraud, fraudulent misrepresentation or willful misconduct;</li>
          <li>
            gross negligence, or death or personal injury to the extent caused
            by negligence and not lawfully excludable;
          </li>
          <li>
            breach of confidentiality, data-protection duties or intellectual-
            property rights to the extent a limitation is prohibited by law;
          </li>
          <li>
            a refund, repeat performance or other remedy that cannot be waived
            under consumer law; or
          </li>
          <li>
            any other liability that applicable law does not permit us to limit.
          </li>
        </ul>
        <p>
          The Nigerian Federal Competition and Consumer Protection Act prohibits
          contract terms that unlawfully waive liability for defective
          performance, negligence, misrepresentation or implied obligations.
          These Terms must be read consistently with those protections.
        </p>
      </section>

      <section id="disputes">
        <h2>17. Complaints, governing law and disputes</h2>
        <p>
          Please first send a detailed complaint through our{" "}
          <Link href="/contact">contact page</Link>. We will acknowledge and try
          to resolve it fairly. A consumer may also complain to the Federal
          Competition and Consumer Protection Commission, the Nigeria Data
          Protection Commission for privacy matters, a competent United States
          regulator where applicable, or another body with lawful jurisdiction.
        </p>
        <p>
          These Terms and non-contractual disputes are governed by the laws of
          the Federal Republic of Nigeria, without regard to conflict-of-laws
          rules. Before court proceedings, the parties should consider
          good-faith negotiation or voluntary mediation in Lagos State. If a
          dispute is not resolved, the courts of competent jurisdiction in Lagos
          State, Nigeria will have jurisdiction, subject to any mandatory
          consumer right to sue or seek relief in another forum.
        </p>
        <p>
          These Terms do not require private arbitration, waive a right to
          participate in a class or representative action, shorten a statutory
          limitation period, or prevent a regulator from acting. Any future
          arbitration agreement must be separately and lawfully presented and
          accepted.
        </p>
      </section>

      <section id="general">
        <h2>18. General provisions</h2>
        <h3>Changes to these Terms</h3>
        <p>
          We may update these Terms prospectively for changes in law, security
          or the Service. We will post the effective date and give reasonable
          advance notice of a material change. If a change materially affects an
          active paid term, we will seek fresh agreement where required or allow
          cancellation with any remedy required by law. Changes do not
          retroactively excuse an earlier breach.
        </p>
        <h3>Electronic communications</h3>
        <p>
          You consent to receive agreements, receipts and transactional,
          security and service notices electronically at your account email or
          through the Service. This does not constitute consent to marketing.
          Keep your email address current and retain copies important to you.
        </p>
        <h3>Assignment</h3>
        <p>
          You may not transfer your personal account or content license. We may
          transfer this agreement as part of a genuine corporate reorganization
          or sale of the Service, provided that doing so does not reduce
          mandatory rights and required privacy notice is given.
        </p>
        <h3>Entire agreement, severability and waiver</h3>
        <p>
          These Terms, the Privacy Notice and applicable service-specific terms
          are the entire agreement about the Service. If a provision is invalid
          or unenforceable, it will be limited or removed only to the minimum
          extent necessary, and the remaining provisions continue. A delay in
          enforcing a provision is not a waiver.
        </p>
        <h3>Independent status and trademarks</h3>
        <p>
          USMLE, NBME, FSMB, ECFMG, Intealth, AAMC, MyERAS and NRMP names and
          marks belong to their respective owners. Magna-Q is independent and is
          not affiliated with, approved by or endorsed by those organizations.
          References identify the relevant examination or application process.
        </p>
        <h3>Contact</h3>
        <p>
          Contact us through the{" "}
          <Link href="/contact">Magna-Q contact page</Link>. Before commercial
          launch, this section must also identify the registered operator,
          registration number, physical address and a monitored legal email
          address.
        </p>
      </section>
    </article>
  );
}
