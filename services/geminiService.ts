
import { API_URL } from './api';

export const generateMemoryMessage = async (
  occasion: string,
  recipient: string,
  sender: string,
  tone: string,
  details: string
): Promise<string> => {
  
  const prompt = `
    Write a heartfelt, personal message for a digital memory page.
    Occasion: ${occasion}
    Recipient: ${recipient}
    From: ${sender}
    Tone: ${tone}
    Key Memories/Details to include: ${details}
    
    Keep it under 150 words. Format with paragraphs if needed, but return plain text.
  `;

  try {
    // Call our backend instead of Google directly
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for auth cookies if this route is protected
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error("Failed to generate message via backend");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Could not generate message at this time. Please try again later.";
  }
};
