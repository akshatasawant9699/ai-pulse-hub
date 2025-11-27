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
    const { timeFilter = "1d", query = "" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Aggregating AI news with filter:", timeFilter, "query:", query);

    // Create a comprehensive prompt for Gemini to fetch and analyze AI news
    const systemPrompt = `You are an AI news aggregator specialized in finding the latest developments in artificial intelligence, machine learning, and related technologies. Your task is to provide curated, relevant, and up-to-date information about AI.

Return a JSON array of news items with this exact structure:
[
  {
    "title": "Article title",
    "source": "Source name",
    "date": "Relative time (e.g., '2 hours ago')",
    "excerpt": "Brief summary (1-2 sentences)",
    "url": "https://example.com/article",
    "category": "One of: Models, Research, Policy, Enterprise, Tools, Applications"
  }
]

Focus on:
- Latest AI model releases and updates
- Research breakthroughs and papers
- AI tools and applications
- Industry news and enterprise adoption
- AI policy and regulation
- Technical blogs and tutorials
- AI conferences and events`;

    let userPrompt = "";
    
    if (timeFilter === "1h") {
      userPrompt = "Find the most recent AI news and updates from the last hour.";
    } else if (timeFilter === "1d") {
      userPrompt = "Find today's most important AI news, updates, and developments.";
    } else if (timeFilter === "1m") {
      userPrompt = "Find the most significant AI news and developments from the past month.";
    } else if (timeFilter === "trends") {
      userPrompt = "Find the trending AI topics, viral discussions, and most talked-about developments right now.";
    }

    if (query) {
      userPrompt += ` Filter results to focus on: ${query}`;
    }

    userPrompt += "\n\nProvide at least 8-10 diverse, high-quality news items. Return ONLY valid JSON, no additional text.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON response
    let newsItems;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      newsItems = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a fallback structure
      newsItems = [{
        title: "Unable to fetch news at this time",
        source: "System",
        date: "now",
        excerpt: "Please try again in a moment.",
        url: "#",
        category: "System"
      }];
    }

    return new Response(JSON.stringify({ news: newsItems }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in aggregate-ai-news:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to aggregate news";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
