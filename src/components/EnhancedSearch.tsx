import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Calendar as CalendarIcon, DollarSign, X } from "lucide-react";
import { format } from "date-fns";
import { formatTZEE } from "@/lib/currency";

interface EnhancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFiltersChange: (filters: any) => void;
}

export const EnhancedSearch = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onFiltersChange,
}: EnhancedSearchProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [volumeRange, setVolumeRange] = useState([0]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    onFiltersChange({
      dateRange: range,
      volumeRange: volumeRange[0],
    });
    
    if (range.from || range.to) {
      if (!activeFilters.includes('date')) {
        setActiveFilters([...activeFilters, 'date']);
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== 'date'));
    }
  };

  const handleVolumeRangeChange = (value: number[]) => {
    setVolumeRange(value);
    onFiltersChange({
      dateRange,
      volumeRange: value[0],
    });

    if (value[0] > 0) {
      if (!activeFilters.includes('volume')) {
        setActiveFilters([...activeFilters, 'volume']);
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== 'volume'));
    }
  };

  const clearFilters = () => {
    setDateRange({});
    setVolumeRange([0]);
    setActiveFilters([]);
    onFiltersChange({
      dateRange: {},
      volumeRange: 0,
    });
  };

  const removeFilter = (filterType: string) => {
    if (filterType === 'date') {
      setDateRange({});
    } else if (filterType === 'volume') {
      setVolumeRange([0]);
    }
    setActiveFilters(activeFilters.filter(f => f !== filterType));
    onFiltersChange({
      dateRange: filterType === 'date' ? {} : dateRange,
      volumeRange: filterType === 'volume' ? 0 : volumeRange[0],
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search markets, questions, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-start">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Latest</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="end_date">Ending Soon</SelectItem>
              <SelectItem value="activity">Most Active</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter === 'date' && (
                <>
                  <CalendarIcon className="h-3 w-3" />
                  Date Range
                </>
              )}
              {filter === 'volume' && (
                <>
                  <DollarSign className="h-3 w-3" />
                  Min Volume: {formatTZEE(volumeRange[0])}
                </>
              )}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isFiltersOpen && (
        <div className="border rounded-lg p-6 bg-card space-y-6">
          <h3 className="font-semibold">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? format(dateRange.from, "MMM d") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => handleDateRangeChange({ ...dateRange, from: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.to ? format(dateRange.to, "MMM d") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => handleDateRangeChange({ ...dateRange, to: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Volume Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Volume: {formatTZEE(volumeRange[0])}
              </label>
              <Slider
                value={volumeRange}
                onValueChange={handleVolumeRangeChange}
                max={100000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTZEE(0)}</span>
                <span>{`${formatTZEE(100000)}+`}</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeChange({
                  from: new Date(),
                  to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })}
              >
                Ending This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeChange({
                  from: new Date(),
                  to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                })}
              >
                Ending This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVolumeRangeChange([10000])}
              >
                High Volume ({`${formatTZEE(10000)}+`})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVolumeRangeChange([50000])}
              >
                Very High Volume ({`${formatTZEE(50000)}+`})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};