import { useState, useEffect, useRef } from 'react';
import { ITask, ITaskUpdateData } from '@/lib/types/project';
import { updateTask } from '@/lib/api/taskApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from 'sonner';

interface EditTaskDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    task: ITask | null;
    onTaskUpdated: (updatedTask: ITask) => void;
}

const EditTaskDialog = ({
    isOpen,
    onOpenChange,
    task,
    onTaskUpdated
}: EditTaskDialogProps) => {
    const [formData, setFormData] = useState<ITaskUpdateData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
    const buttonRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    
  

    // Update form data when task changes
    useEffect(() => {
        if (task) {
          setFormData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined
          });
          setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        }
      }, [task]);

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

      const toggleCalendar = () => {
        setShowCalendar(!showCalendar);
      };
      
      // Handle form input changes
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
      
      // Handle select changes (for priority)
      const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      };
      
      // Handle date selection from calendar
      const handleDateSelect = (date: Date | undefined) => {
        if (date) {
          const formattedDate = date.toISOString().split('T')[0];
          setDueDate(date);
          setFormData(prev => ({ ...prev, dueDate: formattedDate }));
          setShowCalendar(false);
        }
      };
      
      // Submit the edit form
      const handleEditSubmit = async () => {
        if (!task) return;
        
        try {
          setIsSubmitting(true);
          const updatedTask = await updateTask(String(task.id), formData);
          onTaskUpdated(updatedTask);
          
          toast.success("Task updated successfully");
          
          onOpenChange(false);
        } catch (error) {
          console.error("Failed to update task:", error);
          toast.error("Failed to update task");
        } finally {
          setIsSubmitting(false);
        }
      };
      
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Make changes to the task. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">Priority</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange(value, 'priority')}
                  defaultValue={formData.priority}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                <div className="col-span-3">
                  <div className="space-y-2 relative">
                    <Button
                      ref={buttonRef}
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      type="button"
                      onClick={toggleCalendar}
                      disabled={isSubmitting}
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
                          onSelect={handleDateSelect}
                          initialFocus
                          fromDate={new Date()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

export default EditTaskDialog;