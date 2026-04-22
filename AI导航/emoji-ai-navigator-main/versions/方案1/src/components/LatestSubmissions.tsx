
import { allTools } from '@/data/tools';
import { LatestSubmissionItem } from './LatestSubmissionItem';

const LatestSubmissions = () => {
    // Sort by id to represent "latest" submissions, as requested.
    const latestTools = [...allTools].sort((a, b) => b.id - a.id).slice(0, 5);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span role="img" aria-label="robot">🤖</span>
              最新收录AI站点
            </h2>
            <div className="space-y-1 divide-y divide-gray-100">
                {latestTools.map((tool, index) => (
                    <LatestSubmissionItem 
                        key={tool.id}
                        // rank 移除，不再传递rank
                        logo={tool.logo}
                        name={tool.name}
                        description={tool.description}
                        tags={tool.tags}
                        upvotes={tool.upvotes}
                        url={tool.url}
                    />
                ))}
            </div>
        </div>
    )
}

export default LatestSubmissions;
