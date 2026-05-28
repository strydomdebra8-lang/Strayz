// Empty ad slot placeholder. Drop your AdSense code (or any ad provider)
// in the inner div when ready to monetize.
export default function AdSlot({ id = "menu", height = 90, label = "Sponsored" }) {
  return (
    <div
      className="w-full my-4 rounded-2xl border-2 border-dashed border-slate-400 bg-amber-50/50 flex items-center justify-center text-slate-500 font-bold text-xs uppercase"
      style={{ height }}
      data-testid={`ad-slot-${id}`}
      aria-label={`${label} placeholder`}
    >
      {/* AdSense: <ins class="adsbygoogle" data-ad-client="ca-pub-XXX" data-ad-slot="XXX" /> */}
      {label} · ad slot
    </div>
  );
}
