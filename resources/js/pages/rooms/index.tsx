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

// Breadcrumbs untuk Room Management
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Room Management',
        href: dashboard().url, // Asumsi route, bisa diganti ke route index rooms
    },
];

// Definisikan tipe data Room
interface Room {
    id: number;
    name: string;
    faculty_name: string;
    photo: string | null; // Sesuai migrasi, photo bisa null
    capacity: number;
    status: 'draft' | 'approved' | 'rejected';
}

// Definisikan tipe Props untuk komponen
interface RoomIndexProps {
    rooms: {
        current_page: number;
        data: Room[];
        // Tambahkan properti paginasi lain jika perlu (total, per_page, etc.)
    };
}

export default function RoomIndex({ rooms }: RoomIndexProps) {

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

    // Tipe untuk status
    type RoomStatus = 'draft' | 'approved' | 'rejected';

    // Form untuk Edit Room
    const { data: editData, setData: setEditData, patch, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        faculty_name: '',
        photo: '',
        capacity: 0,
        status: 'draft' as RoomStatus,
    });

    // Form untuk Add Room
    const { data: addData, setData: setAddData, post, processing: processingAdd, errors: errorsAdd, reset: resetAdd } = useForm({
        name: '',
        faculty_name: '',
        photo: '',
        capacity: 0,
        status: 'draft' as RoomStatus,
    });

    // Hook useForm untuk delete
    const { delete: deleteRoom, processing: processingDelete } = useForm();

    // Populate form edit saat editingRoom berubah
    useEffect(() => {
        if (editingRoom) {
            setEditData({
                name: editingRoom.name,
                faculty_name: editingRoom.faculty_name,
                photo: editingRoom.photo || '', // Handle null photo
                capacity: editingRoom.capacity,
                status: editingRoom.status,
            });
        } else {
            resetEdit();
        }
    }, [editingRoom]);

    // Handler submit untuk form edit
    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingRoom) return;

        patch(`/rooms/${editingRoom.id}`, {
            onSuccess: () => setEditingRoom(null), // Tutup modal
            preserveScroll: true,
        });
    };

    // Handler submit untuk form tambah
    const handleAddSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/rooms', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                resetAdd();
            },
            preserveScroll: true,
        });
    };

    // Handler untuk konfirmasi hapus
    const handleDeleteConfirm = () => {
        if (!deletingRoom) return;

        deleteRoom(`/rooms/${deletingRoom.id}`, {
            onSuccess: () => setDeletingRoom(null), // Tutup modal setelah sukses
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Tombol Add New */}
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                </div>

                {/* Tabel Data Ruangan */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Faculty Name</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Photo</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.data.length > 0 ? (
                                <>
                                    {rooms.data.map((room, index) => (
                                        <TableRow key={room.id}>
                                            <TableCell className="font-medium">
                                                {/* Asumsi 10 item per halaman, sesuaikan jika perlu */}
                                                {(rooms.current_page - 1) * 10 + index + 1}
                                            </TableCell>
                                            <TableCell>{room.name}</TableCell>
                                            <TableCell>{room.faculty_name}</TableCell>
                                            <TableCell>{room.capacity}</TableCell>
                                            <TableCell className='capitalize'>{room.status}</TableCell>
                                            <TableCell>
                                                {room.photo ? (
                                                    <a href={room.photo} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={room.photo}
                                                            alt={room.name}
                                                            className="h-10 w-16 rounded-md object-cover transition-transform hover:scale-110"
                                                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x40/gray/white?text=Error')}
                                                        />
                                                    </a>
                                                ) : (
                                                    <span className='text-xs text-gray-500'>No Photo</span>
                                                )}
                                            </TableCell>
                                            <TableCell className='flex justify-center space-x-2'>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingRoom(room)}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeletingRoom(room)}
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
                                    <TableCell colSpan={7} className="text-center">
                                        Tidak ada data ruangan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         {rooms.data.length === 0 && (
                            <TableCaption>Tidak ada data ruangan.</TableCaption>
                         )}
                    </Table>
                </div>
            </div>

            {/* MODAL (DIALOG) UNTUK EDIT ROOM */}
            <Dialog open={!!editingRoom} onOpenChange={(isOpen) => !isOpen && setEditingRoom(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Room</DialogTitle>
                        <DialogDescription>
                            Ubah data ruangan di bawah ini. Klik "Save Changes" untuk menyimpan.
                        </DialogDescription>
                    </DialogHeader>
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
                            <Label htmlFor="edit-faculty_name">Faculty Name</Label>
                            <Input
                                id="edit-faculty_name"
                                value={editData.faculty_name}
                                onChange={(e) => setEditData('faculty_name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsEdit.faculty_name} className="mt-2" />
                        </div>
                         <div>
                            <Label htmlFor="edit-photo">Photo URL</Label>
                            <Input
                                id="edit-photo"
                                value={editData.photo}
                                onChange={(e) => setEditData('photo', e.target.value)}
                                className="mt-1"
                                placeholder="https://example.com/image.png"
                            />
                            <InputError message={errorsEdit.photo} className="mt-2" />
                        </div>
                         <div>
                            <Label htmlFor="edit-capacity">Capacity</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                value={editData.capacity}
                                // Konversi ke integer saat change
                                onChange={(e) => setEditData('capacity', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsEdit.capacity} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={editData.status} onValueChange={(value) => setEditData('status', value as RoomStatus)}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errorsEdit.status} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingRoom(null)}
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

             {/* MODAL (DIALOG) UNTUK ADD ROOM */}
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Room</DialogTitle>
                        <DialogDescription>
                            Masukkan detail ruangan baru di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
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
                            <Label htmlFor="add-faculty_name">Faculty Name</Label>
                            <Input
                                id="add-faculty_name"
                                value={addData.faculty_name}
                                onChange={(e) => setAddData('faculty_name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsAdd.faculty_name} className="mt-2" />
                        </div>
                         <div>
                            <Label htmlFor="add-photo">Photo URL</Label>
                            <Input
                                id="add-photo"
                                value={addData.photo}
                                onChange={(e) => setAddData('photo', e.target.value)}
                                className="mt-1"
                                placeholder="https://example.com/image.png"
                            />
                            <InputError message={errorsAdd.photo} className="mt-2" />
                        </div>
                         <div>
                            <Label htmlFor="add-capacity">Capacity</Label>
                            <Input
                                id="add-capacity"
                                type="number"
                                value={addData.capacity}
                                onChange={(e) => setAddData('capacity', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                required
                            />
                            <InputError message={errorsAdd.capacity} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="add-status">Status</Label>
                            <Select value={addData.status} onValueChange={(value) => setAddData('status', value as RoomStatus)}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    {/* Ini adalah baris yang diperbaiki dari 'SelsctItem' */}
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errorsAdd.status} className="mt-2" />
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
                                {processingAdd ? 'Adding...' : 'Add Room'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG KONFIRMASI DELETE */}
            <Dialog open={!!deletingRoom} onOpenChange={(isOpen) => !isOpen && setDeletingRoom(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus ruangan: <strong>{deletingRoom?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingRoom(null)}
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
