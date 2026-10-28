import type { CollectionBeforeChangeHook } from 'payload';
import { GoogleGenAI } from '@google/genai';
import configPromise from '../../payload.config.ts';
import { getPayload } from 'payload';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

export const extractAiKnowledgeHook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create' || operation === 'update') {
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
        limit: 50,
      });

      const keyDocs = apiKeys.docs.filter((d: any) => Boolean(d.apiKey));
      if (keyDocs.length === 0) {
        throw new Error('Không có cấu hình Gemini API Key đang kích hoạt để phân tích file.');
      }

      const model = data.extractionModel || 'gemini-2.5-flash';
      const base64Data = file.data.toString('base64');
      const mimeType = file.mimetype;

      let parts: any[] = [];

      if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
        const result = await mammoth.extractRawText({ buffer: file.data });
        parts = [
          { text: "Đây là nội dung file Word:\n\n" + result.value },
          { text: "Hãy đọc nội dung trên và định dạng lại cấu trúc sang chuẩn Markdown." }
        ];
      } else {
        parts = [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Hãy đọc tài liệu này và trích xuất văn bản sang Markdown." }
        ];
      }

      const systemInstruction = "Bạn là chuyên gia số hóa tài liệu. Nhiệm vụ của bạn là đọc file đính kèm và trích xuất toàn bộ nội dung văn bản, số liệu, bảng biểu ra định dạng Markdown chuẩn xác. Nếu là bảng biểu, hãy dùng cú pháp Markdown table. Loại bỏ các header/footer thừa nếu có. Giữ nguyên tối đa các thông tin quan trọng.";

      let lastErr: any = null;
      let extractedSuccess = false;

      // Xoay vòng qua toàn bộ danh sách API Key đang hoạt động để tự động dự phòng (Failover) khi 1 key hết hạn mức
      for (let i = 0; i < keyDocs.length; i++) {
        const apiKeyObj = keyDocs[i] as any;
        const apiKey = apiKeyObj.apiKey as string;

        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction,
              temperature: 0.1,
            },
          });

          const usedTokens = response.usageMetadata?.totalTokenCount || 0;
          if (usedTokens > 0) {
            payload.update({
              collection: 'api-keys',
              id: apiKeyObj.id as string,
              data: {
                usageTokens: ((apiKeyObj.usageTokens as number) || 0) + usedTokens,
                usageCount: ((apiKeyObj.usageCount as number) || 0) + 1,
              },
            }).catch(e => console.error('[Token Update Error]', e));
          }

          const extractedText = response.text || '';
          if (extractedText.trim().length > 0) {
            data.content = extractedText.trim();
            extractedSuccess = true;
            break;
          } else {
            lastErr = new Error('AI không thể đọc được nội dung từ file này.');
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`[extractAiKnowledge] Key #${i + 1} (${apiKey.slice(0, 6)}...) gặp lỗi: ${err.message}. Đang thử key tiếp theo...`);
        }
      }

      if (!extractedSuccess) {
        console.error('Lỗi khi trích xuất file với toàn bộ AI Keys:', lastErr);
        throw new Error('Lỗi khi xử lý file bằng AI: ' + (lastErr?.message || 'Không xác định'));
      }
    }
  }

  return data;
};
