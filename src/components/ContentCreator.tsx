import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, PenTool, Send } from "lucide-react";

export const ContentCreator = () => {
  return (
    <Card className="bg-gradient-primary text-primary-foreground border-0">
      <CardHeader>
        <CardTitle className="text-xl">Content Creation Tools</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Transform your research into engaging content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="secondary"
          className="w-full justify-start gap-3"
        >
          <FileText className="h-4 w-4" />
          Generate Blog Post
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start gap-3"
        >
          <Video className="h-4 w-4" />
          Create Video Script
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start gap-3"
        >
          <PenTool className="h-4 w-4" />
          Draft Social Post
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start gap-3"
        >
          <Send className="h-4 w-4" />
          Submit CFP
        </Button>
      </CardContent>
    </Card>
  );
};
