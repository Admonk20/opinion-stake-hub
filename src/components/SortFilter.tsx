import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortFilter = ({ value, onChange }: SortFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="volume">24hr Volume</SelectItem>
        <SelectItem value="created_at">Newest</SelectItem>
        <SelectItem value="end_date">Ending Soon</SelectItem>
      </SelectContent>
    </Select>
  );
};