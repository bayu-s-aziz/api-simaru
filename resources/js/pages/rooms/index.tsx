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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Plus, ChevronDown, Check, X, FileText } from 'lucide-react';
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
        href: dashboard().url,
    },
];

// Definisikan tipe data Room
interface Room {
    id: number;
    name: string;
    faculty_name: string;
    photo: string | null;
    photo_url?: string | null; // tambah
    capacity: number;
    status: 'draft' | 'approved' | 'rejected';
}

// Definisikan tipe Props untuk komponen
interface RoomIndexProps {
    rooms: {
        current_page: number;
        data: Room[];
    };
}

export default function RoomIndex({ rooms }: RoomIndexProps) {

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

    type RoomStatus = 'draft' | 'approved' | 'rejected';

    const { data: editData, setData: setEditData, patch, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        faculty_name: '',
        photo: null as File | string | null,
        capacity: 0,
        status: 'draft' as RoomStatus,
    });

    const { data: addData, setData: setAddData, post, processing: processingAdd, errors: errorsAdd, reset: resetAdd } = useForm({
        name: '',
        faculty_name: '',
        photo: null as File | null,
        capacity: 0,
        status: 'draft' as RoomStatus,
    });

    const { delete: deleteRoom, processing: processingDelete } = useForm();

    // Quick status change handler
    const handleQuickStatusChange = (room: Room, newStatus: RoomStatus) => {
        router.patch(`/rooms/${room.id}`, {
            name: room.name,
            faculty_name: room.faculty_name,
            capacity: room.capacity,
            status: newStatus,
        }, {
            preserveScroll: true,
            only: ['rooms'],
        });
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: RoomStatus) => {
        switch (status) {
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'draft': return 'secondary';
            default: return 'secondary';
        }
    };

    // Get status icon
    const getStatusIcon = (status: RoomStatus) => {
        switch (status) {
            case 'approved': return <Check className="h-3 w-3 mr-1" />;
            case 'rejected': return <X className="h-3 w-3 mr-1" />;
            case 'draft': return <FileText className="h-3 w-3 mr-1" />;
            default: return null;
        }
    };

    useEffect(() => {
        if (editingRoom) {
            setEditData({
                name: editingRoom.name,
                faculty_name: editingRoom.faculty_name,
                photo: editingRoom.photo || '',
                capacity: editingRoom.capacity,
                status: editingRoom.status,
            });
        } else {
            resetEdit();
        }
    }, [editingRoom]);

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingRoom) return;

        const formData = new FormData();
        formData.append('name', editData.name);
        formData.append('faculty_name', editData.faculty_name);
        formData.append('capacity', editData.capacity.toString());
        formData.append('status', editData.status);
        formData.append('_method', 'PUT');

        if (editData.photo instanceof File) {
            formData.append('photo', editData.photo);
        }

        router.post(`/rooms/${editingRoom.id}`, formData, {
            onSuccess: () => setEditingRoom(null),
            preserveScroll: true,
        });
    };

    const handleAddSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/rooms', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                resetAdd();
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingRoom) return;

        deleteRoom(`/rooms/${deletingRoom.id}`, {
            onSuccess: () => setDeletingRoom(null),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

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
                                              src={room.photo_url ?? undefined}
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
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-[120px] justify-between gap-1 px-2">
                                                    <Badge variant={getStatusBadgeVariant(room.status)} className="gap-1">
                                                        {getStatusIcon(room.status)}
                                                        <span className="capitalize">{room.status}</span>
                                                    </Badge>
                                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-[120px]">
                                                <DropdownMenuItem
                                                    onClick={() => handleQuickStatusChange(room, 'draft')}
                                                    disabled={room.status === 'draft'}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Draft
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleQuickStatusChange(room, 'approved')}
                                                    disabled={room.status === 'approved'}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approved
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleQuickStatusChange(room, 'rejected')}
                                                    disabled={room.status === 'rejected'}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Rejected
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
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

            {/* MODAL EDIT */}
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
                            <Label htmlFor="edit-photo" className="mb-2 block">Photo</Label>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    {editData.photo instanceof File ? (
                                        <img
                                            src={URL.createObjectURL(editData.photo)}
                                            alt="Preview"
                                            className="h-20 w-20 object-cover rounded border-2 border-gray-200"
                                        />
                                    ) : editingRoom?.photo && typeof editData.photo === 'string' ? (
                                        <img
                                            src={editingRoom.photo_url ?? undefined}
                                            alt="Current"
                                            className="h-20 w-20 object-cover rounded border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No photo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    {editData.photo instanceof File && (
                                        <p className="text-sm text-green-600 mb-2">
                                            New file: {editData.photo.name}
                                        </p>
                                    )}
                                </div>

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

            {/* MODAL ADD */}
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
                            <Label htmlFor="add-photo" className="mb-2 block">Photo</Label>
                            <div className="flex items-start gap-3">
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
                                <div className="flex-1 flex flex-col justify-between">
                                    {addData.photo instanceof File && (
                                        <p className="text-sm text-green-600 mb-2">
                                            Selected: {addData.photo.name}
                                        </p>
                                    )}
                                </div>
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

            {/* DIALOG DELETE */}
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
