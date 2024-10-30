'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, Copy, Edit, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TextEditor() {
  const [text, setText] = useState("replicate the image, its an input field or text area, when there is some word written wornly a custom underline shows under the word, make multiple color underlying fro different word or sentence mistakes")

  const errorWords = [
    { word: 'wornly', type: 'spelling', color: 'red' },
    { word: 'underlying', type: 'grammar', color: 'blue' },
    { word: 'fro', type: 'spelling', color: 'green' },
  ]

  const highlightErrors = (content: string) => {
    let highlightedContent = content
    errorWords.forEach(({ word, color }) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      highlightedContent = highlightedContent.replace(regex, `<span style="text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 3px;">${word}</span>`)
    })
    return highlightedContent
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
          dangerouslySetInnerHTML={{ __html: highlightErrors(text) }}
          onInput={(e) => setText(e.currentTarget.textContent || '')}
        />
        <Button variant="outline" size="icon" className="absolute top-2 right-2">
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex justify-end items-center space-x-2">
          <Select defaultValue="translate">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translate">العربية</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Wand2 className="mr-2 h-4 w-4" /> كشف الأخطاء
          </Button>
        </div>
      </div>
    </div>
  )
}
