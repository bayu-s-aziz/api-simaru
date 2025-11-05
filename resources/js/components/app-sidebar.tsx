import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, Calendar, Folder, LayoutGrid, User2 } from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect, useState } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'User Management',
        href: '/users',
        icon: User2,
    },
    {
        title: 'Room Management',
        href: '/rooms',
        icon: Building2,
    },
    {
        title: 'Booking Management',
        href: '/bookings',
        icon: Calendar,
    },
];

const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    // {
    //     title: 'User Management',
    //     href: '/users',
    //     icon: LayoutGrid,
    // },
    // {
    //     title: 'Room Management',
    //     href: '/rooms',
    //     icon: LayoutGrid,
    // },
    // {
    //     title: 'Booking Management',
    //     href: '/bookings',
    //     icon: LayoutGrid,
    // },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    // {
    //     title: 'User Management',
    //     href: '/users',
    //     icon: LayoutGrid,
    // },
    // {
    //     title: 'Room Management',
    //     href: '/rooms',
    //     icon: LayoutGrid,
    // },
    // {
    //     title: 'Booking Management',
    //     href: '/bookings',
    //     icon: LayoutGrid,
    // },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const [roleNavItems, setRoleNavItems] = useState<NavItem[]>([]);

    useEffect(() => {
        if(auth.user.role == 'admin'){
            setRoleNavItems(adminNavItems)
        }else if(auth.user.role == 'user'){
            setRoleNavItems(userNavItems)
        }else if(auth.user.role == 'manager'){
            setRoleNavItems(mainNavItems)
        }else{
            setRoleNavItems([])
        }
    }, []);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={roleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
