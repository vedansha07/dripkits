import { CameraIcon } from "@phosphor-icons/react/dist/ssr";

// Fan photo grid. There are no photo reviews yet, so this is the designed empty state the plan
// asked for: it says what goes here and who fills it. Phase 3 wires it to review media.
export function FanPhotos() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="type-display text-4xl md:text-6xl">Worn by you</h2>
        <p className="max-w-[40ch] text-sm text-muted-foreground md:text-base">
          Photo reviews land here. The first one gets the top spot.
        </p>
      </div>
      <ul className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex aspect-square items-center justify-center bg-card">
            <CameraIcon className="size-6 text-muted-foreground/40" weight="regular" />
          </li>
        ))}
      </ul>
    </section>
  );
}
