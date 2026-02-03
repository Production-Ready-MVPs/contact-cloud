import { Phone, Mail, Building, Briefcase } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Contact } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";

interface ContactDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onEdit: () => void;
}

function getHealthScoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getHealthScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
}

export function ContactDetailSheet({ open, onOpenChange, contact, onEdit }: ContactDetailSheetProps) {
  if (!contact) return null;

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">{contact.name}</SheetTitle>
              <SheetDescription>
                {contact.position && contact.company
                  ? `${contact.position} at ${contact.company}`
                  : contact.company || contact.position || "No company info"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Health Score */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="text-sm font-medium">Relationship Health</p>
              <p className="text-2xl font-bold">{contact.health_score}</p>
              <p className="text-xs text-muted-foreground">
                {getHealthScoreLabel(contact.health_score)}
              </p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-muted-foreground/20"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${getHealthScoreColor(contact.health_score).replace("bg-", "stroke-")}`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${contact.health_score}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.company}</span>
              </div>
            )}
            {contact.position && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.position}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Tabs for Activity, Notes, Deals */}
          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              <TabsTrigger value="deals" className="flex-1">Deals</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="mt-4">
              {contact.notes ? (
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No notes added yet.</p>
              )}
            </TabsContent>

            <TabsContent value="deals" className="mt-4">
              <p className="text-sm text-muted-foreground">No deals associated with this contact.</p>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <p className="text-sm text-muted-foreground">No tasks associated with this contact.</p>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Meta info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}</p>
            <p>Updated {formatDistanceToNow(new Date(contact.updated_at), { addSuffix: true })}</p>
          </div>

          {/* Actions */}
          <Button onClick={onEdit} className="w-full">
            Edit Contact
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
