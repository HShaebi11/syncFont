"use client";

import { Suspense } from "react";

import { FontLibrary } from "@/components/fonts/font-library";
import { SkeletonBlock } from "@/components/ui/feedback";

export default function FontsPage() {
  return (
    <Suspense fallback={<SkeletonBlock className="h-64" />}>
      <FontLibrary />
    </Suspense>
  );
}
