'use client';
import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4 max-w-md">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold">Algo salió mal</h2>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()} variant="gradient">Reintentar</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
