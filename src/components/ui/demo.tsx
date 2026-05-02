'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { useEffect, useState } from 'react'

const SpiralDemo = () => {
  const [startVisible, setStartVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStartVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative inset-0 h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      <div
        className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-1500 ease-out ${
          startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <span className="text-center text-xl font-extralight uppercase tracking-[0.2em] text-white sm:text-2xl">
          The Problems raW Solves
        </span>
      </div>
    </div>
  )
}

export { SpiralDemo }
