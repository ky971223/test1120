import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DetectionObject } from "../types";

// Initialize Gemini Client
// Note: In a production environment, API calls should ideally be proxied through a backend
// to protect the API key. For this demo, we use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const detectionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: {
        type: Type.STRING,
        description: "The name of the detected object class in Simplified Chinese (e.g., '人', '汽车', '狗').",
      },
      confidence: {
        type: Type.NUMBER,
        description: "Confidence score between 0.0 and 1.0.",
      },
      box_2d: {
        type: Type.OBJECT,
        description: "Bounding box coordinates normalized to 1000x1000 scale.",
        properties: {
          ymin: { type: Type.NUMBER, description: "Top coordinate (0-1000)" },
          xmin: { type: Type.NUMBER, description: "Left coordinate (0-1000)" },
          ymax: { type: Type.NUMBER, description: "Bottom coordinate (0-1000)" },
          xmax: { type: Type.NUMBER, description: "Right coordinate (0-1000)" },
        },
        required: ["ymin", "xmin", "ymax", "xmax"],
      },
    },
    required: ["label", "confidence", "box_2d"],
  },
};

/**
 * Detects objects in a base64 image string.
 * Simulates YOLO-style output using Gemini 2.5 Flash.
 */
export const detectObjectsInImage = async (base64Image: string): Promise<DetectionObject[]> => {
  try {
    // Clean base64 string if it has a header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const modelId = "gemini-2.5-flash"; // Flash is faster and excellent for object detection tasks

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "检测图片中的所有相关物体。为每个物体提供边界框。坐标必须精准。请用简体中文（Simplified Chinese）返回物体名称（标签）。识别人物、车辆、动物以及常见的街道或生活物品。",
          },
        ],
      },
      config: {
        systemInstruction: "你是一个类似于 YOLOv8 的高级目标检测引擎。你的目标是返回所有可见物体的精确边界框。坐标归一化到 0-1000 范围。返回的 label 必须使用简体中文。",
        responseMimeType: "application/json",
        responseSchema: detectionSchema,
        temperature: 0.2, // Low temperature for more deterministic/factual detection
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const data = JSON.parse(jsonText) as DetectionObject[];
    return data;

  } catch (error) {
    console.error("Object detection failed:", error);
    throw error;
  }
};