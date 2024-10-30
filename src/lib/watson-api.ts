export interface WatsonResponse {
  "الكلمة": string;
  "نوع الخطأ": string;
  "تصحيح الخطأ": string;
}

export class IBMWatsonAPI {
  async generateText(prompt: string): Promise<WatsonResponse> {
    const response = await fetch('/api/watson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate text');
    }

    const data = await response.json();
    return data.results[0].generated_text;
  }
}

export const watsonApi = new IBMWatsonAPI();
