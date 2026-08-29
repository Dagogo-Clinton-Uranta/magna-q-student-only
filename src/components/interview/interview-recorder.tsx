"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { InterviewFeedback } from "@/lib/interview/feedback";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Stage =
  | "ready"
  | "camera"
  | "countdown"
  | "recording"
  | "playback"
  | "uploading"
  | "feedback";
const RECORDING_SECONDS = 120;

export function InterviewRecorder({
  categorySlug,
  categoryTitle,
  questionId,
  question,
  mockSessionId,
  mockPosition,
  nextHref,
}: {
  categorySlug: string;
  categoryTitle: string;
  questionId?: string;
  question: string;
  mockSessionId?: string;
  mockPosition?: number;
  nextHref?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(RECORDING_SECONDS);
  const [countdown, setCountdown] = useState(3);
  const [showTimer, setShowTimer] = useState(true);
  const [mirror, setMirror] = useState(true);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [duration, setDuration] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [simulatedFeedback, setSimulatedFeedback] = useState(false);
  const [mdModal, setMdModal] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const liveVideo = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const recordingSettings = useRef({ width: 640, height: 360 });

  function stopStream() {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (liveVideo.current) liveVideo.current.srcObject = null;
  }

  useEffect(
    () => () => {
      stopStream();
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    },
    [playbackUrl],
  );

  useEffect(() => {
    if (
      !["camera", "countdown", "recording"].includes(stage) ||
      !liveVideo.current ||
      !stream.current
    )
      return;
    liveVideo.current.srcObject = stream.current;
    void liveVideo.current.play();
  }, [stage]);

  async function prepareCamera() {
    setError("");
    stopStream();
    if (!window.isSecureContext) {
      setError(
        "Camera and microphone permissions require a secure HTTPS page. Open this site over HTTPS (or localhost) and try again.",
      );
      return;
    }
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Video recording is not supported in this browser. Try a current version of Chrome, Edge, Firefox or Safari.",
      );
      return;
    }
    const wantsToContinue = window.confirm(
      "Camera and microphone access is required to record your interview answer. Select OK, then choose Allow when your browser asks for camera and microphone permission.",
    );
    if (!wantsToContinue) {
      setError(
        "Camera and microphone access is required. Select “Allow camera and microphone” when you are ready.",
      );
      return;
    }
    try {
      // Calling getUserMedia directly from this click triggers the browser's
      // native camera and microphone permission dialog when permission has not
      // already been granted or blocked for this site.
      const grantedStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 640 },
          height: { ideal: 360, max: 360 },
          frameRate: { ideal: 24, max: 30 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const cameraTrack = grantedStream.getVideoTracks()[0];
      const microphoneTrack = grantedStream.getAudioTracks()[0];
      if (!cameraTrack || !microphoneTrack) {
        grantedStream.getTracks().forEach((track) => track.stop());
        throw new Error("Both camera and microphone access are required.");
      }
      stream.current = grantedStream;
      const settings = cameraTrack.getSettings();
      recordingSettings.current = {
        width: settings?.width ?? 640,
        height: settings?.height ?? 360,
      };
      setStage("camera");
    } catch (permissionError) {
      const errorName =
        permissionError instanceof DOMException ? permissionError.name : "";
      if (errorName === "NotFoundError") {
        setError(
          "A working camera and microphone could not be found. Connect both devices and try again.",
        );
      } else if (errorName === "NotReadableError") {
        setError(
          "Your camera or microphone is already in use by another application. Close it and try again.",
        );
      } else if (
        errorName === "NotAllowedError" ||
        errorName === "SecurityError" ||
        errorName === "PermissionDeniedError"
      ) {
        setError(
          "Your browser blocked camera or microphone access for this site. Open the site controls beside the address bar, set Camera and Microphone to Allow, reload the page, and try again.",
        );
      } else {
        setError(
          "Camera and microphone access was not granted. Use your browser's site permissions to allow both, then try again.",
        );
      }
    }
  }

  async function beginCountdown() {
    const hasCamera = stream.current
      ?.getVideoTracks()
      .some((track) => track.readyState === "live");
    const hasMicrophone = stream.current
      ?.getAudioTracks()
      .some((track) => track.readyState === "live");
    if (!hasCamera || !hasMicrophone) {
      stopStream();
      setStage("ready");
      setError(
        "Camera and microphone permission is required before each recording. Please allow access again.",
      );
      return;
    }
    setStage("countdown");
    setCountdown(3);
    for (let value = 3; value > 0; value -= 1) {
      setCountdown(value);
      await new Promise((resolve) => window.setTimeout(resolve, 1_000));
    }
    startRecording();
  }

  function supportedMimeType() {
    return (
      [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
    );
  }

  function startRecording() {
    if (!stream.current) return;
    recordedChunks.current = [];
    const nextRecorder = new MediaRecorder(stream.current, {
      mimeType: supportedMimeType() || undefined,
      videoBitsPerSecond: 700_000,
      audioBitsPerSecond: 64_000,
    });
    recorder.current = nextRecorder;
    nextRecorder.ondataavailable = (event) => {
      if (event.data.size) recordedChunks.current.push(event.data);
    };
    nextRecorder.onstop = () => {
      const nextBlob = new Blob(recordedChunks.current, {
        type: nextRecorder.mimeType || "video/webm",
      });
      const url = URL.createObjectURL(nextBlob);
      setBlob(nextBlob);
      setPlaybackUrl(url);
      setDuration(
        Math.max(
          1,
          Math.min(
            RECORDING_SECONDS,
            Math.round((Date.now() - startedAt.current) / 1000),
          ),
        ),
      );
      stopStream();
      setStage("playback");
    };
    startedAt.current = Date.now();
    setRemaining(RECORDING_SECONDS);
    nextRecorder.start(1_000);
    setStage("recording");
  }

  useEffect(() => {
    if (stage !== "recording") return;
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          recorder.current?.stop();
          return 0;
        }
        return current - 1;
      });
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [stage]);

  function stopRecording() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function retryChunk(url: string, part: Blob) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: part,
        });
        if (response.ok) return;
      } catch {
        /* retry below */
      }
      if (attempt < 3)
        await new Promise((resolve) =>
          window.setTimeout(resolve, attempt * 1_000),
        );
    }
    throw new Error(
      "A video chunk could not be uploaded after three attempts.",
    );
  }

  async function uploadForAnalysis() {
    if (!blob) return;
    setError("");
    setStage("uploading");
    setUploadProgress(2);
    const started = Date.now();
    try {
      if (!mockSessionId) {
        if (!questionId)
          throw new Error("This question is missing its analysis identifier.");
        const form = new FormData();
        form.set("video", blob, `interview-${crypto.randomUUID()}.webm`);
        form.set("questionId", questionId);
        form.set("durationSeconds", String(duration));
        form.set("width", String(recordingSettings.current.width));
        form.set("height", String(recordingSettings.current.height));
        setUploadProgress(20);
        const response = await fetch("/api/interview/videos/individual", {
          method: "POST",
          body: form,
        });
        const completed = (await response.json()) as {
          href?: string;
          error?: string;
        };
        if (!response.ok || !completed.href)
          throw new Error(
            completed.error ?? "Analysis could not be completed.",
          );
        setUploadProgress(100);
        window.location.assign(completed.href);
        return;
      }
      const sessionResponse = await fetch("/api/interview/videos/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          questionId,
          question,
          mockSessionId,
          mockPosition,
          mimeType: blob.type || "video/webm",
          durationSeconds: duration,
          byteSize: blob.size,
          width: recordingSettings.current.width,
          height: recordingSettings.current.height,
          metadata: {
            timerVisible: showTimer,
            mirroredPreview: mirror,
            browser: navigator.userAgent,
          },
        }),
      });
      const session = (await sessionResponse.json()) as {
        videoId?: string;
        storageConfigured?: boolean;
        chunkSize?: number;
        error?: string;
      };
      if (!sessionResponse.ok || !session.videoId)
        throw new Error(session.error ?? "Upload could not be started.");
      if (session.storageConfigured) {
        const chunkSize = session.chunkSize ?? 5 * 1024 * 1024;
        const totalParts = Math.ceil(blob.size / chunkSize);
        for (let index = 0; index < totalParts; index += 1) {
          const part = blob.slice(
            index * chunkSize,
            Math.min(blob.size, (index + 1) * chunkSize),
          );
          await retryChunk(
            `/api/interview/videos/chunk?videoId=${session.videoId}&partNumber=${index + 1}`,
            part,
          );
          setUploadProgress(Math.round(((index + 1) / totalParts) * 70));
        }
      } else setUploadProgress(70);
      const completeResponse = await fetch("/api/interview/videos/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: session.videoId }),
      });
      const complete = (await completeResponse.json()) as {
        feedback?: InterviewFeedback | null;
        queued?: boolean;
        simulated?: boolean;
        error?: string;
      };
      if (!completeResponse.ok)
        throw new Error(complete.error ?? "Analysis could not be started.");
      setUploadProgress(82);
      setSimulatedFeedback(Boolean(complete.simulated));
      if (complete.queued && mockSessionId) {
        setUploadProgress(100);
        if (nextHref) window.location.assign(nextHref);
        return;
      }
      let result = complete.feedback ?? null;
      if (complete.queued) {
        for (let attempt = 0; attempt < 30 && !result; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 4_000));
          const statusResponse = await fetch(
            `/api/interview/videos/${session.videoId}/status`,
            { cache: "no-store" },
          );
          const status = (await statusResponse.json()) as {
            feedback?: InterviewFeedback | null;
            status?: string;
            error?: string;
          };
          if (status.status === "failed")
            throw new Error(status.error ?? "Analysis failed.");
          result = status.feedback ?? null;
          setUploadProgress(Math.min(98, 82 + attempt));
        }
      } else {
        const elapsed = Date.now() - started;
        if (elapsed < 22_000)
          await new Promise((resolve) =>
            window.setTimeout(resolve, 22_000 - elapsed),
          );
      }
      if (!result)
        throw new Error(
          "Analysis is taking longer than expected. Your video remains safely queued.",
        );
      setFeedback(result);
      setUploadProgress(100);
      setStage("feedback");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Your local playback is still available.",
      );
      setStage("playback");
    }
  }

  function deleteRecording() {
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    setPlaybackUrl("");
    setBlob(null);
    setFeedback(null);
    setSimulatedFeedback(false);
    setRemaining(RECORDING_SECONDS);
    setStage("ready");
  }

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          {categoryTitle}
        </p>
        <h2 className="mt-2 text-xl font-bold sm:text-2xl">{question}</h2>
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900"
          >
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              ["camera", "countdown", "recording"].includes(stage)
                ? "capture"
                : stage
            }
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {stage === "ready" && (
              <div className="mt-7 rounded-xl bg-slate-950 p-7 text-center text-white sm:p-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl">
                  ●
                </span>
                <h3 className="mt-5 text-2xl font-bold">
                  Get ready for recording
                </h3>
                <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-300">
                  Find a quiet, well-lit place and position your camera at eye
                  level with front-facing light and your face clearly visible.
                  Use a professional interview-appropriate setup and clothing,
                  and look toward the camera naturally. You will see a
                  three-second countdown, then have up to two minutes to answer.
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
                  These are setup and coaching tips only. Camera appearance,
                  clothing, background, and other visual traits are not scored.
                </p>
                <div className="mx-auto mt-5 max-w-xl rounded-lg border border-slate-700 bg-slate-900 p-4 text-left">
                  <p className="font-bold text-white">
                    Camera and microphone permission required
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Before every recording, select the button below and allow
                    this site to use both your camera and microphone. Recording
                    cannot begin unless both permissions are available.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void prepareCamera()}
                  className="button-primary mt-6"
                >
                  Allow camera and microphone
                </button>
                <p className="mt-4 text-xs text-slate-400">
                  Your recording stays on this device until you review it and
                  choose Upload for analysis.
                </p>
              </div>
            )}

            {["camera", "countdown", "recording"].includes(stage) && (
              <div className="mt-6">
                <div className="relative mx-auto aspect-video max-w-3xl overflow-hidden rounded-xl bg-slate-950">
                  <video
                    ref={liveVideo}
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${mirror ? "-scale-x-100" : ""}`}
                  />
                  {stage === "countdown" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-8xl font-black text-white">
                      {countdown}
                    </div>
                  )}
                  {stage === "recording" && showTimer && (
                    <div className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-4 py-2 font-mono font-bold text-white">
                      <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                      {Math.floor(remaining / 60)}:
                      {String(remaining % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
                <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-4 text-sm font-semibold">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showTimer}
                        onChange={(event) => setShowTimer(event.target.checked)}
                      />{" "}
                      Show timer
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mirror}
                        onChange={(event) => setMirror(event.target.checked)}
                      />{" "}
                      Mirror preview
                    </label>
                  </div>
                  {stage === "camera" && (
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <p
                        role="status"
                        className="text-sm font-bold text-emerald-800"
                      >
                        Camera and microphone allowed
                      </p>
                      <button
                        type="button"
                        onClick={() => void beginCountdown()}
                        className="min-h-12 rounded-none bg-black px-6 font-bold text-white"
                      >
                        Start recording
                      </button>
                    </div>
                  )}
                  {stage === "recording" && (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="min-h-12 rounded-lg bg-red-700 px-6 font-bold text-white"
                    >
                      Stop recording
                    </button>
                  )}
                </div>
              </div>
            )}

            {stage === "playback" && playbackUrl && (
              <div className="mt-6">
                <div className="mx-auto max-w-3xl">
                  <video
                    src={playbackUrl}
                    controls
                    playsInline
                    className="aspect-video w-full rounded-xl bg-black object-contain"
                  />
                  <p className="mt-3 text-sm text-slate-600">
                    Review your complete response. Nothing is uploaded unless
                    you choose analysis.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={deleteRecording}
                      className="min-h-12 rounded-lg border border-red-300 px-5 font-bold text-red-800"
                    >
                      Delete recording
                    </button>
                    <button
                      type="button"
                      onClick={() => void uploadForAnalysis()}
                      className="min-h-12 rounded-none bg-black px-6 font-bold text-white"
                    >
                      Upload for analysis
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stage === "uploading" && (
              <div className="mt-7 rounded-xl bg-blue-50 p-8 text-center">
                <LoadingSpinner
                  size="lg"
                  label="Uploading and analysing recording"
                />
                <h3 className="mt-5 text-xl font-bold">
                  Uploading and analysing your response
                </h3>
                <p className="mt-2 text-slate-600">
                  We are transcribing your response and applying the versioned
                  competency rubric. Delivery insights remain separate from
                  competency scores.
                </p>
                <div className="mx-auto mt-5 h-2 max-w-lg overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full bg-blue-700 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-blue-900">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {stage === "feedback" && feedback && (
              <div className="mt-7">
                <div
                  role="status"
                  className="rounded-xl border border-emerald-300 bg-emerald-50 p-5"
                >
                  <h3 className="text-xl font-bold text-emerald-950">
                    {simulatedFeedback
                      ? "Development preview available"
                      : "Your analysis is ready"}
                  </h3>
                  {simulatedFeedback && (
                    <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-950">
                      This sample coaching is not based on your recording and is
                      not saved as a competency result. Authoritative scoring
                      remains disabled until the versioned medical rubrics are
                      supplied.
                    </p>
                  )}
                  <p className="mt-2 leading-7 text-emerald-900">
                    {feedback.summary}
                  </p>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <FeedbackList
                    title="What worked"
                    items={feedback.strengths}
                    tone="emerald"
                  />
                  <FeedbackList
                    title="Try next"
                    items={feedback.improvements}
                    tone="amber"
                  />
                </div>
                {!simulatedFeedback && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Object.entries(feedback.scores).map(([label, score]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-200 p-4 text-center"
                      >
                        <p className="text-2xl font-black text-blue-900">
                          {score}%
                        </p>
                        <p className="mt-1 text-xs font-bold capitalize text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {paymentNotice && (
                  <p
                    role="status"
                    className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-900"
                  >
                    {paymentNotice}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Link
                    href={nextHref ?? "/interview-practice/sessions"}
                    className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 px-5 font-bold"
                  >
                    {nextHref
                      ? mockPosition === 7
                        ? "View mock submission"
                        : "Continue to next question"
                      : "Practice another question"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMdModal(true)}
                    className="min-h-12 rounded-none bg-black px-6 font-bold text-white"
                  >
                    Get opinion from an MD
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {mdModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="md-review-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="md-review-title" className="text-xl font-bold">
              Request an MD opinion?
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              This service costs $10 and you will be emailed the opinion when an
              MD becomes available. Proceed?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMdModal(false)}
                className="min-h-11 rounded-lg border border-slate-300 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setMdModal(false);
                  setPaymentNotice(
                    "Payment is not enabled yet. No charge or MD request was created.",
                  );
                }}
                className="min-h-11 rounded-none bg-black px-5 font-bold text-white"
              >
                Pay $10
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "emerald" | "amber";
}) {
  return (
    <section
      className={`rounded-xl p-5 ${tone === "emerald" ? "bg-emerald-50" : "bg-amber-50"}`}
    >
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">{tone === "emerald" ? "✓" : "→"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
