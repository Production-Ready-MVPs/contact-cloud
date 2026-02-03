import { Sparkles, Copy, Send, History } from "lucide-react";
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

const contacts = [
  { id: "1", name: "John Smith", company: "Acme Corp" },
  { id: "2", name: "Sarah Johnson", company: "TechStart Inc" },
  { id: "3", name: "Michael Brown", company: "Startup.io" },
  { id: "4", name: "Emily Davis", company: "Enterprise Solutions" },
];

export default function AIGenerator() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
          <p className="text-muted-foreground">
            Generate personalized emails, proposals, and follow-ups
          </p>
        </div>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          View History
        </Button>
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
            <Tabs defaultValue="email">
              <TabsList className="w-full">
                <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
                <TabsTrigger value="proposal" className="flex-1">Proposal</TabsTrigger>
                <TabsTrigger value="followup" className="flex-1">Follow-up</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email Type</Label>
                  <Select>
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
                  <Select>
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
                  />
                </div>

                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Email
                </Button>
              </TabsContent>

              <TabsContent value="proposal" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Deal</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a deal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Enterprise License - $50,000</SelectItem>
                      <SelectItem value="2">Consulting Project - $25,000</SelectItem>
                      <SelectItem value="3">Custom Development - $75,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Key Points (Optional)</Label>
                  <Textarea
                    placeholder="List key points to highlight in the proposal..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Proposal
                </Button>
              </TabsContent>

              <TabsContent value="followup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Reason</Label>
                  <Select>
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
                  <Select>
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

                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
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
            <div className="min-h-[400px] rounded-md border border-dashed p-4">
              <p className="text-sm text-muted-foreground text-center mt-40">
                Generate content to see it here
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button className="flex-1" disabled>
                <Send className="mr-2 h-4 w-4" />
                Use in Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
