import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Create a dummy text file
fs.writeFileSync("test.txt", "Hello Gemini");

const ai = new GoogleGenAI({ apiKey: "DUMMY_KEY" });
console.log("ai.files methods:", Object.keys(ai.files));
console.log("ai.models methods:", Object.keys(ai.models));
