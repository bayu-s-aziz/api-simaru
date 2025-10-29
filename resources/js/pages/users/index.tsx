import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: dashboard().url,
    },
];

export default function UserIndex({users} : {users: { current_page: number, data: any[]}}) {

    console.log(users);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    No
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className='text-center'>
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                <>
                                {users.data.map((user, index) => (
                                        <TableRow>
                                            <TableCell className="font-medium">
                                                {user.id}
                                            </TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className='capitalize'>
                                                {user.role}
                                            </TableCell>
                                            <TableCell className='text-center'>Action</TableCell>
                                        </TableRow>
                                ))}
                                </>
                            ):(
                                <TableCaption>A list of your recent invoices.</TableCaption>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
