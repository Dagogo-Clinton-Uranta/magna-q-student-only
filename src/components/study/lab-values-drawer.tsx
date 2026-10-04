"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LAB_REFERENCE_CATEGORIES,
  type LabReferenceCategory,
} from "@/lib/study/lab-reference-values";

export function LabValuesDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<LabReferenceCategory["id"]>("serum");
  const closeButton = useRef<HTMLButtonElement>(null);
  const activeCategory =
    LAB_REFERENCE_CATEGORIES.find((category) => category.id === activeId) ??
    LAB_REFERENCE_CATEGORIES[0];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeButton.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!activeCategory) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130]">
          <motion.button
            type="button"
            aria-label="Close laboratory reference values"
            className="absolute inset-0 h-full w-full bg-black/45"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-values-title"
            className="absolute inset-y-0 left-0 flex w-full max-w-3xl flex-col border-r border-line bg-white shadow-lift"
            initial={reduceMotion ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "-100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <header className="shrink-0 border-b border-line bg-white px-4 pb-3 pt-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Clinical reference</p>
                  <h2 id="lab-values-title" className="mt-1 text-2xl">
                    Laboratory values
                  </h2>
                </div>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={onClose}
                  className="button-secondary min-h-11 px-4"
                >
                  Close
                </button>
              </div>
              <div
                role="tablist"
                aria-label="Laboratory value categories"
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
              >
                {LAB_REFERENCE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={activeId === category.id}
                    onClick={() => setActiveId(category.id)}
                    className={`min-h-11 shrink-0 border px-3 text-sm font-semibold ${
                      activeId === category.id
                        ? "border-black bg-black text-white"
                        : "border-line bg-white text-body hover:bg-soft"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <h3 className="text-xl tracking-[0.02em]">
                {activeCategory.title}
              </h3>
              <div className="mt-4 space-y-6">
                {activeCategory.groups.map((group, groupIndex) => (
                  <section
                    key={`${activeCategory.id}-${group.title ?? groupIndex}`}
                  >
                    {group.title && (
                      <h4 className="border-b border-brand-200 bg-soft px-3 py-2 font-semibold text-ink">
                        {group.title}
                      </h4>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-brand-800 text-white">
                            <th scope="col" className="w-[34%] px-3 py-2">
                              Laboratory value
                            </th>
                            <th scope="col" className="w-[33%] px-3 py-2">
                              Reference range
                            </th>
                            <th scope="col" className="w-[33%] px-3 py-2">
                              SI reference interval
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => (
                            <tr
                              key={row.test}
                              className="border-b border-line align-top odd:bg-white even:bg-field"
                            >
                              <th
                                scope="row"
                                className="px-3 py-2.5 font-semibold text-ink"
                              >
                                {row.test}
                              </th>
                              <td className="whitespace-pre-line px-3 py-2.5 leading-6 text-body">
                                {row.referenceRange}
                              </td>
                              <td className="whitespace-pre-line px-3 py-2.5 leading-6 text-body">
                                {row.siInterval}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </div>
              <p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-muted">
                Source: NBME Laboratory Reference Values provided with this
                application. Values are shown for examination reference.
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
