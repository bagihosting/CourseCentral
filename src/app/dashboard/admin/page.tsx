import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllUsers } from '@/lib/data';
import { User } from 'lucide-react';

export default async function AdminPage() {
  const users = await getAllUsers();
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Pengguna</CardTitle>
          <CardDescription>Lihat dan kelola pengguna terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Peran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {user.name}
                  </TableCell>
                  <TableCell>{user.role === 'admin' ? 'Admin' : 'Member'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
