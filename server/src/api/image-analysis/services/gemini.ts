
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// export const analyzeImage = async (filePath: string)=> {

//     try {
        
//  const base64ImageFile = fs.readFileSync(filePath, {
//   encoding: "base64",
// });

// const contents = [
//     {
//         inlineData: {
//         mimeType: "image/jpeg",
//         data: base64ImageFile,
//     },
// },
// {text: "Extract the food name and estimated calories from this image in a JSON object."},
// ];

// const config = {
//     responseMimeType: "application/json",
//     responseJsonSchema: {
//         type: "object",
//         properties: {
//             name: {type: "string"},
//             calories: {type: "number"},
//         }
//     }
// }

// const response = await ai.models.generateContent({model: "gemini-3.8-flash",
//     contents: contents,
//     config
// });

// // response.text should be valied JSON matching the schema  

// return JSON.parse(response.text)


// } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }


export const analyzeImage = async (filePath: string) => {
    const base64ImageFile = fs.readFileSync(filePath, {
        encoding: "base64",
    });

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
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents,
                config,
            });

            return JSON.parse(response.text);

        } catch (error: any) {

            const status = error?.status;

            if (status === 503 && attempt < maxAttempts) {
                const delay = attempt * 2000;

                console.log(
                    `Gemini temporarily unavailable. Retrying in ${delay / 1000}s...`
                );

                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error("Gemini analysis failed:", error);
            throw error;
        }
    }

    throw new Error("Gemini analysis failed after multiple attempts");
};