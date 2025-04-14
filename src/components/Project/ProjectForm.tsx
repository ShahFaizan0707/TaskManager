import { useState } from 'react';
import { Check, Loader2} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createProject, addProjectMember } from '@/lib/api/projectApi';
import { IProject, IProjectData } from '@/lib/types/project';

const CreateProjectForm = ({ onProjectCreated }: { onProjectCreated?: (project: IProject) => void }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create project data
      const projectData: IProjectData = {
        name: projectName,
        description: description || undefined,
      };
      
      // Create the project
      const newProject = await createProject(projectData);
      
      // Add members if any
      const memberPromises = members.map(email => 
        addProjectMember(newProject.id, email).catch(err => {
          console.error(`Failed to add member ${email}:`, err);
          return null;
        })
      );
      
      await Promise.all(memberPromises);
      
      setSuccess('Project created successfully!');
      
      // Reset form
      setProjectName('');
      setDescription('');
      setMembers([]);
      
      // Notify parent component
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Create a new project and invite team members to collaborate
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              rows={5}
            />
          </div>
          
        </CardContent>
        
        <CardFooter className="mt-5">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !projectName.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateProjectForm;