import { CollectionBeforeChangeHook } from 'payload';
import { GoogleGenAI } from '@google/genai';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const extractAiKnowledgeHook: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  if (operation === 'create' || operation === 'update') {
    // Check if there is an uploaded file
    const file = req.file;

    // Set uploadedBy automatically if it's empty and user is logged in
    if (!data.uploadedBy && req.user) {
      data.uploadedBy = req.user.id;
    }

    if (file && file.data) {
      // If content is already provided and not empty, maybe we don't want to overwrite it.
      // But usually, if they upload a new file, we want to extract it.
      // We will extract unless they explicitly passed some content and didn't change the file.
      // Actually, since it's an upload hook, the file is in req.file. 
      // If it's an update and no new file is uploaded, req.file is undefined.
      
      const payload = await getPayload({ config: configPromise });
      const apiKeys = await payload.find({ 
        collection: 'api-keys', 
        where: { provider: { equals: 'gemini' }, isActive: { equals: true } }, 
        limit: 1 
      });

      if (apiKeys.docs.length === 0) {
        throw new Error('Không có cấu hình Gemini API Key đang kích hoạt để phân tích file.');
      }

      const apiKeyObj = apiKeys.docs[0];
      const apiKey = apiKeyObj.apiKey;
      const model = data.extractionModel || 'gemini-2.5-flash';

      try {
        const ai = new GoogleGenAI({ apiKey });
        const base64Data = file.data.toString('base64');
        const mimeType = file.mimetype;

        const systemInstruction = "Bạn là chuyên gia số hóa tài liệu. Nhiệm vụ của bạn là đọc file đính kèm và trích xuất toàn bộ nội dung văn bản, số liệu, bảng biểu ra định dạng Markdown chuẩn xác. Nếu là bảng biểu, hãy dùng cú pháp Markdown table. Loại bỏ các header/footer thừa nếu có. Giữ nguyên tối đa các thông tin quan trọng.";
        
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: "Hãy đọc tài liệu này và trích xuất văn bản sang Markdown." }
              ]
            }
          ],
          config: { 
            systemInstruction, 
            temperature: 0.1 // Low temperature for extraction
          }
        });

        // Update token usage
        const usedTokens = response.usageMetadata?.totalTokenCount || 0;
        if (usedTokens > 0) {
          payload.update({
            collection: 'api-keys',
            id: apiKeyObj.id as string,
            data: { 
              usageTokens: ((apiKeyObj.usageTokens as number) || 0) + usedTokens, 
              usageCount: ((apiKeyObj.usageCount as number) || 0) + 1 
            }
          }).catch(e => console.error("[Token Update Error]", e));
        }

        let extractedText = response.text || "";
        if (extractedText.trim().length > 0) {
          data.content = extractedText.trim();
        } else {
          throw new Error('AI không thể đọc được nội dung từ file này.');
        }

      } catch (err: any) {
        console.error("Lỗi khi trích xuất file với AI:", err);
        throw new Error('Lỗi khi xử lý file bằng AI: ' + err.message);
      }
    }
  }

  return data;
};
