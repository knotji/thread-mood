"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  variant?: "default" | "minimal";
};

export function CopyButton({ value, label = "คัดลอก", variant = "default" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        copyWithTextarea(value);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      copyWithTextarea(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="text-[11px] font-semibold text-slate-400 hover:text-sky-600 transition bg-transparent border-0 cursor-pointer p-0 select-none"
      >
        {copied ? "คัดลอกแล้ว! ✓" : label === "คัดลอก" ? "คัดลอก 📋" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700 disabled:opacity-60 cursor-pointer"
    >
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}

function copyWithTextarea(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
