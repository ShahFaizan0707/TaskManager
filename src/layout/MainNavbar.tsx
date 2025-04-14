import { Button } from "@/components/ui/button";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
    Search,
    User,
    ChevronRight,
    Bot
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import AIRecommendations from "@/components/AIDash";

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const shouldShowDot = Math.random() < 0.7;

    const pathSegments = location.pathname
        .split('/')
        .filter(segment => segment !== '');

    // Render custom breadcrumbs based on current path
    const renderBreadcrumbs = () => {
        // Don't render breadcrumbs if we're on the home page
        if (pathSegments.length === 0) {
            return null;
        }

        return (
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    {/* Home is always the first item */}
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {/* For the /login path */}
                    {pathSegments[0] === 'login' && (
                        <BreadcrumbItem>
                            <span className="mx-2 text-muted-foreground">
                                <ChevronRight className="h-4 w-4" />
                            </span>
                            <BreadcrumbLink asChild>
                                <Link to="/login">Login</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    )}

                    {/* For /project/:projectId path */}
                    {pathSegments[0] === 'project' && pathSegments.length >= 2 && (
                        <BreadcrumbItem>
                            <span className="mx-2 text-muted-foreground">
                                <ChevronRight className="h-4 w-4" />
                            </span>
                            <BreadcrumbLink asChild>
                                <Link to={`/project/${pathSegments[1]}`}>Current Project</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    )}

                    {/* For /project/:projectId/tasks/:taskId path */}
                    {pathSegments[0] === 'project' && pathSegments.length >= 4 && pathSegments[2] === 'tasks' && (
                        <BreadcrumbItem>
                            <span className="mx-2 text-muted-foreground">
                                <ChevronRight className="h-4 w-4" />
                            </span>
                            <BreadcrumbLink asChild>
                                <Link to={`/project/${pathSegments[1]}/tasks/${pathSegments[3]}`}>Current Task</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        );
    };

    return (
        <div className="flex h-18 items-center justify-between border-b border-border bg-card px-4 lg:px-6 z-10 relative">
            <div className="flex items-center gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M9 11L4.5 6.5L3.08 7.92L9 13.83L21 1.92L19.58 0.5L9 11ZM3 17V21H7L17.29 10.71L13.29 6.71L3 17Z" />
                    </svg>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Taskify</span>
                </Link>

                {/* Custom Breadcrumbs */}
                {renderBreadcrumbs()}
            </div>

            {/* Right-side options */}
            <div className="flex items-center space-x-2">
                {/* Mobile Search Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Search className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Search
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {isAuthenticated && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bot className="h-10 w-10" />
                                {shouldShowDot && (
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 " />
                                )}
                            </Button>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AIRecommendations />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}


                {/* Account Dropdown */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {isAuthenticated ? (
                                        <>
                                            <DropdownMenuItem onClick={() => logout()}>
                                                Log out
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem onClick={() => navigate("/login")}>
                                                Login
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                            Account
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {/* Theme Toggle */}
                <ModeToggle />
            </div>
        </div>
    );
}