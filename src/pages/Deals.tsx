import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/deals/KanbanColumn";
import { DealCard } from "@/components/deals/DealCard";
import { DealDialog } from "@/components/deals/DealDialog";
import { DeleteDealDialog } from "@/components/deals/DeleteDealDialog";
import { useDeals, useCreateDeal, useUpdateDeal, useUpdateDealStage, useDeleteDeal } from "@/hooks/useDeals";
import type { DealWithContact, DealStage } from "@/hooks/useDeals";
import { toast } from "sonner";

const stages: { id: DealStage; title: string; color: string }[] = [
  { id: "lead", title: "Lead", color: "bg-slate-500" },
  { id: "qualified", title: "Qualified", color: "bg-blue-500" },
  { id: "proposal", title: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", title: "Closed Won", color: "bg-green-500" },
  { id: "closed_lost", title: "Closed Lost", color: "bg-red-500" },
];

export default function Deals() {
  const { data: deals = [], isLoading } = useDeals();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const updateDealStage = useUpdateDealStage();
  const deleteDeal = useDeleteDeal();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealWithContact | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("lead");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState<DealWithContact | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, DealWithContact[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    };

    deals.forEach((deal) => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal);
      }
    });

    return grouped;
  }, [deals]);

  const activeDeal = useMemo(() => {
    if (!activeId) return null;
    return deals.find((deal) => deal.id === activeId) ?? null;
  }, [activeId, deals]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetStage = stages.find((s) => s.id === overId)?.id;
    
    if (targetStage) {
      const deal = deals.find((d) => d.id === dealId);
      if (deal && deal.stage !== targetStage) {
        try {
          await updateDealStage.mutateAsync({ id: dealId, stage: targetStage });
          toast.success(`Deal moved to ${stages.find((s) => s.id === targetStage)?.title}`);
        } catch {
          toast.error("Failed to update deal stage");
        }
      }
    } else {
      // Dropped on another deal - find which column it's in
      const targetDeal = deals.find((d) => d.id === overId);
      if (targetDeal) {
        const deal = deals.find((d) => d.id === dealId);
        if (deal && deal.stage !== targetDeal.stage) {
          try {
            await updateDealStage.mutateAsync({ id: dealId, stage: targetDeal.stage });
            toast.success(`Deal moved to ${stages.find((s) => s.id === targetDeal.stage)?.title}`);
          } catch {
            toast.error("Failed to update deal stage");
          }
        }
      }
    }
  };

  const handleAddDeal = (stage: DealStage) => {
    setEditingDeal(null);
    setDefaultStage(stage);
    setDialogOpen(true);
  };

  const handleEditDeal = (deal: DealWithContact) => {
    setEditingDeal(deal);
    setDefaultStage(deal.stage);
    setDialogOpen(true);
  };

  const handleDeleteDeal = (deal: DealWithContact) => {
    setDeletingDeal(deal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDeal) return;
    
    try {
      await deleteDeal.mutateAsync(deletingDeal.id);
      toast.success("Deal deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingDeal(null);
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  const handleSubmitDeal = async (data: {
    name: string;
    value: number | null;
    stage: DealStage;
    probability: number | null;
    expected_close_date: Date | null;
    contact_id: string | null;
    notes: string | null;
  }) => {
    try {
      const dealData = {
        ...data,
        expected_close_date: data.expected_close_date?.toISOString().split("T")[0] ?? null,
      };

      if (editingDeal) {
        await updateDeal.mutateAsync({ id: editingDeal.id, ...dealData });
        toast.success("Deal updated successfully");
      } else {
        await createDeal.mutateAsync(dealData);
        toast.success("Deal created successfully");
      }
    } catch {
      toast.error(editingDeal ? "Failed to update deal" : "Failed to create deal");
      throw new Error("Failed to save deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button onClick={() => handleAddDeal("lead")}>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id]}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
              onDeleteDeal={handleDeleteDeal}
              isLoading={isLoading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <DealCard
              deal={activeDeal}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        defaultStage={defaultStage}
        onSubmit={handleSubmitDeal}
      />

      <DeleteDealDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deal={deletingDeal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
