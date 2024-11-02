'use client'

import { TextEditor } from "@/components/text-editor"
import { ErrorDisplay } from "@/components/error-display"
import { watsonApi, type WatsonResponse } from "@/lib/watson-api"
import { useState, useEffect } from "react"

export default function Home() {
  const [corrections, setCorrections] = useState<WatsonResponse>([])

  // Function to update corrections when new errors are found
  const handleErrorsFound = (newCorrections: WatsonResponse) => {
    setCorrections(newCorrections)
  }

  return (
    <main className="flex min-h-screen p-8 justify-center">
      <div className="flex gap-6 max-w-[1200px] w-full">
        <div className="w-[400px]">
          <ErrorDisplay corrections={corrections} />
        </div>
        <div className="flex-1">
          <TextEditor onErrorsFound={handleErrorsFound} />
        </div>
      </div>
    </main>
  )
}
