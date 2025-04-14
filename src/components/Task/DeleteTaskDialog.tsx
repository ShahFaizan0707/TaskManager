import { useState } from 'react';
import { ITask } from '@/lib/types/project';
import { deleteTask } from '@/lib/api/taskApi';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteTaskConfirmationProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    task: ITask | null;
    onTaskDeleted: (taskId: string) => void;
}

const DeleteTaskConfirmation = ({
    isOpen,
    onOpenChange,
    task,
    onTaskDeleted
}: DeleteTaskConfirmationProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Confirm and execute task deletion
    const confirmDeleteTask = async () => {
        if (!task) return;

        try {
            setIsDeleting(true);
            const result = await deleteTask(String(task.id));

            if (result.deleted) {
                onTaskDeleted(String(task.id));

                toast.success("Task deleted successfully")
            } else {
                throw new Error("Delete operation returned false");
            }

            onOpenChange(false);
        } catch (error) {
            console.error("Failed to delete task:", error);
            toast.error("Failed to delete task");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span>This action cannot be undone. This will permanently delete the task  </span>
                        {task && (
                            <span className="font-bold">{ task.title}</span>
                        )}
                        <span> and remove it from our servers.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDeleteTask}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteTaskConfirmation;