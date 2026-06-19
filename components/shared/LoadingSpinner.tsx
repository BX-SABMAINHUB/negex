export const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse">Cargando Negex...</p>
    </div>
  </div>
);
