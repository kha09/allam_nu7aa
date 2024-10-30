'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronDown, Copy, Edit, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { watsonApi, WatsonResponse } from '@/lib/watson-api'

interface ErrorInfo {
  word: string;
  type: string;
  position: {
    top: number;
    left: number;
  };
}

export function TextEditor() {
  const [userInput, setUserInput] = useState("")
  const [correctedText, setCorrectedText] = useState<string | null>(null)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findDifferences = (original: string, corrected: string, errorType: string) => {
    console.log('Finding differences between:', { original, corrected, errorType });

    const originalWords = original.split(/\s+/);
    const correctedWords = corrected.split(/\s+/);
    
    const result = originalWords.map((word, index) => {
      const isDifferent = word !== correctedWords[index];
      return isDifferent ? 
        `<span 
          class="error-word" 
          style="text-decoration: underline; text-decoration-color: red; text-decoration-thickness: 2px; position: relative; cursor: help;"
          data-error-type="${errorType}"
          data-word="${word}"
        >${word}</span>` 
        : word;
    }).join(' ');

    return result;
  }

  useEffect(() => {
    // Add event listeners for hover effects
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('error-word')) {
        const word = target.getAttribute('data-word');
        const errorType = target.getAttribute('data-error-type');
        
        if (word && errorType) {
          const rect = target.getBoundingClientRect();
          const editorRect = document.querySelector('[contenteditable]')?.getBoundingClientRect();
          
          if (editorRect) {
            // Calculate position relative to the editor
            const top = rect.top - editorRect.top - 5; // 5px above the word
            const left = rect.left - editorRect.left + (rect.width / 2); // Centered on the word
            
            setErrorInfo({
              word,
              type: errorType,
              position: {
                top,
                left,
              }
            });
          }
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tooltip = document.getElementById('error-tooltip');
      
      // Check if mouse is moving to tooltip
      if (tooltip && e.relatedTarget === tooltip) {
        return;
      }
      
      // Check if mouse is moving from tooltip back to word
      if (tooltip && target === tooltip && (e.relatedTarget as HTMLElement)?.classList.contains('error-word')) {
        return;
      }

      if (target.classList.contains('error-word') || target.id === 'error-tooltip') {
        setErrorInfo(null);
      }
    };

    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  const handleGenerateText = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await watsonApi.generateText(userInput)
      console.log('API Response:', response);

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
      setCorrectedText(parsedResponse["تصحيح الخطأ"]);
      const displayText = findDifferences(
        userInput, 
        parsedResponse["تصحيح الخطأ"],
        parsedResponse["نوع الخطأ"]
      );
      
      const editorDiv = document.querySelector('[contenteditable]');
      if (editorDiv) {
        editorDiv.innerHTML = displayText;
      }
    } catch (err) {
      console.error('Error in handleGenerateText:', err);
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

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
          onInput={(e) => {
            const newText = e.currentTarget.textContent || '';
            console.log('New user input:', newText);
            setUserInput(newText);
            setCorrectedText(null);
          }}
        />
        {errorInfo && (
          <div
            id="error-tooltip"
            className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm"
            style={{
              direction: 'rtl',
              minWidth: '150px',
              maxWidth: '300px',
              transform: 'translateX(50%)',
              top: `${errorInfo.position.top}px`,
              left: `${errorInfo.position.left}px`,
              animation: 'fadeIn 0.2s ease-in-out',
            }}
          >
            <div 
              className="absolute w-3 h-3 bg-white border-t border-r border-gray-200 transform rotate-45"
              style={{
                bottom: '-6px',
                right: '50%',
                marginRight: '-6px',
              }}
            />
            <div className="font-bold mb-1">{errorInfo.word}</div>
            <div className="text-red-600">{errorInfo.type}</div>
          </div>
        )}
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
            {isLoading ? 'جاري التدقيق...' : 'تدقيق'}
          </Button>
          <Select defaultValue="translate">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الإجراء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translate">تدقيق لغوي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm text-right">
          {error}
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px) translateX(50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(50%);
          }
        }
      `}</style>
    </div>
  )
}
