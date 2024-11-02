'use client'

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { type WatsonResponse } from "@/lib/watson-api"

interface ErrorDisplayProps {
  corrections: WatsonResponse
}

export function ErrorDisplay({ corrections }: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-md border-2 rounded-xl shadow-sm" dir="rtl">
      <CardHeader className="border-b border-gray-100">
        <h2 className="text-xl font-semibold text-center text-gray-800">الأخطاء و الملاحظات</h2>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {corrections.map((correction, index) => (
          <div key={index} className="py-2 border-b border-gray-100 last:border-b-0">
            <p className="text-gray-500 text-sm mb-1">{correction['نوع الخطأ'] || correction['نوع_الخطأ']}</p>
            <div className="flex items-center gap-2 text-lg">
              <span className="text-red-500 font-bold">{correction['الكلمة الخاطئة'] || correction['خطأ']}</span>
              <span className="text-gray-400">◄</span>
              <span className="text-blue-500">{correction['تصحيح الكلمة'] || correction['تصحيح_الكلمة']}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
