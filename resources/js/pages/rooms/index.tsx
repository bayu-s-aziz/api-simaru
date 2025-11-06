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
import { router } from '@inertiajs/react';

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

    // Form untuk Edit Room - ubah tipe photo menjadi File | string | null
    const { data: editData, setData: setEditData, patch, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        faculty_name: '',
        photo: null as File | string | null,
        capacity: 0,
        status: 'draft' as RoomStatus,
    });

    // Form untuk Add Room - ubah tipe photo menjadi File | null
    const { data: addData, setData: setAddData, post, processing: processingAdd, errors: errorsAdd, reset: resetAdd } = useForm({
        name: '',
        faculty_name: '',
        photo: null as File | null,
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

    // Handler submit untuk form edit - gunakan router dengan manual FormData
    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingRoom) return;

        // Buat FormData manual
        const formData = new FormData();
        formData.append('name', editData.name);
        formData.append('faculty_name', editData.faculty_name);
        formData.append('capacity', editData.capacity.toString());
        formData.append('status', editData.status);
        formData.append('_method', 'PUT'); // Method spoofing

        // Tambahkan photo jika ada dan merupakan File
        if (editData.photo instanceof File) {
            formData.append('photo', editData.photo);
        }

        router.post(`/rooms/${editingRoom.id}`, formData, {
            onSuccess: () => setEditingRoom(null),
            preserveScroll: true,
        });
    };

    // Handler submit untuk form tambah - gunakan FormData
    const handleAddSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/rooms', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                resetAdd();
            },
            preserveScroll: true,
            forceFormData: true, // Paksa menggunakan FormData
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
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Faculty</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.data.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell>
                                        {room.photo ? (
                                            <img
                                                src={`/storage/${room.photo}`}
                                                alt={room.name}
                                                className="h-12 w-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No photo</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{room.name}</TableCell>
                                    <TableCell>{room.faculty_name}</TableCell>
                                    <TableCell>{room.capacity}</TableCell>
                                    <TableCell>{room.status}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
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

                        {/* MODAL EDIT ROOM - Update bagian Photo */}
                        <div>
                            <Label htmlFor="edit-photo" className="mb-2 block">Photo</Label>
                            <div className="flex items-start gap-3">
                                {/* Preview foto existing atau placeholder */}
                                <div className="flex-shrink-0">
                                    {editData.photo instanceof File ? (
                                        <img
                                            src={URL.createObjectURL(editData.photo)}
                                            alt="Preview"
                                            className="h-20 w-20 object-cover rounded border-2 border-gray-200"
                                        />
                                    ) : editingRoom?.photo && typeof editData.photo === 'string' ? (
                                        <img
                                            src={`/storage/${editingRoom.photo}`}
                                            alt="Current"
                                            className="h-20 w-20 object-cover rounded border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No photo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info di tengah */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        {editData.photo instanceof File && (
                                            <p className="text-sm text-green-600 mb-2">
                                                New file: {editData.photo.name}
                                            </p>
                                        )}

                                    </div>
                                </div>

                                {/* Tombol Choose File di pinggir kanan */}
                                <div className="flex-shrink-0">
                                    <Input
                                        id="edit-photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setEditData('photo', file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="edit-photo"
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                </div>

                            </div>
                            <p className="text-end text-xs text-gray-500">
                                            Max size: 2MB. Formats: JPEG, PNG, JPG, GIF
                                        </p>
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

                        {/* MODAL ADD ROOM - Update bagian Photo */}
                        <div>
                            <Label htmlFor="add-photo" className="mb-2 block">Photo</Label>
                            <div className="flex items-start gap-3">
                                {/* Preview foto baru atau placeholder */}
                                <div className="flex-shrink-0">
                                    {addData.photo instanceof File ? (
                                        <img
                                            src={URL.createObjectURL(addData.photo)}
                                            alt="Preview"
                                            className="h-20 w-20 object-cover rounded border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No photo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info di tengah */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        {addData.photo instanceof File && (
                                            <p className="text-sm text-green-600 mb-2">
                                                Selected: {addData.photo.name}
                                            </p>
                                        )}

                                    </div>
                                </div>

                                {/* Tombol Choose File di pinggir kanan */}
                                <div className="flex-shrink-0">
                                    <Input
                                        id="add-photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setAddData('photo', file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="add-photo"
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                </div>
                            </div>
                            <p className="text-end text-xs text-gray-500">
                                            Max size: 2MB. Formats: JPEG, PNG, JPG, GIF
                                        </p>
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
