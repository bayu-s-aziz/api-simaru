import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Users,
    Building2,
    Calendar,
    CheckCircle,
    FileText,
    XCircle,
    TrendingUp,
    Activity,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
    stats: {
        totalUsers: number;
        totalRooms: number;
        totalBookings: number;
        approvedRooms: number;
        draftRooms: number;
        rejectedRooms: number;
    };
    charts: {
        roomStatus: Array<{ name: string; value: number; fill: string }>;
        mainStats: Array<{ name: string; value: number; fill: string }>;
        bookingTrends: Array<{ date: string; bookings: number }>;
        userTrends: Array<{ date: string; users: number }>;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats, charts }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4 md:p-6">
                {/* Top Statistics Cards */}
                <div>
                    <h1 className="mb-4 text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mb-6">
                        Welcome back! Here's what's happening in your system today.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Total Users Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Users
                                </CardTitle>
                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">
                                    {stats.totalUsers}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total registered users
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Rooms Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Rooms
                                </CardTitle>
                                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                    <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-600">
                                    {stats.totalRooms}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Available rooms
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Bookings Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Bookings
                                </CardTitle>
                                <div className="rounded-lg bg-pink-100 p-2 dark:bg-pink-900/30">
                                    <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-pink-600">
                                    {stats.totalBookings}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All bookings
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Statistics Bar Chart */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                System Overview
                            </CardTitle>
                            <CardDescription>
                                Main statistics visualization
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.mainStats}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-sidebar-border/50"
                                    />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Room Status Pie Chart */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Room Status Distribution
                            </CardTitle>
                            <CardDescription>
                                Breakdown of room approval status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={charts.roomStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) =>
                                            `${name}: ${value}`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {charts.roomStatus.map((entry) => (
                                            <Cell
                                                key={`cell-${entry.name}`}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Trends Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Booking Trends */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Booking Trends
                            </CardTitle>
                            <CardDescription>
                                Last 7 days booking activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.bookingTrends}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-sidebar-border/50"
                                    />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="#ec4899"
                                        strokeWidth={2}
                                        dot={{ fill: '#ec4899', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* User Registration Trends */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Registration Trends
                            </CardTitle>
                            <CardDescription>
                                Last 7 days registration activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.userTrends}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-sidebar-border/50"
                                    />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Room Status Detailed Cards */}
                <div>
                    <h2 className="mb-4 text-xl font-bold">Room Status Details</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Approved Rooms Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Approved Rooms
                                </CardTitle>
                                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.approvedRooms}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Rooms approved for use
                                </p>
                            </CardContent>
                        </Card>

                        {/* Draft Rooms Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Draft Rooms
                                </CardTitle>
                                <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                                    <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-600">
                                    {stats.draftRooms}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Rooms waiting approval
                                </p>
                            </CardContent>
                        </Card>

                        {/* Rejected Rooms Card */}
                        <Card className="border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Rejected Rooms
                                </CardTitle>
                                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">
                                    {stats.rejectedRooms}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Rooms rejected
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
