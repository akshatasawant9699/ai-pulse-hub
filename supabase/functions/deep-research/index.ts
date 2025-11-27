import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, context = "" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting deep research on topic:", topic);

    const systemPrompt = `You are an AI research assistant with expertise in artificial intelligence, machine learning, and technology. Your task is to provide comprehensive, well-researched analysis on AI-related topics.

Provide your analysis in the following structure:
{
  "summary": "A comprehensive 2-3 paragraph summary of the topic",
  "keyPoints": ["Array of 5-7 key insights or findings"],
  "technicalDetails": "Detailed technical explanation (2-3 paragraphs)",
  "implications": "Analysis of implications for developers, businesses, and the industry",
  "resources": [
    {
      "title": "Resource title",
      "type": "One of: paper, blog, video, documentation, tutorial",
      "description": "Brief description",
      "url": "URL if available or '#' if not"
    }
  ],
  "caseStudies": [
    {
      "title": "Case study title",
      "description": "What this case study demonstrates",
      "outcome": "Key results or learnings"
    }
  ],
  "contentIdeas": {
    "blogPost": "Suggested blog post outline",
    "videoScript": "Suggested video topic and key points",
    "socialPosts": ["3 ready-to-use social media post ideas"],
    "cfpIdeas": ["2-3 conference talk proposals"]
  }
}`;

    const userPrompt = `Conduct deep research on: ${topic}

${context ? `Additional context: ${context}` : ""}

Provide comprehensive analysis including technical details, real-world applications, case studies, and actionable content creation ideas for a developer advocate. Return ONLY valid JSON, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("Deep research completed");

    // Parse the JSON response
    let research;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      research = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      research = {
        summary: aiResponse,
        keyPoints: [],
        technicalDetails: "",
        implications: "",
        resources: [],
        caseStudies: [],
        contentIdeas: {}
      };
    }

    return new Response(JSON.stringify({ research }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in deep-research:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to conduct research";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
