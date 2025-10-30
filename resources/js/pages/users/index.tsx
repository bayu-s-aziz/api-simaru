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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

// Definisikan tipe Props untuk komponen
interface UserIndexProps {
    users: {
        current_page: number;
        data: User[];
    };
}

export default function UserIndex({ users }: UserIndexProps) {

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null); // State untuk konfirmasi hapus

    // Form untuk Edit User
    const { data: editData, setData: setEditData, patch, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        email: '',
        role: 'user' as 'admin' | 'user',
    });

    // Form untuk Add User
    const { data: addData, setData: setAddData, post, processing: processingAdd, errors: errorsAdd, reset: resetAdd } = useForm({
        name: '',
        email: '',
        role: 'user' as 'admin' | 'user',
        password: '',
        password_confirmation: '',
    });

    // Hook useForm untuk delete
    const { delete: deleteUser, processing: processingDelete } = useForm();

    useEffect(() => {
        if (editingUser) {
            setEditData({
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
            });
        } else {
            resetEdit();
        }
    }, [editingUser]);

    // Handler submit untuk form edit
    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        patch(`/users/${editingUser.id}`, {
            onSuccess: () => setEditingUser(null),
            preserveScroll: true,
        });
    };

    // Handler submit untuk form tambah
    const handleAddSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/users', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                resetAdd();
            },
            preserveScroll: true,
        });
    };

    // Handler untuk konfirmasi hapus
    const handleDeleteConfirm = () => {
        if (!deletingUser) return;

        deleteUser(`/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null), // Tutup modal setelah sukses
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Tombol Add New */}
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                </div>

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

                                                {/* --- PERUBAHAN DI SINI --- */}
                                                {/* Tombol Delete sekarang membuka modal konfirmasi */}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeletingUser(user)} // Buka modal konfirmasi
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>

                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Tidak ada data pengguna.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         {users.data.length === 0 && (
                            <TableCaption>Tidak ada data pengguna.</TableCaption>
                         )}
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
                    {/* ... form edit user ... */}
                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                        <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsEdit.name} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData('email', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsEdit.email} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={editData.role} onValueChange={(value) => setEditData('role', value as 'admin' | 'user')}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errorsEdit.role} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processingEdit}>
                                {processingEdit ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             {/* MODAL (DIALOG) UNTUK ADD USER */}
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Masukkan detail pengguna baru di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    {/* ... form add user ... */}
                    <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
                        <div>
                            <Label htmlFor="add-name">Name</Label>
                            <Input
                                id="add-name"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsAdd.name} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="add-email">Email</Label>
                            <Input
                                id="add-email"
                                type="email"
                                value={addData.email}
                                onChange={(e) => setAddData('email', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsAdd.email} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="add-role">Role</Label>
                            <Select value={addData.role} onValueChange={(value) => setAddData('role', value as 'admin' | 'user')}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errorsAdd.role} className="mt-2" />
                        </div>
                         <div>
                            <Label htmlFor="add-password">Password</Label>
                            <Input
                                id="add-password"
                                type="password"
                                value={addData.password}
                                onChange={(e) => setAddData('password', e.target.value)}
                                className="mt-1"
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errorsAdd.password} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="add-password_confirmation">Confirm Password</Label>
                            <Input
                                id="add-password_confirmation"
                                type="password"
                                value={addData.password_confirmation}
                                onChange={(e) => setAddData('password_confirmation', e.target.value)}
                                className="mt-1"
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errorsAdd.password_confirmation} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsAddModalOpen(false); resetAdd(); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processingAdd}>
                                {processingAdd ? 'Adding...' : 'Add User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- DIALOG KONFIRMASI DELETE --- */}
            <Dialog open={!!deletingUser} onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus user: <strong>{deletingUser?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingUser(null)}
                            disabled={processingDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={processingDelete}
                        >
                            {processingDelete ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
