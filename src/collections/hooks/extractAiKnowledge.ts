import { CollectionBeforeChangeHook } from 'payload';
import { GoogleGenAI } from '@google/genai';
import configPromise from '../../payload.config.ts';
import { getPayload } from 'payload';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

export const extractAiKnowledgeHook: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  if (operation === 'create' || operation === 'update') {
    // Check if there is an uploaded file
    const file = req.file;

    // Set uploadedBy automatically if it's empty and user is logged in
    if (!data.uploadedBy && req.user) {
      data.uploadedBy = req.user.id;
    }

    if (file && file.data) {
      
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

        let parts: any[] = [];

        if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          // Parse XLSX
          const workbook = xlsx.read(file.data);
          let extractedText = '';
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            extractedText += `Sheet: ${sheetName}\n`;
            extractedText += xlsx.utils.sheet_to_csv(sheet) + '\n\n';
          }
          parts = [
            { text: "Đây là dữ liệu file Excel đã được trích xuất thành định dạng CSV:\n\n" + extractedText },
            { text: "Hãy đọc dữ liệu trên và trích xuất, tóm tắt thông tin quan trọng sang Markdown. Định dạng lại thành bảng Markdown nếu phù hợp." }
          ];
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Parse DOCX
          const result = await mammoth.extractRawText({ buffer: file.data });
          parts = [
            { text: "Đây là nội dung file Word:\n\n" + result.value },
            { text: "Hãy đọc nội dung trên và định dạng lại cấu trúc sang chuẩn Markdown." }
          ];
        } else {
          // Pass native inlineData to Gemini for PDF, images, etc.
          parts = [
            { inlineData: { data: base64Data, mimeType } },
            { text: "Hãy đọc tài liệu này và trích xuất văn bản sang Markdown." }
          ];
        }

        const systemInstruction = "Bạn là chuyên gia số hóa tài liệu. Nhiệm vụ của bạn là đọc file đính kèm và trích xuất toàn bộ nội dung văn bản, số liệu, bảng biểu ra định dạng Markdown chuẩn xác. Nếu là bảng biểu, hãy dùng cú pháp Markdown table. Loại bỏ các header/footer thừa nếu có. Giữ nguyên tối đa các thông tin quan trọng.";
        
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              role: "user",
              parts: parts
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
