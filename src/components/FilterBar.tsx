import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, TrendingUp, Calendar, Search } from "lucide-react";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterBar = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) => {
  const filters = [
    { id: "1h", label: "Last Hour", icon: Clock },
    { id: "1d", label: "Last Day", icon: Calendar },
    { id: "1m", label: "Last Month", icon: Calendar },
    { id: "trends", label: "Trending", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search AI news, blogs, videos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className="gap-2"
            >
              <Icon className="h-3 w-3" />
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
