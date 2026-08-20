"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GoBackButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/dashboard");
      }}
    >
      Go back
    </Button>
  );
}
