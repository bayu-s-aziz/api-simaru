import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import InputError from '@/components/input-error';
// import { route } from 'ziggy-js'; // <-- HAPUS BARIS INI

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: dashboard().url,
    },
];

// Definisikan tipe data User
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export default function UserIndex({ users }: { users: { current_page: number, data: User[] } }) {

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'user' as 'admin' | 'user',
    });

    useEffect(() => {
        if (editingUser) {
            setData({
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
            });
        } else {
            reset();
        }
    }, [editingUser]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        // Kirim request PATCH menggunakan string URL manual
        patch(`/users/${editingUser.id}`, { // <-- UBAH DI SINI
            onSuccess: () => setEditingUser(null),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                <>
                                    {users.data.map((user, index) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {(users.current_page - 1) * 10 + index + 1}
                                            </TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className='capitalize'>{user.role}</TableCell>
                                            <TableCell className='flex justify-center space-x-2'>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingUser(user)}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>

                                                <Button variant="destructive" size="sm" asChild>
                                                    <Link
                                                        // Gunakan string URL manual
                                                        href={`/users/${user.id}`} // <-- UBAH DI SINI
                                                        method="delete"
                                                        as="button"
                                                        onBefore={() => confirm('Apakah Anda yakin ingin menghapus user ini?')}
                                                        preserveScroll={true}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <TableCaption>Tidak ada data pengguna.</TableCaption>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* MODAL (DIALOG) UNTUK EDIT USER */}
            <Dialog open={!!editingUser} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Ubah data user di bawah ini. Klik "Save Changes" untuk menyimpan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4 pt-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value as 'admin' | 'user')}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
