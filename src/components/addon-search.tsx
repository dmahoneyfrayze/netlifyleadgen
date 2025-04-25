import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddonSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AddonSearch({ searchQuery, setSearchQuery }: AddonSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search add-ons..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 w-full sm:w-[250px]"
      />
    </div>
  );
}