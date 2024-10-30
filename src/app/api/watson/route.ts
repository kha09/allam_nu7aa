import { NextResponse } from 'next/server';

async function getAccessToken() {
  const apiKey = process.env.IBM_WATSONX_API_KEY;
  const tokenUrl = "https://iam.cloud.ibm.com/identity/token";
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const data = new URLSearchParams({
    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
    "apikey": apiKey || ''
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: data
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain access token: ${response.statusText}`);
  }

  const responseJson = await response.json();
  if (!responseJson.access_token) {
    throw new Error("Access token not found in response");
  }

  return responseJson.access_token;
}

async function generateText(prompt: string, accessToken: string) {
  const projectId = process.env.IBM_WATSONX_PROJECT_ID;
  const url = "https://eu-de.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";
  const modelId = "sdaia/allam-1-13b-instruct";
  const fixedPrompt = process.env.FIXED_PROMPT || "You are an AI assistant that helps with writing and grammar. Please analyze and improve the following text: ";

  // Combine fixed prompt with user input
  const fullPrompt = `${fixedPrompt}${prompt}`;

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  };

  const body = {
    "input": `<s> [INST] ${fullPrompt} [/INST]`,
    "parameters": {
      "decoding_method": "greedy",
      "max_new_tokens": 400,
      "temperature": 0.7
    },
    "model_id": modelId,
    "project_id": projectId
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const result = await generateText(prompt, accessToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}