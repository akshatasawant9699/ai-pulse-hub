import { useState, useEffect } from "react";
import { NewsCard } from "@/components/NewsCard";
import { FilterBar } from "@/components/FilterBar";
import { ContentCreator } from "@/components/ContentCreator";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id?: number;
  title: string;
  source: string;
  date: string;
  excerpt: string;
  url: string;
  category: string;
}

interface ResearchData {
  summary: string;
  keyPoints: string[];
  technicalDetails: string;
  implications: string;
  resources: Array<{
    title: string;
    type: string;
    description: string;
    url: string;
  }>;
  caseStudies: Array<{
    title: string;
    description: string;
    outcome: string;
  }>;
  contentIdeas: {
    blogPost: string;
    videoScript: string;
    socialPosts: string[];
    cfpIdeas: string[];
  };
}

const Index = () => {
  const [activeFilter, setActiveFilter] = useState("1d");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [researchDialogOpen, setResearchDialogOpen] = useState(false);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("aggregate-ai-news", {
        body: {
          timeFilter: activeFilter,
          query: searchQuery,
        },
      });

      if (error) throw error;

      if (data?.news) {
        const itemsWithIds = data.news.map((item: NewsItem, index: number) => ({
          ...item,
          id: index,
        }));
        setNewsItems(itemsWithIds);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeFilter]);

  const handleSearch = () => {
    fetchNews();
  };

  const handleDeepResearch = async (newsItem: NewsItem) => {
    setIsResearching(true);
    setResearchDialogOpen(true);
    setResearchData(null);

    toast({
      title: "Starting Deep Research",
      description: "Using Gemini Pro to analyze this topic in depth...",
    });

    try {
      const { data, error } = await supabase.functions.invoke("deep-research", {
        body: {
          topic: newsItem.title,
          context: newsItem.excerpt,
        },
      });

      if (error) throw error;

      if (data?.research) {
        setResearchData(data.research);
        toast({
          title: "Research Complete",
          description: "Deep analysis ready for review",
        });
      }
    } catch (error) {
      console.error("Error conducting research:", error);
      toast({
        title: "Error",
        description: "Failed to conduct deep research. Please try again.",
        variant: "destructive",
      });
      setResearchDialogOpen(false);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Pulse</h1>
                <p className="text-sm text-muted-foreground">Your Developer Advocate Intelligence Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Gemini
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <ContentCreator />
          </aside>

          {/* News Feed */}
          <div className="lg:col-span-3 space-y-6">
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading AI-powered news...
                    </span>
                  ) : (
                    `Latest Updates · ${newsItems.length} articles`
                  )}
                </h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {newsItems.map((news) => (
                    <NewsCard
                      key={news.id}
                      {...news}
                      onDeepResearch={() => handleDeepResearch(news)}
                    />
                  ))}
                </div>
              )}
            </div>

            {!isLoading && newsItems.length === 0 && (
              <div className="flex justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  No news items found. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Deep Research Dialog */}
      <Dialog open={researchDialogOpen} onOpenChange={setResearchDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Deep Research Analysis
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis powered by Gemini Pro
            </DialogDescription>
          </DialogHeader>
          
          {isResearching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Conducting deep research...
              </p>
            </div>
          ) : researchData ? (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Summary */}
                <Card className="p-4 bg-card/50">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {researchData.summary}
                  </p>
                </Card>

                {/* Key Points */}
                {researchData.keyPoints?.length > 0 && (
                  <Card className="p-4 bg-card/50">
                    <h3 className="font-semibold mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {researchData.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Technical Details */}
                {researchData.technicalDetails && (
                  <Card className="p-4 bg-card/50">
                    <h3 className="font-semibold mb-2">Technical Details</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {researchData.technicalDetails}
                    </p>
                  </Card>
                )}

                {/* Case Studies */}
                {researchData.caseStudies?.length > 0 && (
                  <Card className="p-4 bg-card/50">
                    <h3 className="font-semibold mb-3">Case Studies</h3>
                    <div className="space-y-3">
                      {researchData.caseStudies.map((study, i) => (
                        <div key={i} className="border-l-2 border-primary/50 pl-3">
                          <h4 className="text-sm font-medium mb-1">{study.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            {study.description}
                          </p>
                          <p className="text-xs text-primary">{study.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Content Ideas */}
                {researchData.contentIdeas && (
                  <Card className="p-4 bg-gradient-primary text-primary-foreground">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Content Creation Ideas
                    </h3>
                    <div className="space-y-3 text-sm">
                      {researchData.contentIdeas.blogPost && (
                        <div>
                          <Badge variant="secondary" className="mb-1">Blog Post</Badge>
                          <p className="text-primary-foreground/90 text-xs">
                            {researchData.contentIdeas.blogPost}
                          </p>
                        </div>
                      )}
                      {researchData.contentIdeas.socialPosts?.length > 0 && (
                        <div>
                          <Badge variant="secondary" className="mb-1">Social Posts</Badge>
                          <ul className="space-y-1 text-xs text-primary-foreground/90">
                            {researchData.contentIdeas.socialPosts.map((post, i) => (
                              <li key={i}>• {post}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {researchData.contentIdeas.cfpIdeas?.length > 0 && (
                        <div>
                          <Badge variant="secondary" className="mb-1">CFP Ideas</Badge>
                          <ul className="space-y-1 text-xs text-primary-foreground/90">
                            {researchData.contentIdeas.cfpIdeas.map((idea, i) => (
                              <li key={i}>• {idea}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
