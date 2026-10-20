
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey });

export const analyzeImage = async (filePath: string) => {
    const totalStartedAt = Date.now();

    try {
        const readStartedAt = Date.now();

        const base64ImageFile = fs.readFileSync(filePath, {
            encoding: "base64",
        });

        console.log(
            `[ImageAnalysis] Read + Base64: ${Date.now() - readStartedAt} ms`
        );

        console.log(
            `[ImageAnalysis] Image size: ${Math.round(
                (base64ImageFile.length * 3) / 4 / 1024
            )} KB`
        );

        const contents = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64ImageFile,
                },
            },
            {
                text: "Extract the food name and estimated calories from this image in a JSON object.",
            },
        ];

        const config = {
            responseMimeType: "application/json",
            responseJsonSchema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    calories: { type: "number" },
                },
                required: ["name", "calories"],
            },
        };

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const geminiStartedAt = Date.now();

            try {
                console.log(
                    `[ImageAnalysis] Gemini attempt ${attempt}/${maxAttempts} started`
                );

                const response = await ai.models.generateContent({
                    model: "gemini-3.8-flash",
                    contents,
                    config,
                });

                console.log(
                    `[ImageAnalysis] Gemini attempt ${attempt} completed: ${
                        Date.now() - geminiStartedAt
                    } ms`
                );

                const parseStartedAt = Date.now();
                const result = JSON.parse(response.text ?? "");

                console.log(
                    `[ImageAnalysis] JSON parsing: ${
                        Date.now() - parseStartedAt
                    } ms`
                );

                console.log(
                    `[ImageAnalysis] Total service time: ${
                        Date.now() - totalStartedAt
                    } ms`
                );

                return result;
            } catch (error: any) {
                const status = error?.status ?? error?.response?.status;

                console.error(
                    `[ImageAnalysis] Attempt ${attempt} failed after ${
                        Date.now() - geminiStartedAt
                    } ms. Status: ${status ?? "unknown"}`
                );

                if (status === 503 && attempt < maxAttempts) {
                    const delay = attempt * 2000;

                    console.log(
                        `[ImageAnalysis] Retrying in ${delay / 1000}s`
                    );

                    await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                    );

                    continue;
                }

                throw error;
            }
        }

        throw new Error("Gemini analysis failed after multiple attempts");
    } catch (error) {
        console.error(
            `[ImageAnalysis] Request failed after ${
                Date.now() - totalStartedAt
            } ms`
        );

        throw error;
    }
};
