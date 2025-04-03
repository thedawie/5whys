import { generateText } from "ai";
import { ollama } from "ollama-ai-provider";

export async function POST(req) {
  const { questions } = await req.json();

  const model = ollama("llama3.2");
  console.log("Questions :" + questions);

  const summary = `Generate me a summary of the idea that are in these messages: ${questions}`

  console.log(summary);
  // const { response } = await generateText({
  //   model: model,
  //   prompt: summary,
  // });

  const { text, finishReason, usage } = await generateText({
    model: model,
    prompt: summary,
  });

  console.log("text: " +text);
  console.log("reason: " +finishReason);
  console.log("usage: " +usage);
  console.log("completed transaction");
  return Response.json({ summary: text });
}
