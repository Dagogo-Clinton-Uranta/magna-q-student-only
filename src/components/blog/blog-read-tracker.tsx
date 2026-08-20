"use client";

import { useEffect } from "react";

export function BlogReadTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `medinexus:blog-read:${postId}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "pending");

    void fetch(`/api/blogs/${postId}/read`, { method: "POST" }).then(
      (response) => {
        if (response.ok) window.sessionStorage.setItem(key, "recorded");
        else window.sessionStorage.removeItem(key);
      },
      () => window.sessionStorage.removeItem(key),
    );
  }, [postId]);

  return null;
}
