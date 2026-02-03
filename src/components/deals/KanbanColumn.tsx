import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus } from "lucide-react";
import { DealCard } from "./DealCard";
import type { DealWithContact, DealStage } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface KanbanColumnProps {
  stage: {
    id: DealStage;
    title: string;
    color: string;
  };
  deals: DealWithContact[];
  onAddDeal: (stage: DealStage) => void;
  onEditDeal: (deal: DealWithContact) => void;
  onDeleteDeal: (deal: DealWithContact) => void;
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function KanbanColumn({
  stage,
  deals,
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
  isLoading,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  
  const stageTotal = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const dealIds = deals.map((deal) => deal.id);

  if (isLoading) {
    return (
      <div className="flex-shrink-0 w-[300px]">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-[300px]">
      <Card
        ref={setNodeRef}
        className={`h-full transition-colors ${
          isOver ? "ring-2 ring-primary bg-accent/30" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${stage.color}`} />
              <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
              <Badge variant="secondary" className="ml-1">
                {deals.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddDeal(stage.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(stageTotal)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[200px]">
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onEdit={onEditDeal}
                onDelete={onDeleteDeal}
              />
            ))}
          </SortableContext>
          {deals.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No deals in this stage
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
