"use client";

import { BrowserApp } from "@/components/BrowserApp";
import { BrowserProvider } from "@/components/BrowserProvider";

export default function Home() {
  return (
    <BrowserProvider>
      <BrowserApp />
    </BrowserProvider>
  );
}
