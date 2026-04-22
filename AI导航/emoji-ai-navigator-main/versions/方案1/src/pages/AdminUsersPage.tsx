
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserFormDialog } from '@/components/UserFormDialog';
import { UserFormValues } from '@/lib/validations/user';
import { toast } from '@/components/ui/sonner';

// Mock data for now
const mockUsers: UserFormValues[] = [
  { id: '1', username: 'admin', role: '超级管理员', password: '' },
  { id: '2', username: 'editor01', role: '子账号', password: '' },
  { id: '3', username: 'editor02', role: '子账号', password: '' },
];

const AdminUsersPage = () => {
    const [users, setUsers] = useState(mockUsers); // In real app, this would come from an API
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserFormValues | null>(null);

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };
    
    const handleEditUser = (user: UserFormValues) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDeleteUser = (userId?: string) => {
        if (!userId) return;
        // In a real app, you'd call an API here
        setUsers(users.filter(u => u.id !== userId));
        toast.success(`用户 ${userId} 已删除。`);
        console.log(`Deleting user ${userId}`);
    };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
        <Header />
      </div>
      <main className="container mx-auto py-6 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">管理员账户管理</h1>
          <Button onClick={handleAddUser}>添加新用户</Button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <UserFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsersPage;
