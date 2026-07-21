import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { LayoutDashboard, FolderCode, Plus, LogOut, Terminal, Search, Info, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navigation = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", href: "/projects", icon: FolderCode },
    { title: "Search", href: "/search", icon: Search },
    { title: "About", href: "/about", icon: Info },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-background font-sans">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
              <Terminal className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-mono tracking-tight">XbarzForge</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href))}>
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/projects/new" className="flex items-center gap-3 w-full text-primary hover:text-primary">
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors text-left">
                    <Avatar className="h-8 w-8 rounded-md border border-border">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="rounded-md bg-secondary text-xs">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm font-medium leading-none truncate">
                        {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] border-border bg-card">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: basePath || "/" })} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-background relative">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <footer className="shrink-0 border-t border-border/50 py-4 text-center text-xs text-muted-foreground font-mono">
            © 2026 XbarzForge | Built by Abdulrahman Adisa Amuda (RahmanXBarz) | Created for OpenAI Build Week 2026
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}