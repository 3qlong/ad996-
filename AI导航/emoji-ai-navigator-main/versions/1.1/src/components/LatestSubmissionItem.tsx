
import { ArrowUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LatestSubmissionItemProps {
    // 去掉 rank
    logo: string;
    name: string;
    description: string;
    tags: string[];
    upvotes: number;
    url: string;
}

export const LatestSubmissionItem = ({ logo, name, description, tags, upvotes, url }: LatestSubmissionItemProps) => {
    return (
        <div className="flex items-center gap-4 py-3">
            {/* 不再显示 rank */}
            <Avatar className="h-12 w-12 rounded-lg flex-shrink-0">
                <AvatarImage src={logo} alt={`${name} logo`} />
                <AvatarFallback className="rounded-lg">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                 <a href={url} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">{name}</h3>
                        {/* <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" /> */}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{description}</p>
                </a>
                <div className="flex flex-wrap gap-2 mt-1.5">
                    {tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
             <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center border rounded-lg w-14 h-14 text-center hover:bg-gray-50 transition-colors flex-shrink-0">
                <ArrowUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold">{upvotes}</span>
            </a>
        </div>
    );
}
