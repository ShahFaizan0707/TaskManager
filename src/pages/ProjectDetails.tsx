import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, UserPlus, CalendarDays, Minus, DoorOpen } from 'lucide-react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { IProject, ITask, IProjectMember, IUser, TaskStatus } from '@/lib/types/project';
import { TaskStatusLabels, TaskStatusColors, formatDate } from '@/lib/types/constants';
import { getProjectById, addProjectMember, removeProjectMember } from '@/lib/api/projectApi';
import { getProjectMembers, getNonProjectMembers, addMultipleProjectMembers } from '@/lib/api/projectMemberApi';
import { getProjectTasks, updateTaskStatus } from '@/lib/api/taskApi';
import websocketService from '@/lib/api/websocketService';
import TaskCreateDialog from '../components/Task/TaskCreateDialog';
import { useAuth } from '@/context/AuthContext';
import { SortableTaskCard } from '../components/Task/SortableTaskCard';
import { DroppableContainer } from '../components/Task/DroppableContainer';
import EditTaskDialog from '@/components/Task/EditTaskDialog';
import DeleteTaskConfirmation from '@/components/Task/DeleteTaskDialog';
import { toast } from 'sonner';


const ProjectDetailPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<IProject | null>(null);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [members, setMembers] = useState<IProjectMember[]>([]);
    const [activeMembers, setActiveMembers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addingMembers, setAddingMembers] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [updatingTaskStatus, setUpdatingTaskStatus] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    // Configure a pointer sensor with a minimal delay
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Use minimal activation delay to make drag responsive
            activationConstraint: {
                delay: 50,
                tolerance: 5,
            },
        })
    );

    // Initial data loading
    useEffect(() => {
        if (!projectId || !user?.id || isLoading) return;

        // Set current user ID from context
        if (user?.id) {
            setCurrentUserId(user.id);
        }

        const loadProjectData = async () => {
            try {
                setLoading(true);

                // Fetch project details
                const projectData = await getProjectById(projectId);
                setProject(projectData);

                // Fetch project members
                const membersData = await getProjectMembers(projectId);
                setMembers(membersData);

                // Fetch project tasks
                const tasksData = await getProjectTasks(projectId);
                setTasks(tasksData);

                // Set loading to false once essential data is loaded
                setLoading(false);

                // Handle WebSocket connection separately
                try {
                    await websocketService.connect(Number(user?.id), Number(projectId));
                    websocketService.joinProject(Number(projectId));

                    // Get active users in the project
                    const activeUsers = await websocketService.getActiveProjectUsers(projectId);
                    setActiveMembers(activeUsers);
                } catch (wsErr) {
                    console.error('WebSocket connection error:', wsErr);
                    // Don't set error state here, just log it - we can continue without WebSocket
                }
            } catch (err) {
                console.error('Error loading project data:', err);
                setError('Failed to load project. Please try again.');
                setLoading(false);
            }
        };

        loadProjectData();

        // WebSocket event listeners
        websocketService.on('USER_JOINED_PROJECT', (data) => {
            toast.success(`${data.user.name} joined the project`);
            setActiveMembers(prev => [...prev, data.user]);
        });

        websocketService.on('USER_LEFT_PROJECT', (data) => {
            toast.success(`${data.user.name} left the project`);
            setActiveMembers(prev => prev.filter(user => user.id !== data.userId));
        });

        websocketService.on('TASK_UPDATED', (data) => {
            setTasks(prev => prev.map(task => task.id === data.id ? data : task));
        });

        websocketService.on('TASK_CREATED', (data) => {
            toast.success(`Task "${data.title}" created`);
            setTasks(prev => [...prev, data]);
        });

        websocketService.on('TASK_DELETED', (data) => {
            setTasks(prev => prev.filter(task => task.id !== data.id));
        });
        websocketService.on('TASK_STATUS_CHANGE', (data) => {
            toast.success(`Task status changed to ${data.status}`);
          })

        // Cleanup
        return () => {
            try {
                websocketService.leaveProject();
                websocketService.removeAllListeners('USER_JOINED_PROJECT');
                websocketService.removeAllListeners('USER_LEFT_PROJECT');
                websocketService.removeAllListeners('TASK_UPDATED');
                websocketService.removeAllListeners('TASK_CREATED');
                websocketService.removeAllListeners('TASK_DELETED');
                websocketService.removeAllListeners('TASK_STATUS_CHANGE');
            } catch (error) {
                console.error('Error cleaning up WebSocket:', error);
            }
        };
    }, [projectId, user]);

    // Update currentUserId whenever the user context changes
    useEffect(() => {
        if (user?.id) {
            setCurrentUserId(user.id);
        }
    }, [user]);

    const handleTaskCreated = async () => {
        try {
            // Refresh tasks after a new task is created
            if (!projectId) return;
            const tasksData = await getProjectTasks(projectId);
            setTasks(tasksData);
        } catch (err) {
            console.error('Error refreshing tasks:', err);
            setError('Failed to refresh tasks.');
        }
    };

    // Load available users (non-members) when dialog opens
    const handleOpenAddMembersDialog = async () => {
        try {
            if (!projectId) return;

            // Initial load with empty search
            const nonMembers = await getNonProjectMembers(projectId);
            setAvailableUsers(nonMembers);
            setOpenDialog(true);
        } catch (err) {
            console.error('Error fetching available users:', err);
            setError('Failed to load available users.');
        }
    };

    // Add this function to handle search
    const handleSearchUsers = async (query: string) => {
        try {
            if (!projectId) return;
            setSearchQuery(query);

            // Only search if we have at least 2 characters
            if (query.length >= 2) {
                const results = await getNonProjectMembers(projectId, query);
                setAvailableUsers(results);
            } else if (query.length === 0) {
                // Reset to all available users when search is cleared
                const nonMembers = await getNonProjectMembers(projectId);
                setAvailableUsers(nonMembers);
            }
        } catch (err) {
            console.error('Error searching users:', err);
        }
    };
    // Add a single member by email
    const handleAddMember = async () => {
        if (!projectId || !newMemberEmail.trim()) return;

        try {
            await addProjectMember(projectId, newMemberEmail);
            const updatedMembers = await getProjectMembers(projectId);
            setMembers(updatedMembers);
            setNewMemberEmail('');
        } catch (err) {
            console.error('Error adding member:', err);
            setError('Failed to add member. Please check the email and try again.');
        }
    };

    // Add multiple members at once
    const handleAddSelectedMembers = async () => {
        if (!projectId || selectedUsers.length === 0) return;

        try {
            setAddingMembers(true);
            const emails = selectedUsers.map(id => {
                const user = availableUsers.find(u => u.id === Number(id));
                return user ? user.email : '';
            }).filter(email => email);

            await addMultipleProjectMembers(projectId, emails);

            // Refresh members list
            const updatedMembers = await getProjectMembers(projectId);
            setMembers(updatedMembers);

            // Close dialog and reset state
            setSelectedUsers([]);
            setOpenDialog(false);
        } catch (err) {
            console.error('Error adding members:', err);
            setError('Failed to add members. Please try again.');
        } finally {
            setAddingMembers(false);
        }
    };

    // Toggle user selection for batch adding
    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Navigate to task details
    const navigateToTaskDetails = (taskId: number) => {
        navigate(`/project/${projectId}/tasks/${taskId}`);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        try {
            const { active, over } = event;
            if (!over || updatingTaskStatus) return;

            const taskId = Number(active.id);
            const newStatusValue = String(over.id);

            const isValidStatus = Object.values(TaskStatus).includes(newStatusValue as TaskStatus);
            if (!isValidStatus) {
                console.error('Invalid task status:', newStatusValue);
                return;
            }

            const newStatus = newStatusValue as TaskStatus;

            const task = tasks.find(t => t.id === taskId);
            if (!task || task.status === newStatus) return;

            setUpdatingTaskStatus(true);
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: newStatus } : t
            ));
            if (projectId) {
                await updateTaskStatus(taskId.toString(), newStatus);
            }
        } catch (err) {
            console.error('Error in handleDragEnd:', err);
            setTasks(prev => [...prev]);
            setError('An error occurred. Please try again.');
        } finally {
            setUpdatingTaskStatus(false);
        }
    };

    const handleEditTask = (taskId: string) => {
        const taskToEdit = tasks.find(task => task.id === Number(taskId));
        if (taskToEdit) {
            setSelectedTask(taskToEdit);
            setIsEditDialogOpen(true);
        }
    };
    // Handler for delete button
    const handleDeleteTask = (taskId: string) => {
        const taskToDelete = tasks.find(task => task.id === Number(taskId));
        if (taskToDelete) {
            setSelectedTask(taskToDelete);
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleTaskUpdated = async () => {
        try {
            // Refresh tasks after a task is updated
            if (!projectId) return;
            const tasksData = await getProjectTasks(projectId);
            setTasks(tasksData);
        } catch (err) {
            console.error('Error refreshing tasks:', err);
            setError('Failed to refresh tasks.');
        }
    };

    const handleTaskDeleted = async () => {
        try {
            // Refresh tasks after a task is deleted
            if (!projectId) return;
            const tasksData = await getProjectTasks(projectId);
            setTasks(tasksData);
        } catch (err) {
            console.error('Error refreshing tasks:', err);
            setError('Failed to refresh tasks.');
        }
    };


    // Check if current user is the project creator
    const isCreator = project?.creatorId === currentUserId;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading project...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
                <p className="mb-4">The requested project could not be found.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    // Filter tasks by status - only show REVIEW status to project creator
    const tasksByStatus = {
        ...(isCreator ? { [TaskStatus.TODO]: tasks.filter(task => task.status === TaskStatus.TODO) } : {}),
        [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
        [TaskStatus.REVIEW]: tasks.filter(task => task.status === TaskStatus.REVIEW),
        [TaskStatus.COMPLETED]: tasks.filter(task => task.status === TaskStatus.COMPLETED)
    };

    // Calculate completion percentage
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const totalTasks = tasks.length || 1; // Prevent division by zero
    const completionPercentage = (completedTasks / totalTasks) * 100;

    const handleDeleteMember = async (userId: string) => {
        try {
            const confirmed = confirm(`Are you sure you want to remove this member from the project? This will also purge the assigned tasks for this user.`);
            if (!confirmed) return;
    
            console.log(`Delete member with ID: ${userId}`);
            const deletedUser = await removeProjectMember(String(projectId), userId);
    
            if (deletedUser.removed) {
                toast.success("Member removed successfully");
                setMembers(prev => prev.filter(member => member.userId !== userId));
            }
        } catch (error) {
            toast.error("Failed to remove member");
            console.error(error);
        }
    };
    
    async function handleLeaveProject() {
        try {
            if (!user?.id) return;
            const confirmed = confirm(`Are you sure you want to leave this project?`);
            if (!confirmed) return;
    
            const deletedUser = await removeProjectMember(String(projectId), String(user.id));
            
            if (deletedUser.removed) {
                toast.success("You have left the project");
                navigate('/projects');
            }
        } catch (error) {
            toast.error("Failed to leave the project");
            console.error(error);
        }
    }
    
    return (
        <div className="container mx-auto py-6 px-4">
            {/* Project Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-gray-500 mt-1">{project.description || 'No description provided'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        <span>Created: {formatDate(project.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>Updated: {formatDate(project.updatedAt)}</span>
                        <span className="mx-2">•</span>
                        <span>Creator: {project.creator?.name}</span>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                    {!isCreator && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLeaveProject}
                            >
                                <DoorOpen className="h-4 w-4 mr-1" /> Leave Project
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTaskDialog(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" /> New Task
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{completedTasks}/{totalTasks} tasks completed</span>
                    </div>
                    <div className="w-full">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-green-500 rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Project Members */}
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Project Members</CardTitle>
                        <CardDescription>Team members with access to this project</CardDescription>
                    </div>
                    {isCreator && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenAddMembersDialog}
                        >
                            <UserPlus className="h-4 w-4 mr-1" /> Add Member
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                            <div
                                key={member.id}
                                className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 relative"
                            >
                                {project?.creatorId !== member.userId && (
                                    <button
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                                        onClick={() => handleDeleteMember(member.userId)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                )}
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`} alt={member.user.name} />
                                    <AvatarFallback>{member.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{member.user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</div>
                                </div>
                                {activeMembers.some(active => String(active.id) === String(member.userId)) && (
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                                        Online
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Section - Kanban Layout with DnD */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Tasks</h2>

                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                            <DroppableContainer
                                key={status}
                                id={status as TaskStatus}
                                title={TaskStatusLabels[status as TaskStatus]}
                                color={TaskStatusColors[status as TaskStatus]}
                                count={statusTasks.length}
                            >
                                <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1 py-1">
                                    <SortableContext
                                        items={statusTasks.map(task => task.id.toString())}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {statusTasks.length === 0 ? (
                                            <div className="text-center text-gray-500 py-3">
                                                No tasks
                                            </div>
                                        ) : (
                                            statusTasks.map(task => (
                                                <SortableTaskCard
                                                    key={task.id}
                                                    id={task.id.toString()}
                                                    task={task}
                                                    onViewDetails={() => navigateToTaskDetails(task.id)}
                                                    onEdit={() => handleEditTask(String(task.id))}
                                                    onDelete={() => handleDeleteTask(String(task.id))}
                                                />
                                            ))
                                        )}
                                    </SortableContext>
                                </div>
                            </DroppableContainer>
                        ))}
                    </div>
                </DndContext>
            </div>

            {/* Add Member Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Project Members</DialogTitle>
                        <DialogDescription>
                            Invite users to join this project
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="Search by name or email"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchUsers(e.target.value)}
                            />
                            <Button onClick={handleAddMember} size="sm">
                                Add
                            </Button>
                        </div>

                        <Separator className="my-4" />

                        <div>
                            <h4 className="text-sm font-medium mb-2">Or select from available users:</h4>
                            {availableUsers.length === 0 ? (
                                <p className="text-sm text-gray-500">No available users found</p>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {availableUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${selectedUsers.includes(String(user.id)) ? 'bg-primary/10' : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => toggleUserSelection(String(user.id))}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(String(user.id))}
                                                onChange={() => { }}
                                                className="h-4 w-4"
                                            />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} />
                                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddSelectedMembers}
                            disabled={selectedUsers.length === 0 || addingMembers}
                        >
                            {addingMembers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Selected Members
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Task Create Dialog */}
            <TaskCreateDialog
                open={showTaskDialog}
                onOpenChange={setShowTaskDialog}
                onTaskCreated={handleTaskCreated}
            />
            <EditTaskDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={selectedTask}
                onTaskUpdated={handleTaskUpdated}  // Add this prop
            />

            <DeleteTaskConfirmation
                isOpen={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                task={selectedTask}
                onTaskDeleted={handleTaskDeleted}
            />
        </div>
    );
};

export default ProjectDetailPage;