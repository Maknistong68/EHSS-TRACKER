'use client';

import AppShell from '@/components/layout/app-shell';
import { ProjectProvider } from '@/components/shared/project-selector';
import { ToastProvider } from '@/components/shared/toast';
import ErrorBoundary from '@/components/shared/error-boundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <ProjectProvider>
          <AppShell>{children}</AppShell>
        </ProjectProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
