const screenshotExemptRoutes = [
  /^\/$/,
  /^\/login\/?$/,
  /^\/verify\/?$/,
  /^\/auth\/callback\/?$/,
];

/**
 * Landing and authentication screens may be captured. Every other rendered
 * application route receives the browser-level screenshot deterrents.
 */
export function shouldProtectContent(pathname: string) {
  return !screenshotExemptRoutes.some((route) => route.test(pathname));
}
