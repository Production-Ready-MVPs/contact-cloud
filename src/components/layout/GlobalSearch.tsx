import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, DollarSign, CheckSquare, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  id: string;
  type: "contact" | "deal" | "task";
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search across all entities
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["global-search", query, user?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!user?.id || query.length < 2) return [];

      const searchTerm = `%${query}%`;

      // Parallel search across all tables
      const [contactsRes, dealsRes, tasksRes] = await Promise.all([
        supabase
          .from("contacts")
          .select("id, name, email, company")
          .eq("user_id", user.id)
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("deals")
          .select("id, name, value, stage")
          .eq("user_id", user.id)
          .ilike("name", searchTerm)
          .limit(5),
        supabase
          .from("tasks")
          .select("id, title, status, priority")
          .eq("user_id", user.id)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
      ]);

      const searchResults: SearchResult[] = [];

      // Map contacts
      (contactsRes.data || []).forEach((contact) => {
        searchResults.push({
          id: contact.id,
          type: "contact",
          title: contact.name,
          subtitle: contact.email || contact.company || undefined,
        });
      });

      // Map deals
      (dealsRes.data || []).forEach((deal) => {
        searchResults.push({
          id: deal.id,
          type: "deal",
          title: deal.name,
          subtitle: deal.value ? `$${deal.value.toLocaleString()} • ${deal.stage}` : deal.stage,
        });
      });

      // Map tasks
      (tasksRes.data || []).forEach((task) => {
        searchResults.push({
          id: task.id,
          type: "task",
          title: task.title,
          subtitle: `${task.status} • ${task.priority} priority`,
        });
      });

      return searchResults;
    },
    enabled: query.length >= 2 && !!user?.id,
    staleTime: 1000,
  });

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    
    switch (result.type) {
      case "contact":
        navigate("/contacts", { state: { highlightId: result.id } });
        break;
      case "deal":
        navigate("/deals", { state: { highlightId: result.id } });
        break;
      case "task":
        navigate("/tasks", { state: { highlightId: result.id } });
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <User className="h-4 w-4 text-blue-500" />;
      case "deal":
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "contact":
        return "default";
      case "deal":
        return "secondary";
      case "task":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts, deals, tasks..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-9 pr-8 h-9"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-lg z-50">
          <ScrollArea className="max-h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <Badge variant={getBadgeVariant(result.type)} className="capitalize text-xs">
                      {result.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
