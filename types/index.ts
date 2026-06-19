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
