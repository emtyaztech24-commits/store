import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!apiKey) return "الرجاء تكوين مفتاح API للحصول على وصف ذكي.";

  try {
    const prompt = `
      اكتب وصفاً تسويقياً جذاباً ومختصراً باللغة العربية لمنتج بالاسم التالي: "${productName}"
      يقع ضمن تصنيف: "${category}".
      اجعل الوصف مشوقاً ويبرز المميزات في حدود 30 كلمة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "لا يمكن توليد الوصف حالياً.";
  }
};