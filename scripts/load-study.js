import http from "k6/http";
import { check, sleep } from "k6";
export const options = { vus: 10, duration: "30s" };
export default function () {
  const base = __ENV.APP_URL;
  const cookie = __ENV.AUTH_COOKIE;
  const headers = { "Content-Type": "application/json", Cookie: cookie };
  const response = http.post(
    `${base}/api/study/eligible-count`,
    JSON.stringify({
      examId: __ENV.EXAM_ID,
      mode: "tutor",
      usage: "all",
      subjectIds: [__ENV.SUBJECT_ID],
      categoryIds: [],
    }),
    { headers },
  );
  check(response, {
    "eligible count responded": (r) => r.status === 200 || r.status === 429,
  });
  sleep(1);
}
