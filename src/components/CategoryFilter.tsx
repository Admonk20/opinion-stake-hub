import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (value: string) => void;
}

export const CategoryFilter = ({ categories, selected, onChange }: CategoryFilterProps) => {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.slug}>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};