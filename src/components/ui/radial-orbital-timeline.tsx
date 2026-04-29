'use client'

import type { LucideIcon } from 'lucide-react'

type TimelineItem = {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: LucideIcon
}

type RadialOrbitalTimelineProps = {
  timelineData: TimelineItem[]
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const radius = 190

  return (
    <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute h-[390px] w-[390px] rounded-full border border-white/15" />

      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_50px_rgba(59,130,246,0.45)]">
        <div className="h-6 w-6 rounded-full bg-white/75" />
      </div>

      {timelineData.map((item, index) => {
        const angle = (-90 + (360 / timelineData.length) * index) * (Math.PI / 180)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const Icon = item.icon

        return (
          <div
            key={item.id}
            className="absolute z-20 w-[210px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 backdrop-blur-sm">
              <Icon className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs font-semibold text-white/65">{item.title}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
