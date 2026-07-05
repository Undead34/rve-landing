export function TerminalWindowControls() {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-y-3 gap-x-4 border-b border-[#4A0413]/30 pb-4 transition-colors duration-500">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/10" />
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/10" />
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#E60023]/80 shadow-[0_0_12px_rgba(230,0,35,0.4)]" />
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-mono text-[0.60rem] sm:text-[0.65rem] uppercase tracking-[0.2em] text-[#8A8A93]">
          rve.black-cherry
        </span>
        <span className="rounded border border-[#E60023]/30 bg-[#E60023]/10 px-1.5 py-0.5 font-mono text-[0.50rem] sm:text-[0.55rem] uppercase tracking-[0.2em] text-[#E60023]">
          secure
        </span>
      </div>
    </div>
  )
}
