import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { TaskPriorityColors, TaskPriorityLabels, formatDate } from '@/lib/types/constants';
import { ITask } from '@/lib/types/project';
import { CalendarDays, ExternalLink, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableTaskCardProps {
  id: string;
  task: ITask;
  onViewDetails: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SortableTaskCard = ({ 
  id, 
  task, 
  onViewDetails, 
  onEdit, 
  onDelete 
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: false 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeftColor: task.priority === 'LOW' ? '#94a3b8' :
      task.priority === 'MEDIUM' ? '#3b82f6' :
        task.priority === 'HIGH' ? '#f97316' : '#ef4444',
    zIndex: isDragging ? 9999 : 'auto',
  };

  const modifiedListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // Prevent starting drag if the click originated from a button
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      listeners?.onPointerDown?.(e);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-l-4 hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing mb-2 shadow-sm"
      {...attributes}
      {...modifiedListeners}
    >
      {/* Using min-h instead of fixed h-14 to allow for vertical expansion */}
      <div className="px-3 py-2 min-h-[3 rem] flex flex-col">
        <div className="flex flex-col gap-1">
          {/* First Row: Title + External Link (View Details) together */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <div className="font-medium text-lmd break-words truncate">
                {task.title}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 flex-shrink-0" 
                onClick={handleViewClick}
                title="View details"
              >
                <ExternalLink size={14} />
              </Button>
            </div>
          </div>
          {/* Second Row: Badge on left, Edit and Delete buttons on right */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${TaskPriorityColors[task.priority]} py-0 h-5`}
            >
              {TaskPriorityLabels[task.priority]}
            </Badge>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={handleEditClick}
                title="Edit task"
              >
                <Edit size={14} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" 
                onClick={handleDeleteClick}
                title="Delete task"
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        </div>
        {/* Bottom Row: Avatar assignments and due date */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex -space-x-1">
            {task.assignments.slice(0, 2).map(assignment => (
              <Avatar key={assignment.id} className="h-5 w-5 border border-background">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(assignment.user.name)}`} 
                  alt={assignment.user.name} 
                />
                <AvatarFallback className="text-[8px]">
                  {assignment.user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignments.length > 2 && (
              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] border border-background">
                +{task.assignments.length - 2}
              </div>
            )}
            {task.assignments.length === 0 && (
              <span className="text-xs text-gray-400">Unassigned</span>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center text-xs text-gray-500">
              <CalendarDays className="h-3 w-3 mr-1" />
              {formatDate(task.dueDate).split(' ')[0]}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
