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
