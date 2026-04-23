
import Header from "@/components/Header";
import WebsiteSubmissionForm from "@/components/WebsiteSubmissionForm";
import LatestSubmissions from "@/components/LatestSubmissions";
import { List, Video, PenSquare, Image as ImageIcon, Zap } from "lucide-react";

const WebsiteSubmissionPage = () => {
  const categories = [
    { name: '全部', icon: <List className="h-4 w-4" /> },
    { name: 'AI视频', icon: <Video className="h-4 w-4" /> },
    { name: 'AI写作', icon: <PenSquare className="h-4 w-4" /> },
    { name: 'AI图像', icon: <ImageIcon className="h-4 w-4" /> },
    { name: '效率工具', icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
            <Header />
        </div>
        <main className="container mx-auto py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                          <span role="img" aria-label="inbox">📥</span>
                          网站收录
                        </h1>
                        <p className="text-gray-500">提交您的网站，让更多人发现它的价值。</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                className="inline-flex items-center gap-2 px-4 py-2"
                                style={{ backgroundColor: "#fefefe", border: "1px solid #e5e7eb", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151", boxShadow: "0 1px 2px rgba(16,24,40,0.02)" }}
                            >
                                {category.icon}
                                {category.name}
                            </button>
                        ))}
                    </div>
                    
                    <WebsiteSubmissionForm />
                </div>
                <div className="lg:col-span-1">
                    <LatestSubmissions />
                </div>
            </div>
        </main>
    </div>
  );
}

export default WebsiteSubmissionPage;
