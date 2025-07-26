import cors from "@fastify/cors";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";

import Fastify from "fastify";

dotenv.config();

// eslint-disable-next-line node/prefer-global/process
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});

interface AskGeminiBody {
  url: string;
}

const askGeminiSchema = {
  body: {
    type: "object",
    required: ["url"],
    properties: {
      url: { type: "string" },
    },
  },
};

function extractCommentsRecursively(commentList: any[], result: string[] = []): string[] {
  for (const item of commentList) {
    if (item.kind === "t1") {
      const body = item.data.body;
      if (body)
        result.push(body);

      // Recursive call for replies (if not empty string)
      const replies = item.data.replies;
      if (replies && typeof replies === "object") {
        extractCommentsRecursively(replies.data.children, result);
      }
    }
  }
  return result;
}

fastify.post<{ Body: AskGeminiBody }>("/ask-gemini", { schema: askGeminiSchema }, async (request, reply) => {
  try {
    let { url } = request.body;

    if (!url.endsWith(".json")) {
      if (url.endsWith("/"))
        url += ".json";
      else url += "/.json";
    }

    const response = await axios(url, {
      headers: {
        "User-Agent": "RedditScraper/1.0",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const json = await response.data;

    // Extract post text (from data[0])
    const postTitle = json[0].data.children[0].data.title;
    const postBody = json[0].data.children[0].data.selftext;

    // Extract comment texts (from data[1])
    const commentsRaw = json[1].data.children;
    const commentTexts = extractCommentsRecursively(commentsRaw);

    // reply.send({
    //   postTitle,
    //   postBody,
    //   commentTexts
    // });

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: `
        This is a post titled "${postTitle}":
        ${postBody}
        
        Here are the comments:
        ${commentTexts.join("\n")}

        List out apps with app names and descriptions. Also include links if given.
      `,
    });
    reply.send(geminiResponse.text);
  }
  catch (error) {
    reply.code(500).send({ error: "Failed to contact Gemini API", details: error.message });
  }
});

// Run the server!
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1);
  }
  // Server is now listening on ${address}
});
