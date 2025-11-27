import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookmarkPlus, Sparkles } from "lucide-react";

interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  excerpt: string;
  url: string;
  category: string;
  onDeepResearch?: () => void;
}

export const NewsCard = ({ 
  title, 
  source, 
  date, 
  excerpt, 
  url, 
  category,
  onDeepResearch 
}: NewsCardProps) => {
  return (
    <Card className="group hover:shadow-hover transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {source} · {date}
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {excerpt}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              Read
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <BookmarkPlus className="h-3 w-3" />
            Save
          </Button>
          {onDeepResearch && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 ml-auto"
              onClick={onDeepResearch}
            >
              <Sparkles className="h-3 w-3" />
              Deep Research
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
