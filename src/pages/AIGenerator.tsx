import { useState } from "react";
import { Sparkles, Copy, History, Loader2, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useContacts } from "@/hooks/useContacts";
import { useDeals } from "@/hooks/useDeals";
import { useGenerateContent, useAIGenerations, useDeleteAIGeneration } from "@/hooks/useAIGenerator";

export default function AIGenerator() {
  const [activeTab, setActiveTab] = useState<"email" | "proposal" | "followup">("email");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Form states
  const [contactId, setContactId] = useState<string>("");
  const [dealId, setDealId] = useState<string>("");
  const [emailType, setEmailType] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [followupReason, setFollowupReason] = useState<string>("");
  const [daysSinceContact, setDaysSinceContact] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [keyPoints, setKeyPoints] = useState<string>("");

  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: history, isLoading: historyLoading } = useAIGenerations();
  const generateMutation = useGenerateContent();
  const deleteMutation = useDeleteAIGeneration();

  const handleGenerate = async () => {
    try {
      const content = await generateMutation.mutateAsync({
        type: activeTab,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
        emailType,
        tone,
        followupReason,
        daysSinceContact,
        additionalContext,
        keyPoints,
      });
      setGeneratedContent(content);
      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseFromHistory = (content: string) => {
    setGeneratedContent(content);
    setHistoryOpen(false);
  };

  const handleDeleteFromHistory = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Generation deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "email":
        return "default";
      case "proposal":
        return "secondary";
      case "followup":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
          <p className="text-muted-foreground">
            Generate personalized emails, proposals, and follow-ups
          </p>
        </div>
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Generation History</SheetTitle>
              <SheetDescription>
                Your previously generated content
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
              {historyLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getTypeBadgeVariant(item.generation_type)}>
                            {item.generation_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm line-clamp-4">{item.content}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseFromHistory(item.content)}
                          >
                            Use This
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFromHistory(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No generation history yet
                </p>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Content
            </CardTitle>
            <CardDescription>
              Select the type of content and context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
                <TabsTrigger value="proposal" className="flex-1">Proposal</TabsTrigger>
                <TabsTrigger value="followup" className="flex-1">Follow-up</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}{contact.company ? ` - ${contact.company}` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No contacts available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email Type</Label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose email type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intro">Introduction</SelectItem>
                      <SelectItem value="meeting">Meeting Request</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="thanks">Thank You</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional Context (Optional)</Label>
                  <Textarea
                    placeholder="Add any specific details or points to include..."
                    className="min-h-[100px]"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Email
                </Button>
              </TabsContent>

              <TabsContent value="proposal" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}{contact.company ? ` - ${contact.company}` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No contacts available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Deal</Label>
                  <Select value={dealId} onValueChange={setDealId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : deals && deals.length > 0 ? (
                        deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.name} - ${(deal.value || 0).toLocaleString()}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No deals available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Key Points (Optional)</Label>
                  <Textarea
                    placeholder="List key points to highlight in the proposal..."
                    className="min-h-[100px]"
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Proposal
                </Button>
              </TabsContent>

              <TabsContent value="followup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}{contact.company ? ` - ${contact.company}` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No contacts available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Reason</Label>
                  <Select value={followupReason} onValueChange={setFollowupReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-response">No Response</SelectItem>
                      <SelectItem value="after-meeting">After Meeting</SelectItem>
                      <SelectItem value="check-in">General Check-in</SelectItem>
                      <SelectItem value="proposal-sent">Proposal Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Days Since Last Contact</Label>
                  <Select value={daysSinceContact} onValueChange={setDaysSinceContact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Follow-up
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generateMutation.isPending ? (
              <div className="min-h-[400px] rounded-md border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Generating content...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : generatedContent ? (
              <div className="min-h-[400px] rounded-md border p-4 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent}</pre>
              </div>
            ) : (
              <div className="min-h-[400px] rounded-md border border-dashed p-4 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  Generate content to see it here
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!generatedContent}
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
