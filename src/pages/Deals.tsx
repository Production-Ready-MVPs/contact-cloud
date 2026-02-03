import { Plus, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const stages = [
  { id: "lead", title: "Lead", color: "bg-slate-500" },
  { id: "qualified", title: "Qualified", color: "bg-blue-500" },
  { id: "proposal", title: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-500" },
  { id: "closed-won", title: "Closed Won", color: "bg-green-500" },
  { id: "closed-lost", title: "Closed Lost", color: "bg-red-500" },
];

const deals = [
  {
    id: "1",
    name: "Enterprise License",
    value: 50000,
    stage: "proposal",
    contact: { name: "John Smith", company: "Acme Corp" },
    closeDate: "2024-02-15",
  },
  {
    id: "2",
    name: "Consulting Project",
    value: 25000,
    stage: "qualified",
    contact: { name: "Sarah Johnson", company: "TechStart Inc" },
    closeDate: "2024-03-01",
  },
  {
    id: "3",
    name: "Annual Subscription",
    value: 12000,
    stage: "lead",
    contact: { name: "Michael Brown", company: "Startup.io" },
    closeDate: "2024-03-15",
  },
  {
    id: "4",
    name: "Custom Development",
    value: 75000,
    stage: "negotiation",
    contact: { name: "Emily Davis", company: "Enterprise Solutions" },
    closeDate: "2024-02-28",
  },
  {
    id: "5",
    name: "Training Package",
    value: 8000,
    stage: "closed-won",
    contact: { name: "David Wilson", company: "Creative Agency" },
    closeDate: "2024-01-30",
  },
  {
    id: "6",
    name: "Platform Integration",
    value: 35000,
    stage: "proposal",
    contact: { name: "Lisa Chen", company: "Global Tech" },
    closeDate: "2024-02-20",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function getStageTotal(stageId: string) {
  return deals
    .filter((deal) => deal.stage === stageId)
    .reduce((sum, deal) => sum + deal.value, 0);
}

export default function Deals() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage.id);
          const stageTotal = getStageTotal(stage.id);

          return (
            <div key={stage.id} className="flex-shrink-0 w-[300px]">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                      <CardTitle className="text-sm font-medium">
                        {stage.title}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-1">
                        {stageDeals.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(stageTotal)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{deal.name}</h4>
                            <Badge variant="outline">
                              {formatCurrency(deal.value)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-[10px]">
                                {deal.contact.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {deal.contact.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Close: {new Date(deal.closeDate).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No deals in this stage
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
