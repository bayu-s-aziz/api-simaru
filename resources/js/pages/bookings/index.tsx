import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Pencil, Trash2, Plus } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Booking Management',
    href: dashboard().url,
  },
];

// Helper to format datetime for input fields
const toLocalDateTime = (dateString: string) => {
  const dt = new Date(dateString);
  return format(dt, "yyyy-MM-dd'T'HH:mm");
};

export default function BookingIndex({
  bookings,
  rooms
}: {
  bookings: { data: any[] };
  rooms: { id: number; name: string }[]
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Form for Adding Booking
  const addForm = useForm({
    tgl: '',
    customer_name: '',
    booking_details: [{ room_id: '', start: '', end: '' }],
  });

  // Form for Editing Booking
  const editForm = useForm({
    tgl: '',
    customer_name: '',
    booking_details: [] as { id?: number; room_id: string; start: string; end: string }[],
  });

  // Helper to update booking details dates when tgl changes
  const updateBookingDetailsDates = (newDate: string, details: any[]) => {
    if (!newDate) return details;
    return details.map(detail => ({
      ...detail,
      start: detail.start ? `${newDate}T${detail.start.split('T')[1] || '08:00'}` : '',
      end: detail.end ? `${newDate}T${detail.end.split('T')[1] || '17:00'}` : '',
    }));
  };

  // Add a new room row in create form
  const addRoomRow = () => {
    const newDetail = { room_id: '', start: '', end: '' };
    // If tgl is set, use it for the new detail
    if (addForm.data.tgl) {
      newDetail.start = `${addForm.data.tgl}T08:00`;
      newDetail.end = `${addForm.data.tgl}T17:00`;
    }
    addForm.setData('booking_details', [
      ...addForm.data.booking_details,
      newDetail
    ]);
  };

  // Remove a room row in create form
  const removeRoomRow = (index: number) => {
    const updated = [...addForm.data.booking_details];
    updated.splice(index, 1);
    addForm.setData('booking_details', updated);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post('/bookings', {
      onSuccess: () => {
        setOpenAdd(false);
        addForm.reset();
        addForm.setData({
          tgl: '',
          customer_name: '',
          booking_details: [{ room_id: '', start: '', end: '' }],
        });
      },
      preserveScroll: true,
    });
  };

  // Handle Edit Click
  const handleEditClick = (booking: any) => {
    setSelectedBooking(booking);
    const details = booking.booking_details.map((d: any) => ({
      id: d.id,
      room_id: d.room_id.toString(),
      start: toLocalDateTime(d.start),
      end: toLocalDateTime(d.end),
    }));
    editForm.setData({
      tgl: booking.tgl,
      customer_name: booking.customer_name || '',
      booking_details: details,
    });
    setOpenEdit(true);
  };

  // Add a new detail row in edit form
  const addEditRoomRow = () => {
    const newDetail: { id?: number; room_id: string; start: string; end: string } = { room_id: '', start: '', end: '' };
    // If tgl is set, use it for the new detail
    if (editForm.data.tgl) {
      newDetail.start = `${editForm.data.tgl}T08:00`;
      newDetail.end = `${editForm.data.tgl}T17:00`;
    }
    editForm.setData('booking_details', [
      ...editForm.data.booking_details,
      newDetail
    ]);
  };

  // Remove a detail row in edit form
  const removeEditRoomRow = (index: number) => {
    const updated = [...editForm.data.booking_details];
    updated.splice(index, 1);
    editForm.setData('booking_details', updated);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editForm.put(`/bookings/${selectedBooking.id}`, {
      onSuccess: () => {
        setOpenEdit(false);
      },
      preserveScroll: true,
    });
  };

  // Handle Delete
  const handleDeleteClick = (booking: any) => {
    setSelectedBooking(booking);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    router.delete(`/bookings/${selectedBooking.id}`, {
      onSuccess: () => setOpenDelete(false),
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Booking Management" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Ruangan (Jumlah)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.data.map((booking, index) => (
                <TableRow key={booking.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{booking.tgl}</TableCell>
                  <TableCell>{booking.customer_name || '–'}</TableCell>
                  <TableCell>{booking.user?.name || '–'}</TableCell>
                  <TableCell>{booking.booking_details?.length || 0} ruangan</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(booking)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(booking)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {bookings.data.length === 0 && (
              <TableCaption>Tidak ada data booking.</TableCaption>
            )}
          </Table>
        </div>
      </div>

      {/* Modal Tambah Booking */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>
              Masukkan detail booking baru di bawah ini. Klik "Add Booking" untuk menyimpan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="add-tgl">Tanggal Booking</Label>
              <Input
                id="add-tgl"
                type="date"
                value={addForm.data.tgl}
                onChange={e => {
                  const newDate = e.target.value;
                  addForm.setData('tgl', newDate);
                  // Update all booking details dates
                  if (newDate) {
                    const updatedDetails = addForm.data.booking_details.map(detail => ({
                      ...detail,
                      start: detail.start ? `${newDate}T${detail.start.split('T')[1] || '08:00'}` : `${newDate}T08:00`,
                      end: detail.end ? `${newDate}T${detail.end.split('T')[1] || '17:00'}` : `${newDate}T17:00`,
                    }));
                    addForm.setData('booking_details', updatedDetails);
                  }
                }}
                className="mt-1"
                required
              />
              <InputError message={addForm.errors.tgl} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="add-customer">Nama Peminjam (Opsional)</Label>
              <Input
                id="add-customer"
                value={addForm.data.customer_name || ''}
                onChange={e => addForm.setData('customer_name', e.target.value)}
                className="mt-1"
              />
              <InputError message={addForm.errors.customer_name} className="mt-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Detail Ruangan</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRoomRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Ruangan
                </Button>
              </div>

              {addForm.data.booking_details.map((detail, idx) => (
                <div key={idx} className="space-y-2 p-3 border rounded">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-10">
                      <Label className="text-xs">Ruangan</Label>
                      <Select
                        value={detail.room_id}
                        onValueChange={(value) =>
                          addForm.setData('booking_details', addForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, room_id: value } : d
                          ))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih ruangan" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {addForm.data.booking_details.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRoomRow(idx)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Tanggal</Label>
                      <Input
                        type="date"
                        value={detail.start ? detail.start.split('T')[0] : addForm.data.tgl}
                        onChange={e => {
                          const newDate = e.target.value;
                          const startTime = detail.start ? detail.start.split('T')[1] || '08:00' : '08:00';
                          const endTime = detail.end ? detail.end.split('T')[1] || '17:00' : '17:00';
                          addForm.setData('booking_details', addForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, start: `${newDate}T${startTime}`, end: `${newDate}T${endTime}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Waktu Mulai</Label>
                      <Input
                        type="time"
                        value={detail.start ? detail.start.split('T')[1] || '' : ''}
                        onChange={e => {
                          const date = detail.start ? detail.start.split('T')[0] : addForm.data.tgl;
                          addForm.setData('booking_details', addForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, start: `${date}T${e.target.value}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Waktu Selesai</Label>
                      <Input
                        type="time"
                        value={detail.end ? detail.end.split('T')[1] || '' : ''}
                        onChange={e => {
                          const date = detail.end ? detail.end.split('T')[0] : addForm.data.tgl;
                          addForm.setData('booking_details', addForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, end: `${date}T${e.target.value}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpenAdd(false); addForm.reset(); }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addForm.processing}>
                {addForm.processing ? 'Adding...' : 'Add Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Booking */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Ubah data booking di bawah ini. Klik "Save Changes" untuk menyimpan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-tgl">Tanggal Booking</Label>
              <Input
                id="edit-tgl"
                type="date"
                value={editForm.data.tgl}
                onChange={e => {
                  const newDate = e.target.value;
                  editForm.setData('tgl', newDate);
                  // Update all booking details dates
                  if (newDate) {
                    const updatedDetails = editForm.data.booking_details.map(detail => ({
                      ...detail,
                      start: detail.start ? `${newDate}T${detail.start.split('T')[1] || '08:00'}` : `${newDate}T08:00`,
                      end: detail.end ? `${newDate}T${detail.end.split('T')[1] || '17:00'}` : `${newDate}T17:00`,
                    }));
                    editForm.setData('booking_details', updatedDetails);
                  }
                }}
                className="mt-1"
                required
              />
              <InputError message={editForm.errors.tgl} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="edit-customer">Nama Peminjam (Opsional)</Label>
              <Input
                id="edit-customer"
                value={editForm.data.customer_name || ''}
                onChange={e => editForm.setData('customer_name', e.target.value)}
                className="mt-1"
              />
              <InputError message={editForm.errors.customer_name} className="mt-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Detail Ruangan</Label>
                <Button type="button" size="sm" variant="outline" onClick={addEditRoomRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Ruangan
                </Button>
              </div>

              {editForm.data.booking_details.map((detail, idx) => (
                <div key={idx} className="space-y-2 p-3 border rounded">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-10">
                      <Label className="text-xs">Ruangan</Label>
                      <Select
                        value={detail.room_id}
                        onValueChange={(value) =>
                          editForm.setData('booking_details', editForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, room_id: value } : d
                          ))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih ruangan" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {editForm.data.booking_details.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEditRoomRow(idx)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Tanggal</Label>
                      <Input
                        type="date"
                        value={detail.start ? detail.start.split('T')[0] : editForm.data.tgl}
                        onChange={e => {
                          const newDate = e.target.value;
                          const startTime = detail.start ? detail.start.split('T')[1] || '08:00' : '08:00';
                          const endTime = detail.end ? detail.end.split('T')[1] || '17:00' : '17:00';
                          editForm.setData('booking_details', editForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, start: `${newDate}T${startTime}`, end: `${newDate}T${endTime}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Waktu Mulai</Label>
                      <Input
                        type="time"
                        value={detail.start ? detail.start.split('T')[1] || '' : ''}
                        onChange={e => {
                          const date = detail.start ? detail.start.split('T')[0] : editForm.data.tgl;
                          editForm.setData('booking_details', editForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, start: `${date}T${e.target.value}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Waktu Selesai</Label>
                      <Input
                        type="time"
                        value={detail.end ? detail.end.split('T')[1] || '' : ''}
                        onChange={e => {
                          const date = detail.end ? detail.end.split('T')[0] : editForm.data.tgl;
                          editForm.setData('booking_details', editForm.data.booking_details.map((d, i) =>
                            i === idx ? { ...d, end: `${date}T${e.target.value}` } : d
                          ));
                        }}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Delete */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus booking untuk{' '}
              <strong>{selectedBooking?.customer_name || 'User ' + selectedBooking?.user?.name}</strong>?
              Ini juga akan menghapus semua detail ruangannya. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
