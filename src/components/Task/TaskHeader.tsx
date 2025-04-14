import React, { useState, useEffect } from 'react';
import {
    ITask,
    TaskStatus,
    IProjectMember
} from '@/lib/types/project';
import { assignTask, unassignUser } from '@/lib/api/taskApi';
import { getProjectMembers } from '@/lib/api/projectMemberApi';
import { TaskStatusLabels, TaskStatusColors, TaskPriorityLabels, TaskPriorityColors, formatDate } from '@/lib/types/constants';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

// Assignees Section Component
const AssigneesSection: React.FC<{ task: ITask; isCreator: boolean }> = ({ task, isCreator }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const [assignmentOpen, setAssignmentOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>(
        task.assignments?.map(a => a.userId) || []
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [projectMembers, setProjectMembers] = useState<IProjectMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [assignments, setAssignments] = useState(task.assignments || []);

    // Load both project members and non-project members when popup opens
    useEffect(() => {
        if (assignmentOpen && projectId) {
            setIsLoading(true);

            // Fetch project members first
            getProjectMembers(String(projectId))
                .then(members => {
                    setProjectMembers(members);
                })
                .catch(error => {
                    console.error('Failed to fetch members:', error);
                    toast.error('Failed to load users');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [assignmentOpen, projectId]);

    const handleAssignUsers = async () => {
        try {
            const response = await assignTask(String(task.id), selectedUsers);
            
            if (response && response.assignments) {
                setAssignments(response.assignments);
            } else {
                const updatedAssignments = projectMembers
                    .filter(member => selectedUsers.includes(member.user.id))
                    .map(member => ({
                        id: Date.now() + member.user.id,
                        userId: member.user.id,
                        taskId: task.id,
                        user: member.user,
                        createdAt: new Date().toISOString()
                    }));
                setAssignments(updatedAssignments);
            }
            
            setAssignmentOpen(false);
            toast.success('Users assigned successfully');
        } catch (error) {
            toast.error('Failed to assign users');
        }
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };
    
    // Update handleRemoveUser to correctly call unassignUser API
    const handleRemoveUser = async (userId: number) => {
        try {
            // Call the API to unassign the specific user
            await unassignUser(String(task.id), userId);
            
            // Update local state to remove the user from UI
            setSelectedUsers(prev => prev.filter(id => id !== userId));
            setAssignments(prev => prev.filter(a => a.userId !== userId));
            
            toast.success('User removed from task');
        } catch (error) {
            toast.error('Failed to remove user');
        }
    };

    // Filter members based on search term and exclude already assigned users
    const filteredProjectMembers = projectMembers.filter(member => 
        // First filter by search term
        (member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (member.user.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        // Then exclude users that are already assigned
        !assignments.some(assignment => assignment.userId === member.user.id)
    );

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                {assignments.map(assignment => (
                        <div key={assignment.id} className="relative">
                            <div
                                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm border-2 border-white"
                                title={assignment.user?.name}
                            >
                                {getUserInitials(assignment.user?.name || '')}
                            </div>
                            {isCreator && (
                                <button
                                    onClick={() => handleRemoveUser(assignment.userId)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                                    title={`Remove ${assignment.user?.name}`}
                                >
                                    -
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {isCreator && (
                <button
                    onClick={() => setAssignmentOpen(!assignmentOpen)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <span className="text-gray-600">+</span>
                </button>
                )}
            </div>

            {/* Assignment Popup with Search */}
            {assignmentOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border p-4 z-50">
                    <h3 className="font-medium text-sm mb-3">Assign Team Members</h3>

                    {/* Search input */}
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {/* Loading state */}
                        {isLoading && (
                            <div className="py-3 text-center text-sm text-gray-500">
                                Loading users...
                            </div>
                        )}

                        {/* User list */}
                        {!isLoading && (
                            <>
                                {/* Project Members */}
                                {filteredProjectMembers.length > 0 && (
                                    <div className="mb-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
                                            Project Members
                                        </h4>
                                        {filteredProjectMembers.map(member => (
                                            <label
                                                key={`project-${member.user.id}`}
                                                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(member.user.id)}
                                                    onChange={() => {
                                                        setSelectedUsers(prev =>
                                                            prev.includes(member.user.id)
                                                                ? prev.filter(id => id !== member.user.id)
                                                                : [...prev, member.user.id]
                                                        );
                                                    }}
                                                    className="mr-3"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{member.user.name}</span>
                                                    <span className="text-xs text-gray-500">{member.user.email}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Empty state */}
                                {searchTerm && filteredProjectMembers.length === 0 && (
                                    <div className="py-3 text-center text-sm text-gray-500">
                                        No users found matching "{searchTerm}"
                                    </div>
                                )}

                                {!searchTerm && filteredProjectMembers.length === 0 && (
                                    <div className="py-3 text-center text-sm text-gray-500">
                                        {assignments.length > 0 
                                            ? "All project members are already assigned"
                                            : "No users available"
                                        }
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mt-3 flex justify-end space-x-2">
                        <button
                            onClick={() => setAssignmentOpen(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignUsers}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface TaskHeaderProps {
    task: ITask;
    isCreator: boolean;
    isAssignee: boolean;
    onStatusChange: (status: TaskStatus) => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
    task,
    isCreator,
    isAssignee,
    onStatusChange
}) => {
    
    return (
        <div className="border rounded-lg shadow-sm">
            <div className="px-4 py-3">
                {/* Title, Status and Assignees Row */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h1>

                            {/* Status Change Buttons - now in the header */}
                            <div className="flex items-center ml-4">
                                <span className="text-sm font-medium mr-2">Status:</span>
                                <div className="flex space-x-1">
                                    {isCreator || isAssignee ? (
                                        Object.entries(TaskStatusLabels)
                                            .filter(([key]) => !(isAssignee && !isCreator && key === 'TODO'))
                                            .map(([key, label]) => (
                                                <button
                                                    key={`status-${key}`}
                                                    onClick={() => onStatusChange(key as TaskStatus)}
                                                    className={`px-2 py-1 text-xs rounded-md ${task.status === key
                                                        ? `${TaskStatusColors[key as TaskStatus]} font-medium`
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))
                                    ) : (
                                        <span
                                            className={`px-2 py-1 text-xs rounded-md ${TaskStatusColors[task.status]
                                                } font-medium`}
                                        >
                                            {TaskStatusLabels[task.status]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Assignees Section - Only visible to creator */}
                            <div className="ml-4">
                                <AssigneesSection task={task} isCreator={isCreator} />
                            </div>

                        </div>

                        <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TaskStatusColors[task.status]}`}>
                                {TaskStatusLabels[task.status]}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TaskPriorityColors[task.priority]}`}>
                                {TaskPriorityLabels[task.priority]}
                            </span>
                            {task.dueDate && (
                                <span className="text-xs text-gray-600 dark:text-muted-foreground">
                                    Due: {formatDate(task.dueDate)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {task.project && (
                    <div className="text-xs text-gray-600 dark:text-muted-foreground mt-2">
                        Project: <span className="font-medium dark:text-muted-foreground">{task.project.name}</span>
                    </div>
                )}
            </div>

            {/* Description - Keeps more space for this section */}
            <div className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-900">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Description
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap min-h-24 max-h-56 overflow-y-auto">
                    {task.description ? (
                        task.description
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                            No description provided
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TaskHeader;