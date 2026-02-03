import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  type: "email" | "proposal" | "followup";
  contactId?: string;
  dealId?: string;
  emailType?: string;
  tone?: string;
  followupReason?: string;
  daysSinceContact?: string;
  additionalContext?: string;
  keyPoints?: string;
}

interface Contact {
  name: string;
  email: string | null;
  company: string | null;
  position: string | null;
  notes: string | null;
  health_score: number | null;
}

interface Deal {
  name: string;
  value: number | null;
  stage: string;
  probability: number | null;
  notes: string | null;
}

function buildPrompt(
  type: string,
  contact: Contact | null,
  deal: Deal | null,
  params: GenerateRequest
): string {
  const contactContext = contact
    ? `Contact: ${contact.name}${contact.company ? ` at ${contact.company}` : ""}${contact.position ? ` (${contact.position})` : ""}. ${contact.notes ? `Notes: ${contact.notes}` : ""}`
    : "No specific contact selected.";

  const dealContext = deal
    ? `Deal: ${deal.name}, Value: $${deal.value?.toLocaleString() || 0}, Stage: ${deal.stage}, Win Probability: ${deal.probability || 0}%. ${deal.notes ? `Notes: ${deal.notes}` : ""}`
    : "";

  if (type === "email") {
    const emailTypes: Record<string, string> = {
      intro: "introduction email to establish a new business relationship",
      meeting: "meeting request email to schedule a call or meeting",
      proposal: "email presenting a business proposal",
      thanks: "thank you email expressing gratitude",
    };
    const tones: Record<string, string> = {
      professional: "professional and formal",
      friendly: "friendly and approachable",
      urgent: "urgent and action-oriented",
    };

    return `You are a professional sales copywriter. Write a ${emailTypes[params.emailType || "intro"]} with a ${tones[params.tone || "professional"]} tone.

${contactContext}

${params.additionalContext ? `Additional context: ${params.additionalContext}` : ""}

Generate a complete email with:
1. A compelling subject line
2. A personalized greeting
3. A clear body that addresses the purpose
4. A call to action
5. A professional signature placeholder

Keep it concise (under 200 words for the body).`;
  }

  if (type === "proposal") {
    return `You are a professional business proposal writer. Create a compelling proposal outline based on the following context.

${contactContext}
${dealContext}

${params.keyPoints ? `Key points to highlight: ${params.keyPoints}` : ""}

Generate a structured proposal that includes:
1. Executive Summary
2. Understanding of Client Needs
3. Proposed Solution
4. Key Benefits
5. Investment Summary
6. Next Steps
7. Timeline

Keep each section concise but impactful. Format with clear headings.`;
  }

  if (type === "followup") {
    const reasons: Record<string, string> = {
      "no-response": "following up on a previous email with no response",
      "after-meeting": "following up after a recent meeting",
      "check-in": "a general check-in to maintain the relationship",
      "proposal-sent": "following up on a proposal that was sent",
    };

    return `You are a professional sales copywriter. Write a ${reasons[params.followupReason || "check-in"]} email.

${contactContext}
${params.daysSinceContact ? `Days since last contact: ${params.daysSinceContact}` : ""}

Generate a follow-up email that:
1. References the previous interaction naturally
2. Provides value or a reason to respond
3. Has a clear but non-pushy call to action
4. Maintains professionalism while being personable

Keep it brief (under 150 words).`;
  }

  return "Generate professional business content.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body: GenerateRequest = await req.json();
    const { type, contactId, dealId } = body;

    // Fetch contact if provided
    let contact: Contact | null = null;
    if (contactId) {
      const { data } = await supabaseClient
        .from("contacts")
        .select("name, email, company, position, notes, health_score")
        .eq("id", contactId)
        .eq("user_id", user.id)
        .single();
      contact = data;
    }

    // Fetch deal if provided
    let deal: Deal | null = null;
    if (dealId) {
      const { data } = await supabaseClient
        .from("deals")
        .select("name, value, stage, probability, notes")
        .eq("id", dealId)
        .eq("user_id", user.id)
        .single();
      deal = data;
    }

    const prompt = buildPrompt(type, contact, deal, body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional business content writer specializing in sales and client communications. Always generate high-quality, personalized content.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content || "Failed to generate content.";

    // Save to ai_generations table
    await supabaseClient.from("ai_generations").insert({
      user_id: user.id,
      contact_id: contactId || null,
      generation_type: type,
      prompt: prompt.substring(0, 500),
      content: generatedContent,
    });

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
