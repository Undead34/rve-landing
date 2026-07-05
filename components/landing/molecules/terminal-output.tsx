"use client"

import { useEffect, useState } from "react"
import { TerminalWindowControls } from "@/components/landing/atoms/terminal-window-controls"

const COMMAND = "cargo run --release --bin rve"

type OutputLine = {
  id: string
  text: string
  className: string
  delay: number
}

const OUTPUT_LINES: OutputLine[] = [
  { id: "boot-gap-1", text: " ", className: "", delay: 80 },
  { id: "boot-core", text: "[ rve::core ] Booting Red Velvet Engine v0.1.0...", className: "text-[#8A8A93]", delay: 150 },
  { id: "boot-env", text: "[ rve::env  ] Edition: Black Cherry 🍒", className: "text-[#E60023] font-bold", delay: 90 },
  { id: "boot-arch", text: "[ rve::sys  ] Architecture: Stateless / Zero-Persistence", className: "text-[#F4F4F6]", delay: 120 },
  { id: "boot-models", text: "[ rve::sec  ] Loading risk models... 4,096 constraints active.", className: "text-[#F4F4F6]", delay: 200 },
  { id: "boot-network", text: "[ rve::net  ] Calibrating latency baseline... OK (0.4ms)", className: "text-[#F4F4F6]", delay: 100 },
  { id: "boot-gap-2", text: " ", className: "", delay: 40 },
  { id: "boot-divider", text: "────────────────────────────────────────────────────────────", className: "text-[#4A0413]", delay: 70 },
  { id: "boot-gap-3", text: " ", className: "", delay: 40 },
  { id: "boot-listening", text: "● » Listening on http://[::]:3439", className: "text-[#F4F4F6]", delay: 110 },
]

export function TerminalOutput() {
  const [commandText, setCommandText] = useState("")
  const [visibleOutputLines, setVisibleOutputLines] = useState<OutputLine[]>([])
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let isCancelled = false
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const runAnimation = async () => {
      if (prefersReducedMotion) {
        setCommandText(COMMAND)
        setVisibleOutputLines(OUTPUT_LINES)
        setIsDone(true)
        return
      }

      await sleep(300)

      for (let i = 0; i <= COMMAND.length; i++) {
        if (isCancelled) return
        setCommandText(COMMAND.slice(0, i))
        await sleep(15)
      }

      await sleep(150)

      for (const line of OUTPUT_LINES) {
        if (isCancelled) return
        setVisibleOutputLines((prev) => [...prev, line])
        await sleep(line.delay)
      }

      if (!isCancelled) setIsDone(true)
    }

    runAnimation()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#4A0413]/40 bg-[#0A0A0A] p-4 sm:p-6 shadow-[0_20px_50px_-12px_rgba(74,4,19,0.5)] transition-all duration-500">
      <TerminalWindowControls />
      <div className="min-h-[14rem] sm:min-h-[16rem] w-full whitespace-pre-wrap break-words font-mono text-[11px] sm:text-xs md:text-sm leading-relaxed tracking-normal pb-2">
        <div className="flex flex-col">
          <div className="text-[#F4F4F6]">
            <span className="text-[#8A8A93] mr-2">$</span>
            {commandText}
            {!isDone && visibleOutputLines.length === 0 && (
              <span className="cursor-blink inline-block w-1.5 sm:w-2 bg-[#E60023]" />
            )}
          </div>
          {visibleOutputLines.map((line, index) => {
            const isLast = index === visibleOutputLines.length - 1
            const showCursor = isLast && isDone
            return (
              <div key={line.id} className={`flex-none ${line.className}`}>
                {line.text}
                {showCursor && (
                  <span className="cursor-blink ml-1 inline-block w-1.5 sm:w-2 bg-[#E60023]" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
