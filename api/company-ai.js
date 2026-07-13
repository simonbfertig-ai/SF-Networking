export async function GET() {
  return Response.json({
    ok: true,
    message: "Simon Networking AI backend is working."
  });
}

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing in Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      preset = "custom",
      customPrompt = "",
      company = {}
    } = body;

    const instructions = {
      "interview-prep":
        "Create interview preparation using the supplied company information. Include a company summary, talking points, questions to ask, and missing information that should be researched.",

      "questions":
        "Create 10 thoughtful and specific questions to ask about this company during an interview or networking call.",

      "summary":
        "Summarize the company information and notes in a clear and organized format.",

      "talking-points":
        "Create useful talking points for a networking call or interview.",

      "follow-up":
        "Draft a concise and professional follow-up email.",

      "custom":
        "Follow the user's custom request using the supplied company information."
    };

    const task = instructions[preset] || instructions.custom;

    const prompt = `
You are an AI assistant inside a networking and recruiting CRM.

Task:
${task}

Extra instructions:
${customPrompt || "None"}

Company information:
${JSON.stringify(company, null, 2)}

Rules:
- Do not invent facts.
- Clearly state when information is missing.
- Keep the response organized and practical.
`;

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: prompt
        })
      }
    );

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "OpenAI returned an error."
        },
        { status: openAIResponse.status }
      );
    }

    const text =
      data.output_text ||
      (data.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text || "")
        .join("\n")
        .trim();

    return Response.json({
      text: text || "No AI response was returned."
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message || "The AI request failed."
      },
      { status: 500 }
    );
  }
}
