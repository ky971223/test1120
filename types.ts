export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectionObject {
  label: string;
  confidence: number;
  box_2d: BoundingBox;
}

export type MediaType = 'image' | 'video' | null;

export interface AnalysisResult {
  objects: DetectionObject[];
  timestamp: number;
}