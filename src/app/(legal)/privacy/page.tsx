import Link from "next/link";

const effectiveDate = "5 September 2026";

export default function PrivacyPage() {
  return (
    <article className="legal-article">
      <h1>Privacy Notice</h1>
      <p>
        <strong>Effective and last updated:</strong> {effectiveDate}
      </p>
      <div className="not-prose my-6 border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <strong>Pre-launch company information.</strong> Magna-Q is currently
        the name of this service. Before paid public launch, this notice must be
        updated with the full name, registration number, physical address and
        working privacy email address of the Nigerian company that will operate
        it. Those details are legally important and cannot be replaced by this
        notice.
      </div>

      <p>
        This Privacy Notice explains how Magna-Q (&quot;Magna-Q&quot;,
        &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) collects, uses,
        discloses, stores and protects personal data when you visit or use the
        Magna-Q website, question banks, study tools, residency resources,
        interview-practice tools, community features, subscriptions and related
        educational or consulting services (together, the &quot;Service&quot;).
      </p>
      <p>
        For purposes of the Nigeria Data Protection Act 2023 (&quot;NDPA&quot;),
        Magna-Q is the data controller for the processing described here unless
        a separate service notice identifies another controller. Some suppliers
        process data for us as data processors or service providers. This notice
        does not apply to an independent website or service that you choose to
        visit through an external link.
      </p>

      <nav aria-label="Privacy notice contents">
        <h2>Contents</h2>
        <ol>
          <li>
            <a href="#data-we-collect">Personal data we collect</a>
          </li>
          <li>
            <a href="#privacy-sources">How we collect it</a>
          </li>
          <li>
            <a href="#use-and-bases">How and why we use it</a>
          </li>
          <li>
            <a href="#interview-ai">Interview recordings and AI</a>
          </li>
          <li>
            <a href="#disclosures">When we disclose data</a>
          </li>
          <li>
            <a href="#public-spaces">Community and public spaces</a>
          </li>
          <li>
            <a href="#transfers">International transfers</a>
          </li>
          <li>
            <a href="#retention">Retention</a>
          </li>
          <li>
            <a href="#security">Security and breaches</a>
          </li>
          <li>
            <a href="#choices">Your choices and rights</a>
          </li>
          <li>
            <a href="#us-rights">United States privacy disclosures</a>
          </li>
          <li>
            <a href="#children">Children</a>
          </li>
          <li>
            <a href="#changes-contact">Changes, complaints and contact</a>
          </li>
        </ol>
      </nav>

      <section id="data-we-collect">
        <h2>1. Personal data we collect</h2>
        <p>
          The data we collect depends on the features you use. It may include
          the following categories.
        </p>
        <h3>Account, identity and contact data</h3>
        <ul>
          <li>
            Your name, username, email address, country of residence, telephone
            calling code and telephone number.
          </li>
          <li>
            Authentication records and account identifiers. Passwords are
            handled by our authentication provider; we do not store a readable
            copy of your password.
          </li>
          <li>
            Communications you send to support and records of notices or
            consents associated with your account.
          </li>
        </ul>

        <h3>Educational and professional profile data</h3>
        <ul>
          <li>
            Your medical school, training level, current USMLE or residency
            stage, target examination and changes to your study stage.
          </li>
          <li>
            Information you voluntarily provide when requesting educational or
            consulting support. Please do not provide patient records,
            government identifiers, account credentials or information that is
            not needed for the request.
          </li>
        </ul>

        <h3>Question-bank and study data</h3>
        <ul>
          <li>
            Test blocks, questions served, selected answers, correctness,
            timings, completion state, tutor or timed mode, marks, private
            notes, error reports and submission identifiers.
          </li>
          <li>
            Performance summaries, question statistics, subject and system
            progress, study history and inferences needed to provide your
            learning analytics. Magna-Q scores are educational analytics, not
            official examination results.
          </li>
        </ul>

        <h3>Residency-planning and interview-practice data</h3>
        <ul>
          <li>
            Residency programs and events you save, your private tracking notes
            and your interactions with residency resources.
          </li>
          <li>
            Video and audio recordings you deliberately submit for interview
            practice, together with file type, size, duration, dimensions and
            limited browser and session metadata.
          </li>
          <li>
            Transcripts, word timings, speech-delivery measurements, rubric
            evaluations, recommendations, provider request identifiers and
            processing status. A recording or transcript may incidentally reveal
            sensitive information if you choose to discuss it.
          </li>
        </ul>

        <h3>Community, feedback and publication data</h3>
        <ul>
          <li>
            Chat-room membership and messages, comments, mentions, reactions,
            moderation results and content you submit to community features.
          </li>
          <li>
            Feature requests, submitted images, image credits, project
            descriptions, representative quotations and publication choices.
          </li>
          <li>
            Attributable testimonials you choose to submit, including your
            display name, username, stage transition, rating and comments.
            General product feedback is stored without your account identifier,
            although it includes your country code.
          </li>
        </ul>

        <h3>Transaction data</h3>
        <ul>
          <li>
            Subscription status, plan and billing period, amounts and currency,
            Stripe customer, subscription, checkout, invoice and event
            identifiers, and limited billing contact information.
          </li>
          <li>
            Card numbers, security codes and full payment credentials are
            entered directly on Stripe&apos;s hosted pages and are not stored by
            Magna-Q.
          </li>
        </ul>

        <h3>Device, usage and security data</h3>
        <ul>
          <li>
            IP address, approximate location derived from it, browser and device
            information, requested pages, timestamps, application events,
            diagnostics and security or rate-limit events.
          </li>
          <li>
            For the registration limit, we retain a one-way SHA-256 hash of the
            normalized IP address rather than the raw address. A hash may still
            be personal data where it can be linked to a person or device.
          </li>
        </ul>
      </section>

      <section id="privacy-sources">
        <h2>2. How we collect personal data</h2>
        <p>We collect data:</p>
        <ul>
          <li>
            <strong>from you</strong>, when you register, update your profile,
            answer questions, write notes, make a payment, submit a recording,
            join a community feature, request support or consulting, or
            otherwise communicate with us;
          </li>
          <li>
            <strong>automatically</strong>, when your browser or device
            interacts with the Service, including through essential cookies,
            logs and local browser storage; and
          </li>
          <li>
            <strong>from service providers</strong>, such as payment status from
            Stripe, authentication events from Supabase, and transcription or
            evaluation output from the providers described below.
          </li>
        </ul>
        <p>
          We may also use public information about residency programs and
          applicant events. That directory information is not about a user
          unless the user saves or comments on it.
        </p>
      </section>

      <section id="use-and-bases">
        <h2>3. How and why we use personal data</h2>
        <p>
          We process personal data only where we have a lawful basis. Depending
          on the activity and applicable law, those bases are performance of our
          contract with you, steps requested before entering a contract, your
          consent, compliance with a legal obligation, protection of vital
          interests, or our legitimate interests where those interests do not
          override your rights.
        </p>
        <ul>
          <li>
            <strong>Provide the Service and perform our contract:</strong>{" "}
            create and secure your account; deliver question banks, study
            history, analytics, saved items, private notes, interview practice,
            community features, subscriptions, support and any purchased
            educational or consulting service.
          </li>
          <li>
            <strong>Process payments:</strong> initiate checkout, reconcile
            payment and subscription events, grant paid access, prevent
            duplicate subscriptions and maintain transaction records.
          </li>
          <li>
            <strong>Personalize your workspace:</strong> show content
            appropriate to your selected stage and produce analytics from your
            own activity.
          </li>
          <li>
            <strong>Operate safely and fairly:</strong> authenticate users,
            enforce per-user and network limits, investigate suspected account
            sharing or scraping, moderate community content, debug failures and
            protect users, Magna-Q and our intellectual property. We generally
            rely on contract and legitimate interests for this work.
          </li>
          <li>
            <strong>Improve the Service:</strong> analyze aggregated or
            de-identified usage, test functionality and understand product
            performance. We do not publish individual question-bank performance
            without authorization.
          </li>
          <li>
            <strong>Communicate:</strong> send service, security, billing and
            policy messages. Marketing requires any consent required by law and
            will include a way to withdraw it.
          </li>
          <li>
            <strong>Meet legal obligations:</strong> maintain financial records,
            respond to valid legal process, protect legal claims and comply with
            data-protection, consumer-protection and other applicable laws.
          </li>
        </ul>
        <p>
          If we ask for consent, you may withhold or later withdraw it.
          Withdrawal does not make earlier lawful processing unlawful, but a
          feature may no longer work if the relevant data is essential to that
          feature. Where we rely on legitimate interests, our interests include
          securing and improving an educational service, preventing fraud and
          misuse, and protecting question-bank content. We will document and
          reassess that balance where required.
        </p>
      </section>

      <section id="cookies">
        <h2>4. Cookies and browser storage</h2>
        <p>
          Magna-Q currently uses essential technologies needed for login,
          security, session continuity, theme preferences and locally saved
          drafts. Blocking essential cookies may prevent account features from
          working. Browser storage used for a local draft remains on your device
          until you submit it, clear it or remove the relevant site data.
        </p>
        <p>
          We will not activate non-essential analytics, advertising or
          personalization cookies for users in jurisdictions requiring consent
          unless a conspicuous choice mechanism first allows the user to accept
          or reject them. If those technologies are introduced, we will identify
          the providers, purposes and retention periods in an updated cookie
          notice and provide a persistent preference control.
        </p>
      </section>

      <section id="interview-ai">
        <h2>5. Interview recordings and artificial intelligence</h2>
        <p>
          Interview practice is optional. If you choose it, your browser records
          your answer and uploads it directly to a private Cloudflare R2 object.
          Access is limited through short-lived signed links. We send the
          recording to Deepgram for speech-to-text processing. We then send the
          interview question, relevant rubric and transcript to OpenAI to
          produce structured educational feedback. These providers may process
          data outside Nigeria.
        </p>
        <p>
          The resulting feedback is validated and combined with deterministic
          measurements such as speaking rate, word count, filler words and
          pauses. Magna-Q does not use facial recognition, infer emotion from
          your face, identify you from your voice, or score accent, appearance,
          protected characteristics or predicted Match success. The output is
          not an employment, admission, licensing or other decision with legal
          or similarly significant effect. It is practice feedback that you
          should review critically.
        </p>
        <p>
          Do not include patient-identifying information, another person&apos;s
          confidential information or application credentials in a recording.
          Where applicable law treats the content you volunteer as sensitive
          personal data, we will obtain the additional consent required before
          processing it. You may choose not to use interview recording without
          losing access to unrelated parts of the Service.
        </p>
      </section>

      <section id="disclosures">
        <h2>6. When we disclose personal data</h2>
        <p>
          We do not sell personal data. We do not disclose personal data for
          cross-context behavioral advertising. We disclose only what is
          reasonably necessary to the following categories of recipients:
        </p>
        <ul>
          <li>
            <strong>Infrastructure and authentication providers</strong>,
            including Supabase and hosting, database, storage, networking,
            logging and security providers;
          </li>
          <li>
            <strong>Payment providers</strong>, including Stripe and the banks
            or payment networks involved in your transaction;
          </li>
          <li>
            <strong>Interview-processing providers</strong>, including
            Cloudflare, Deepgram, OpenAI and infrastructure used to queue and
            complete processing;
          </li>
          <li>
            <strong>Professional advisers and contractors</strong>, where they
            need the information and are subject to appropriate confidentiality
            and data-protection duties;
          </li>
          <li>
            <strong>Authorities or other parties</strong>, when required by law,
            court order or valid legal process, or when necessary and
            proportionate to protect rights, safety, investigate fraud or
            establish or defend legal claims; and
          </li>
          <li>
            <strong>A successor organization</strong>, in connection with a
            proposed or completed merger, financing, reorganization or transfer
            of the Service, subject to applicable notice and protection
            requirements.
          </li>
        </ul>
        <p>
          We require processors to act only on documented instructions, protect
          the data and not use it for their own unrelated purposes. Provider
          privacy notices govern any separate relationship you create directly
          with them.
        </p>
      </section>

      <section id="public-spaces">
        <h2>7. Community features, testimonials and public information</h2>
        <p>
          Your private notes, individual answer history and interview results
          are not public community posts. Content you deliberately post in a
          chat room, approved feature page or comment area can be seen by the
          audience identified in that feature. Your username may appear beside
          it. Private group content can still be copied by another member, so do
          not post patient details, application credentials, home addresses,
          private contact details or anything you do not have permission to
          share.
        </p>
        <p>
          A testimonial or project feature is not used publicly merely because
          you sent general product feedback. Publication requires the relevant
          submission and review workflow. If we want to reuse your name, image
          or words in advertising beyond the context you requested, we will seek
          any additional permission required by law.
        </p>
      </section>

      <section id="transfers">
        <h2>8. International data transfers</h2>
        <p>
          Magna-Q is intended to be operated from Nigeria, while suppliers may
          process or store data in the United States and other countries. Those
          countries may provide different legal protections. For transfers from
          Nigeria, we will use an adequacy basis, contractual safeguards,
          consent where valid and required, or another transfer ground permitted
          by Part VIII of the NDPA and applicable Nigeria Data Protection
          Commission guidance. We will assess vendors and document relevant
          transfer safeguards.
        </p>
      </section>

      <section id="retention">
        <h2>9. How long we keep data</h2>
        <p>
          We retain personal data only for as long as reasonably necessary for
          the purpose described, including to provide your account, comply with
          law, resolve disputes, prevent abuse and enforce agreements. Retention
          depends on the data:
        </p>
        <ul>
          <li>
            account, profile, study history, private notes, saved residency
            items and interview results are generally retained while your
            account is active and then deleted or de-identified after a valid
            deletion request, subject to exceptions below;
          </li>
          <li>
            raw interview recordings use a short, configuration-controlled R2
            retention period, currently designed around a 24-hour lifecycle for
            ordinary processing and retry needs; transcripts and feedback remain
            with the result until deletion under the account-retention rules;
          </li>
          <li>
            transaction, tax and accounting records are retained for the period
            required by applicable law;
          </li>
          <li>
            security, fraud-prevention and consent records are retained for a
            proportionate period needed to demonstrate compliance and protect
            the Service; and
          </li>
          <li>
            public posts may remain until removed under the applicable feature
            rules, while copies required for disputes, moderation or legal
            compliance may be retained for longer.
          </li>
        </ul>
        <p>
          Deletion from active systems may not immediately remove encrypted
          backups. Backup copies are isolated, protected from ordinary use and
          deleted or overwritten on their normal cycle unless preservation is
          legally required. We may retain de-identified statistics that can no
          longer reasonably identify you.
        </p>
      </section>

      <section id="security">
        <h2>10. Security and personal-data breaches</h2>
        <p>
          We use measures appropriate to the nature and risk of the data,
          including role-based access, row-level database controls, private
          object storage, limited-lived signed links, transport encryption,
          server-side authorization, rate limits, restricted service
          credentials, payment-provider tokenization and logging designed not to
          contain recordings or full transcripts. No internet service can
          guarantee absolute security.
        </p>
        <p>
          If a breach occurs, we will investigate, contain and document it and
          notify the Nigeria Data Protection Commission within the legally
          required period where notification is required. We will also notify
          affected people and other regulators where required by the NDPA,
          applicable United States breach laws or other law.
        </p>
        <p>
          Protect your password, sign out of shared devices and contact us
          promptly if you believe your account or recording has been accessed
          without authorization.
        </p>
      </section>

      <section id="choices">
        <h2>11. Your choices and privacy rights</h2>
        <p>
          Subject to applicable exceptions, the NDPA may give you rights to be
          informed; obtain confirmation and access; correct inaccurate or
          incomplete data; request deletion; restrict or object to processing;
          receive portable data where applicable; withdraw consent; object to
          direct marketing; and obtain safeguards concerning qualifying solely
          automated decisions. You also have a right not to suffer unlawful
          discrimination for exercising a privacy right.
        </p>
        <p>
          Use available profile or account controls or submit a request through
          our <Link href="/contact">contact page</Link>. Describe the right you
          wish to exercise and the account email concerned. We may verify your
          identity and authority before acting, particularly where a request
          could expose or delete data. We will respond within the period
          required by applicable law. Some data may be retained where necessary
          for payment records, security, legal claims, freedom of expression or
          another lawful exception. You may use an authorized agent where local
          law permits, subject to proof of authority and identity verification.
        </p>
      </section>

      <section id="us-rights">
        <h2>12. United States state privacy disclosures</h2>
        <p>
          If a United States state privacy law applies to Magna-Q and to you,
          you may have rights to know or access personal information, obtain a
          portable copy, correct it, delete it, opt out of covered sale, sharing
          or targeted advertising, limit certain sensitive-data uses, and appeal
          a denied request. California residents may also have the right to
          non-discrimination and to use an authorized agent.
        </p>
        <p>
          During the preceding 12 months, the categories collected and disclosed
          for business purposes are those described in Sections 1 and 6. Sources
          and purposes are described in Sections 2 and 3. We do not knowingly
          sell personal information or share it for cross-context behavioral
          advertising, and therefore do not offer a sale/sharing opt-out link at
          this time. We do not knowingly sell or share the personal information
          of anyone under 18. If our practices change, we will first update the
          required notices and choice mechanisms, including recognition of
          legally required browser opt-out signals.
        </p>
        <p>
          These disclosures do not state that Magna-Q currently meets a
          particular state law&apos;s business-size or processing threshold. We
          will honor rights where the law applies and may choose to honor a
          reasonable request more broadly.
        </p>
      </section>

      <section id="children">
        <h2>13. Children</h2>
        <p>
          The Service is intended for adults aged 18 or older and is not
          directed to children. Do not create an account if you are under 18. We
          do not knowingly collect personal data from a child through the
          Service. If we learn that a child&apos;s data was collected, we will
          restrict and delete it unless law permits continued processing and all
          required parental or guardian authorization and safeguards are in
          place. Parents or guardians may report a concern through the contact
          method below.
        </p>
      </section>

      <section id="changes-contact">
        <h2>14. Changes, complaints and contact</h2>
        <p>
          We may update this notice to reflect changes in the Service, providers
          or law. The current version will show its effective date. We will give
          prominent notice of a material change and obtain consent where the new
          processing requires it. An updated notice does not retroactively make
          an unlawful use lawful.
        </p>
        <p>
          Questions, rights requests and privacy complaints may be submitted
          through the <Link href="/contact">Magna-Q contact page</Link>. Before
          commercial launch, this section must also display the registered
          operator&apos;s physical address and a monitored privacy email
          address.
        </p>
        <p>
          If we cannot resolve a concern, you may lodge a complaint with the{" "}
          <a href="https://ndpc.gov.ng" target="_blank" rel="noreferrer">
            Nigeria Data Protection Commission
          </a>
          . United States residents may also contact the attorney general or
          privacy regulator for their state. These options do not limit any
          other remedy available under applicable law.
        </p>
      </section>
    </article>
  );
}
