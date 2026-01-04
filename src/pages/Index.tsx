import { MainLayout } from "@/components/layout/MainLayout";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { BusTable } from "@/components/dashboard/BusTable";
import { BusDetailView } from "@/components/dashboard/BusDetailView";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ExportMenu } from "@/components/dashboard/ExportMenu";
import { useFleetData } from "@/hooks/useFleetData";
import { Loader2 } from "lucide-react";

const Index = () => {
  const {
    data,
    loading,
    isRefreshing,
    stats,
    selectedBus,
    setSelectedBus,
    getBusHealth,
    filteredBuses,
    dateRange,
    setDateRange,
    lastRefresh,
    refresh,
  } = useFleetData();

  if (loading || !stats || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading fleet data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      lastUpdated={lastRefresh.toLocaleTimeString()}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
    >
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fleet Operations Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Managing {stats.totalBuses} buses across all depots
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onStartDateChange={(date) => setDateRange({ ...dateRange, start: date })}
              onEndDateChange={(date) => setDateRange({ ...dateRange, end: date })}
              onClear={() => setDateRange({ start: undefined, end: undefined })}
            />
            <ExportMenu buses={filteredBuses} stats={stats} />
          </div>
        </div>

        <SummaryCards stats={stats} />
        <AnalyticsSection stats={stats} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Bus Fleet Overview</h2>
          <BusTable
            buses={filteredBuses}
            onSelectBus={setSelectedBus}
            getBusHealth={getBusHealth}
          />
        </div>
      </div>

      {selectedBus && (
        <BusDetailView bus={selectedBus} onClose={() => setSelectedBus(null)} />
      )}
    </MainLayout>
  );
};

export default Index;
