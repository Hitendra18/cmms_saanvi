import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: React.ReactNode;
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function MainLayout({ children, lastUpdated, isRefreshing, onRefresh }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav 
        lastUpdated={lastUpdated} 
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      <main className="p-6 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
