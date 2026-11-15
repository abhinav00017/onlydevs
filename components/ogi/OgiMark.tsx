/** Plush Ogi (public/brand/ogi.svg), used only inside the chat: the button, the panel header and the resting state. */
export function OgiMark({ size }: { size: number }) {
  // A tiny static SVG: next/image adds nothing here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/ogi.svg" alt="" aria-hidden width={size} height={Math.round(size * 1.03)} draggable={false} />;
}
