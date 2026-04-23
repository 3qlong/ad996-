
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, PinOff, ArrowUp, ArrowDown, FilePenLine, Trash2 } from 'lucide-react';
import { Tool } from '@/types/tool';

interface ToolsTableProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
  onSort: (toolId: number, direction: 'up' | 'down') => void;
  onPinToggle: (toolId: number) => void;
}

export const ToolsTable: React.FC<ToolsTableProps> = ({ tools, onEdit, onDelete, onSort, onPinToggle }) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Logo</TableHead>
            <TableHead>网站名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>标签</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool, index) => (
            <TableRow key={tool.id}>
              <TableCell>
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={tool.logo} alt={tool.name} className="object-cover" />
                  <AvatarFallback className="rounded-md">{tool.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{tool.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">{tool.tags.join(', ')}</TableCell>
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
