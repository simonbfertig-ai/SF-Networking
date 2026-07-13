export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured in Vercel." });
  }

  const { preset = "interview-prep", customPrompt = "", company = {} } = req.body || {};

  const prompt = `
You are an assistant inside a networking CRM.

Task: ${preset}
Extra instructions:
${customPrompt}

Company data:
${JSON.stringify(company, null, 2)}

Do not invent facts. If information is missing, say so.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed."
      });
    }

    const text =
      data.output_text ||
      (data.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text || "")
        .join("\\n");

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "AI request failed." });
  }
}
