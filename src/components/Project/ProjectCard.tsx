import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteProject, updateProject } from '@/lib/api/projectApi';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project, onUpdate, hideControls = false }: any) {
  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  // Update state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updatedName, setUpdatedName] = useState(project.name);
  const [updatedDescription, setUpdatedDescription] = useState(project.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        const result = await deleteProject(project.id);
        if (result.deleted) {
          // Refresh parent component data
          if (onUpdate) onUpdate();
        }
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete the project. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openUpdateDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdatedName(project.name);
    setUpdatedDescription(project.description || '');
    setUpdateDialogOpen(true);
    setUpdateError(null);
  };

  const handleUpdateProject = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      await updateProject(project.id, {
        name: updatedName,
        description: updatedDescription
      });

      // Close the dialog and refresh parent data
      setUpdateDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update project:', err);
      setUpdateError('Failed to update the project. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="
        bg-white dark:bg-gray-800 cursor-pointer
        hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-colors duration-300 
        p-4 rounded shadow
      "
        onClick={() => navigate(`/project/${project.id}`)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description || 'No description provided'}</CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-muted-foreground">{project.members?.length || 0}</span>
              </div>
              <div className="text-sm font-medium">
                {project.completionPercentage}% Complete
              </div>

              {!hideControls && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={openUpdateDialog}
                    disabled={isDeleting}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-1" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={project.completionPercentage} className="h-2 mb-2" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Tasks</span>
              <span className="text-lg font-bold">{project.projectTaskMetrics.total}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">In Progress</span>
              <span className="text-lg font-bold">{project.projectTaskMetrics.inProgress}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <span className="text-lg font-bold">{project.projectTaskMetrics.completed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Overdue</span>
              <span className={`text-lg font-bold ${project.projectTaskMetrics.overdue > 0 ? 'text-red-500' : ''}`}>
                {project.projectTaskMetrics.overdue}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Project Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                placeholder="Enter project description"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleUpdateProject}
              disabled={!updatedName || isUpdating}
            >
              {isUpdating ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Updating...
                </span>
              ) : 'Update Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function for priority colors
export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'bg-blue-100 text-blue-800';
    case 'MEDIUM':
      return 'bg-green-100 text-green-800';
    case 'HIGH':
      return 'bg-amber-100 text-amber-800';
    case 'URGENT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}