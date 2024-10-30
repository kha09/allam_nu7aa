'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronDown, Copy, Edit, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { watsonApi, WatsonResponse } from '@/lib/watson-api'

export function TextEditor() {
  const [userInput, setUserInput] = useState("")
  const [correctedText, setCorrectedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findDifferences = (original: string, corrected: string) => {
    console.log('Finding differences between:');
    console.log('Original:', original);
    console.log('Corrected:', corrected);

    const originalWords = original.split(/\s+/);
    const correctedWords = corrected.split(/\s+/);
    
    console.log('Original words:', originalWords);
    console.log('Corrected words:', correctedWords);

    const result = originalWords.map((word, index) => {
      const isDifferent = word !== correctedWords[index];
      console.log(`Comparing word "${word}" with "${correctedWords[index]}" - Different: ${isDifferent}`);
      return isDifferent ? 
        `<span style="text-decoration: underline; text-decoration-color: red; text-decoration-thickness: 2px;">${word}</span>` 
        : word;
    }).join(' ');

    console.log('Final marked-up text:', result);
    return result;
  }

  const handleGenerateText = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await watsonApi.generateText(userInput)
      console.log('API Response:', response);

      // Parse the response as JSON if it's a string
      let parsedResponse: WatsonResponse;
      if (typeof response === 'string') {
        try {
          parsedResponse = JSON.parse(response);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid response format');
        }
      } else {
        parsedResponse = response;
      }

      console.log('Parsed Response:', parsedResponse);
      console.log('Corrected Text:', parsedResponse["تصحيح الخطأ"]);

      setCorrectedText(parsedResponse["تصحيح الخطأ"]);
    } catch (err) {
      console.error('Error in handleGenerateText:', err);
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const displayText = correctedText ? findDifferences(userInput, correctedText) : userInput;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md" dir="rtl">
      <div className="flex justify-between items-center mb-4">
      </div>
      <div className="relative mb-4">
        <div
          contentEditable
          suppressContentEditableWarning
          spellCheck="false"
          dir="rtl"
          lang="ar"
          className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          style={{ 
            direction: 'rtl',
            fontFamily: 'inherit'
          }}
          dangerouslySetInnerHTML={{ __html: displayText }}
          onInput={(e) => {
            const newText = e.currentTarget.textContent || '';
            console.log('New user input:', newText);
            setUserInput(newText);
            setCorrectedText(null); // Reset correction when user types
          }}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-2 left-2"
          onClick={() => navigator.clipboard.writeText(userInput)}
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleGenerateText}
            disabled={isLoading}
          >
            <Wand2 className="ml-2 h-4 w-4" />
            {isLoading ? 'جاري الكشف...' : 'كشف الاخطاء'}
          </Button>
          <Select defaultValue="translate">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الإجراء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translate">اللغة العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm text-right">
          {error}
        </div>
      )}
    </div>
  )
}
