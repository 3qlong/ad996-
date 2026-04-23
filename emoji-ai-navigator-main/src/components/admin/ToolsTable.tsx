
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pin, PinOff, ArrowUp, ArrowDown, FilePenLine, Trash2, Pencil } from 'lucide-react';
import { Tool } from '@/types/tool';
import { CATEGORY_SUB_TAGS } from '@/lib/categorySubTags';

interface ToolsTableProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
  onSort: (toolId: number, direction: 'up' | 'down') => void;
  onPinToggle: (toolId: number) => void;
  onUpdateSubTags?: (toolId: number, subTags: string[]) => void;
  // 批量操作相关属性
  selectedTools?: number[];
  onSelectTool?: (toolId: number) => void;
  onSelectAll?: () => void;
}

export const ToolsTable: React.FC<ToolsTableProps> = ({ 
  tools, 
  onEdit, 
  onDelete, 
  onSort, 
  onPinToggle,
  onUpdateSubTags,
  selectedTools = [],
  onSelectTool,
  onSelectAll
}) => {
  const isAllSelected = tools.length > 0 && selectedTools.length === tools.length;
  const isSomeSelected = selectedTools.length > 0 && selectedTools.length < tools.length;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectTool && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="全选"
                />
              </TableHead>
            )}
            <TableHead className="w-[80px]">Logo</TableHead>
            <TableHead>网站名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>二级分类</TableHead>
            <TableHead>标签</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool, index) => (
            <TableRow key={tool.id}>
              {onSelectTool && (
                <TableCell>
                  <Checkbox
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={() => onSelectTool(tool.id)}
                    aria-label={`选择${tool.name}`}
                  />
                </TableCell>
              )}
              <TableCell>
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={tool.logo} alt={tool.name} className="object-cover" />
                  <AvatarFallback className="rounded-md">{tool.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{tool.category}</TableCell>
              <TableCell className="max-w-[180px]">
                {onUpdateSubTags ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex flex-wrap gap-1 items-center hover:bg-gray-50 rounded px-1 py-0.5 transition-colors group min-h-[24px] w-full text-left">
                        {(CATEGORY_SUB_TAGS[tool.category] || []).filter(t => tool.tags.includes(t)).map(t => (
                          <span key={t} className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
                        ))}
                        <Pencil className="h-3 w-3 text-gray-300 group-hover:text-gray-600 ml-auto" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="start">
                      <div className="text-xs text-gray-500 mb-2">{tool.category} · 二级分类</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(CATEGORY_SUB_TAGS[tool.category] || []).map(tag => {
                          const active = tool.tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const current = (CATEGORY_SUB_TAGS[tool.category] || []).filter(t => tool.tags.includes(t));
                                const next = active ? current.filter(t => t !== tag) : [...current, tag];
                                onUpdateSubTags(tool.id, next);
                              }}
                              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                        {(CATEGORY_SUB_TAGS[tool.category] || []).length === 0 && (
                          <div className="text-xs text-gray-400">该分类暂无二级标签</div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {(CATEGORY_SUB_TAGS[tool.category] || []).filter(t => tool.tags.includes(t)).map(t => (
                      <span key={t} className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-xs text-gray-500">{tool.tags.join(', ')}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onPinToggle(tool.id)} title={tool.pinned ? '取消置顶' : '置顶'}>
                  {tool.pinned ? <PinOff className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onSort(tool.id, 'up')} disabled={index === 0 || tool.pinned !== tools[index - 1]?.pinned} title="上移">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onSort(tool.id, 'down')} disabled={index === tools.length - 1 || tool.pinned !== tools[index + 1]?.pinned} title="下移">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(tool)} title="编辑"><FilePenLine className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(tool)} title="删除"><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
