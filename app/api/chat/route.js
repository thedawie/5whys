import { generateText } from "ai";
import { ollama } from "ollama-ai-provider";

export async function POST(req) {
  const { messages } = await req.json();

  const model = ollama("llama3.2");
  console.log(messages);

  const { response } = await generateText({
    model: model,
    system: `Based on the ask 5 whys when you are querying what you want to achieve what you want todo so you can understand it.
     Every question I ask, try query why i want to to do what I want todo.`,
    messages: messages,
  });

  return Response.json({ messages: response.messages });
}
