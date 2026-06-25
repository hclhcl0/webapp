import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");
  const provider = searchParams.get("provider");

  if (!apiKey || !provider) {
    return NextResponse.json({ success: false, error: "Thiếu apiKey hoặc provider" }, { status: 400 });
  }

  try {
    let supportedModels: string[] = [];

    if (provider === "gemini") {
      const ai = new GoogleGenAI({ apiKey });
      // Call models.list()
      const response = await ai.models.list();
      
      // The new genai SDK returns an iterable or array
      const models = [];
      for await (const model of response) {
         models.push(model.name);
      }
      
      // Lọc các model thông dụng
      supportedModels = models
        .map((m: string) => m.replace("models/", ""))
        .filter((m: string) => {
          // Chỉ lấy các model chính, bỏ qua các version cũ hoặc label thử nghiệm nếu không cần thiết
          return m.includes("gemini") && !m.includes("vision") && !m.includes("-001") && !m.includes("-002");
        });
        
    } else if (provider === "groq") {
      const groq = new Groq({ apiKey });
      const response = await groq.models.list();
      
      supportedModels = response.data.map((m: any) => m.id);
    } else {
      return NextResponse.json({ success: false, error: "Provider không hợp lệ" }, { status: 400 });
    }

    if (supportedModels.length === 0) {
       return NextResponse.json({ success: false, error: "API Key hoạt động nhưng không tìm thấy mô hình nào khả dụng." });
    }

    return NextResponse.json({
      success: true,
      models: supportedModels
    });

  } catch (error: any) {
    console.error("Lỗi khi check API Key:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Lỗi kết nối đến nhà cung cấp AI"
    });
  }
}
