import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Check, Loader2, CalendarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { TaskStatus, TaskPriority, IProjectMember } from '@/lib/types/project';
import { createTask } from '@/lib/api/taskApi';
import { getProjectMembers } from '@/lib/api/projectMemberApi';
import { TaskStatusLabels, TaskPriorityLabels } from '@/lib/types/constants';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

const TaskCreateDialog = ({ open, onOpenChange, onTaskCreated }: TaskCreateDialogProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [members, setMembers] = useState<IProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Form state
  const [taskData, setTaskData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
  }>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
  });

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target as Node) && 
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load project members when dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadProjectMembers();
    }
  }, [open, projectId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Update status based on selected members
  useEffect(() => {
    const newStatus = selectedMembers.length > 0
      ? TaskStatus.IN_PROGRESS
      : TaskStatus.TODO;

    setTaskData(prev => ({
      ...prev,
      status: newStatus
    }));
  }, [selectedMembers]);

  const loadProjectMembers = async () => {
    if (!projectId) return;

    try {
      const membersData = await getProjectMembers(projectId);
      setMembers(membersData);
    } catch (err) {
      console.error('Error loading project members:', err);
      setFormError('Failed to load project members');
    }
  };

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    });
    setSelectedMembers([]);
    setDueDate(new Date());
    setFormError(null);
    setShowCalendar(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    if (!taskData.title.trim()) {
      setFormError('Task title is required');
      return;
    }

    if (!dueDate) {
      setFormError('Due date is required');
      return;
    }

    try {
      setLoading(true);
      setFormError(null);

      // Create task data with the new format for assigned users
      const newTaskData = {
        projectId,
        title: taskData.title,
        status: taskData.status,
        description: taskData.description || '',
        dueDate: dueDate.toISOString(),
        priority: taskData.priority,
        assignedUserIds: selectedMembers.length > 0 ? selectedMembers : []
      };

      await createTask(newTaskData);

      onOpenChange(false);
      onTaskCreated();
      resetForm();
    } catch (err) {
      console.error('Error creating task:', err);
      setFormError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to the project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {formError && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Task title"
              value={taskData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide details about the task"
              rows={5}
              value={taskData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status (Auto-assigned)
              </label>
              <div className="h-10 px-3 py-2 rounded-md border border-input text-sm">
                {TaskStatusLabels[taskData.status]}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={taskData.priority}
                onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value as TaskPriority }))}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {TaskPriorityLabels[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Start Date
              </label>
              <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-input text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {format(startDate, 'PPP')}
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Button
                ref={buttonRef}
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
                onClick={toggleCalendar}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Select due date</span>}
              </Button>
              
              {showCalendar && (
                <div 
                  ref={calendarRef}
                  className="absolute z-50 right-0 mt-1 bg-white rounded-md border border-gray-200 shadow-lg p-2"
                  style={{ width: '300px' }}
                >
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      if (date) {
                        setDueDate(date);
                        setShowCalendar(false);
                      }
                    }}
                    initialFocus
                    fromDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Assign To {selectedMembers.length > 0 && `(${selectedMembers.length} selected)`}
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No members available</p>
              ) : (
                members.map(member => (
                  <div
                    key={member.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${selectedMembers.includes(member.userId) ? 'bg-primary/10' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => toggleMemberSelection(member.userId)}
                  >
                    <div className="flex-shrink-0 w-5">
                      {selectedMembers.includes(member.userId) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`}
                        alt={member.user.name}
                      />
                      <AvatarFallback>{member.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-xs text-gray-500">{member.user.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !dueDate}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreateDialog;