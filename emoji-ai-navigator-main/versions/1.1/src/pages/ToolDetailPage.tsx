
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { allTools } from '@/data/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Triangle, ExternalLink } from 'lucide-react';
import NotFound from './NotFound';

const ToolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const tool = allTools.find(t => t.id === Number(id));

  const [currentUpvotes, setCurrentUpvotes] = useState(tool?.upvotes || 0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    if (tool) {
      setCurrentUpvotes(tool.upvotes);
      setIsUpvoted(false);
      setShowPlusOne(false);
    }
  }, [tool]);

  useEffect(() => {
    if (showPlusOne) {
      const timer = setTimeout(() => {
        setShowPlusOne(false);
      }, 1000); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
  }, [showPlusOne]);

  const handleUpvote = () => {
    if (!isUpvoted) {
      setCurrentUpvotes(currentUpvotes + 1);
      setIsUpvoted(true);
      setShowPlusOne(true);
    }
  };

  if (!tool) {
    return <NotFound />;
  }

  const sortedTools = [...allTools].sort((a, b) => b.upvotes - a.upvotes);
  const currentIndex = sortedTools.findIndex(t => t.id === tool.id);
  const prevTool = currentIndex > 0 ? sortedTools[currentIndex - 1] : null;
  const nextTool = currentIndex < sortedTools.length - 1 ? sortedTools[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
        <Header />
      </div>
      <main className="container mx-auto py-6 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-5xl flex-shrink-0">{tool.emoji}</div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
                <p className="text-lg text-gray-500">{tool.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {tool.tags.map(tag => (
                <span key={tag} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>

            <div className="text-base text-gray-600 leading-relaxed">
              <p>{tool.longDescription}</p>
            </div>

            <Tabs defaultValue="usageTips" className="w-full">
              <TabsList className="bg-transparent p-0 h-auto gap-4">
                <TabsTrigger value="usageTips" className="text-base data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 font-medium data-[state=active]:shadow-none rounded-lg px-4 py-2 bg-transparent hover:bg-gray-100 transition-colors">使用技巧</TabsTrigger>
                <TabsTrigger value="productIntro" className="text-base data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 font-medium data-[state=active]:shadow-none rounded-lg px-4 py-2 bg-transparent hover:bg-gray-100 transition-colors">产品介绍</TabsTrigger>
                <TabsTrigger value="awards" className="text-base data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 font-medium data-[state=active]:shadow-none rounded-lg px-4 py-2 bg-transparent hover:bg-gray-100 transition-colors">获得奖项</TabsTrigger>
              </TabsList>
              <TabsContent value="usageTips" className="mt-4 p-6 bg-white border rounded-lg">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{tool.details.usageTips}</p>
              </TabsContent>
              <TabsContent value="productIntro" className="mt-4 p-6 bg-white border rounded-lg">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{tool.details.productIntro}</p>
              </TabsContent>
              <TabsContent value="awards" className="mt-4 p-6 bg-white border rounded-lg">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{tool.details.awards}</p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 lg:sticky top-28">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">#{currentIndex + 1}</h3>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={!prevTool} asChild>
                      <Link to={prevTool ? `/tool/${prevTool.id}` : '#'}>
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={!nextTool} asChild>
                      <Link to={nextTool ? `/tool/${nextTool.id}` : '#'}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Day Rank</p>
                <Button 
                  className="w-full bg-[#cda14c] hover:bg-[#cda14c]/90 text-white text-base py-6 font-semibold relative rounded-full"
                  onClick={handleUpvote}
                  disabled={isUpvoted}
                >
                  {showPlusOne && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-semibold animate-plus-one pointer-events-none">
                      +1
                    </span>
                  )}
                  <Triangle className="mr-2 -ml-1 h-4 w-4" fill="white" strokeWidth={0}/>
                  Upvote・{currentUpvotes} points
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-base py-6 font-semibold rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => window.open(tool.url, '_blank')}
                >
                  <ExternalLink className="mr-2 -ml-1 h-4 w-4" />
                  访问网站
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolDetailPage;
