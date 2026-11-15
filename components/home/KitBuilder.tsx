"use client";

import Link from "next/link";
import { useState } from "react";
import { KitBlocks } from "@/components/visuals";
import { KIT, blockName } from "@/lib/content";
import { BLOCK_IDS, SUGGESTED_BLOCKS, kitHref, sortBlocks, type BlockId, type BusinessId } from "@/lib/kit";

/**
 * Frame 8: build your kit. Pick a business, get suggested blocks, tap to add or remove,
 * then book a call with the kit filled in. Native radios and toggle buttons, so it works by keyboard.
 */
export function KitBuilder() {
  const [business, setBusiness] = useState<BusinessId | undefined>(undefined);
  const [blocks, setBlocks] = useState<BlockId[]>([]);
  const suggested = business ? SUGGESTED_BLOCKS[business] : [];

  function pickBusiness(id: BusinessId) {
    setBusiness(id);
    setBlocks(SUGGESTED_BLOCKS[id]);
  }

  function toggle(id: BlockId) {
    setBlocks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : sortBlocks([...prev, id])));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div className="space-y-10">
        <fieldset>
          <legend className="text-lg font-bold">{KIT.step1}</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {KIT.businesses.map((b) => (
              <label
                key={b.id}
                className="cursor-pointer rounded-full border border-line bg-card px-4 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:border-brand-line has-checked:border-brand has-checked:bg-brand has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-brand"
              >
                <input type="radio" name="kit-business" value={b.id} checked={business === b.id} onChange={() => pickBusiness(b.id)} className="sr-only" />
                {b.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-bold">{KIT.step2}</legend>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {BLOCK_IDS.map((id) => {
              const on = blocks.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(id)}
                    className={`flex h-full w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      on ? "border-brand bg-brand-soft" : "border-line bg-card hover:border-brand-line"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        on ? "border-brand bg-brand text-white" : "border-line text-muted"
                      }`}
                    >
                      {on ? "✓" : "+"}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">
                        {blockName(id, business)}
                        {suggested.includes(id) ? (
                          <span className="ml-2 rounded-full bg-card px-2 py-0.5 align-middle text-xs font-semibold text-brand">{KIT.suggested}</span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-muted">{KIT.blocks[id].line}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <KitBlocks blocks={blocks} business={business} className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-card" />
        <p aria-live="polite" className="mt-5 text-base font-semibold text-ink">
          {blocks.length ? KIT.countLabel(blocks.length) : KIT.empty}
        </p>
        {blocks.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {blocks.map((id) => (
              <li key={id} className="rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong">
                {blockName(id, business)}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-6 text-sm font-semibold text-muted">{KIT.step3}</p>
        <Link
          href={kitHref({ business, blocks })}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-strong sm:w-auto"
        >
          {KIT.button}
        </Link>
      </div>
    </div>
  );
}
