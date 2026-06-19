export type PlantillaCategoria = 'vertical' | 'horizontal' | 'graficas' | 'tablas' | 'otros';

export interface Project {
  id: string;
  userId: string;
  username: string;
  title: string;
  plantillaTipo: PlantillaCategoria;
  plantillaId: string;
  canvasData: object;
  thumbnailUrl: string;
  createdAt: any;
  updatedAt: any;
  isPublic: boolean;
}

export interface Plantilla {
  id: string;
  name: string;
  category: PlantillaCategoria;
  thumbnailUrl: string;
  defaultCanvasData: object;
  description: string;
  isPremium: boolean;
}

export type ToolType =
  | 'select'
  | 'text'
  | 'image'
  | 'shape-rect'
  | 'shape-circle'
  | 'shape-triangle'
  | 'shape-line'
  | 'shape-star'
  | 'chart'
  | 'table'
  | 'symbol'
  | 'video';

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
  formulas: string[][];
}

export interface CanvasObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  lineHeight?: number;
  underline?: boolean;
  borderRadius?: number;
  filter?: string;
}
