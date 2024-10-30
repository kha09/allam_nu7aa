'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, Copy, Edit, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { watsonApi } from '@/lib/watson-api'

export function TextEditor() {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateText = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await watsonApi.generateText(text)
      setText(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
      </div>
      <div className="relative mb-4">
        <div
          contentEditable
          spellCheck="false"
          className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          dangerouslySetInnerHTML={{ __html: text }}
          onInput={(e) => setText(e.currentTarget.textContent || '')}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={() => navigator.clipboard.writeText(text)}
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Select defaultValue="translate">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translate">Translate</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleGenerateText}
            disabled={isLoading}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
