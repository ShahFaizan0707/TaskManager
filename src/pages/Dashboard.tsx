import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CalendarClock, 
  CheckCircle, 
  CircleDashed, 
  Clock, 
  ListChecks, 
  Loader2, 
  PanelRight, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProjects, IProjectsResponse } from '@/lib/api/dashboard';
import ProjectCard, { getPriorityColor } from '@/components/Project/ProjectCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CreateProjectForm from '@/components/Project/ProjectForm';
import { IProject } from '@/lib/types/project';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const [data, setData] = useState<IProjectsResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<String>("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const navigate = useNavigate();
    const {user} = useAuth();
  
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);  // Set loading to false if no user
        setError('User not authenticated');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await getUserProjects();
        setData(response);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      if (user) { 
        fetchDashboardData();
      } else {
        setIsLoading(false); 
      }
    }, [user]);

  const handleProjectCreated = (newProject: IProject) => {
    // Close dialog and refresh data

    setCreateDialogOpen(false);
    navigate(`/project/${newProject.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { dashboardSummary, projects } = data;

const personalProjects = user ? projects.filter(p => p.creatorId === Number(user.id)) : [];
const assignedProjects = user ? projects.filter(p => p.creatorId !== Number(user.id)) : [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-3 w-3 " /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <CreateProjectForm onProjectCreated={handleProjectCreated} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ListChecks className="h-6 w-6 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{dashboardSummary.totalProjects}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardSummary.projectsCreatedByUser} created by you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CircleDashed className="h-6 w-6 text-purple-500 mr-2" />
              <div className="text-2xl font-bold">{dashboardSummary.totalTasks}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PanelRight className="h-6 w-6 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{dashboardSummary.userAssignedTasks.total}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardSummary.userAssignedTasks.completed} completed / {dashboardSummary.userAssignedTasks.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">
                {Math.round((dashboardSummary.userAssignedTasks.completed / dashboardSummary.userAssignedTasks.total) * 100) || 0}%
              </div>
            </div>
            <Progress 
              value={(dashboardSummary.userAssignedTasks.completed / dashboardSummary.userAssignedTasks.total) * 100 || 0} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Tabs defaultValue="personal" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <TabsList>
            <TabsTrigger value="personal">My Projects</TabsTrigger>
            <TabsTrigger value="assigned">Assigned Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="overdue">With Overdue Tasks</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="personal" className="space-y-4">
          {personalProjects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">You haven't created any projects yet.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            personalProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdate={fetchDashboardData} 
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="assigned" className="space-y-4">
          {assignedProjects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">You haven't been assigned to any projects.</p>
              </CardContent>
            </Card>
          ) : (
            assignedProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdate={fetchDashboardData} 
                hideControls={project.creatorId !== dashboardSummary.projectsCreatedByUser}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {projects.filter(p => p.projectTaskMetrics.inProgress > 0).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No active projects found.</p>
              </CardContent>
            </Card>
          ) : (
            projects
              .filter(p => p.projectTaskMetrics.inProgress > 0)
              .map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdate={fetchDashboardData} 
                  hideControls={project.creatorId !== dashboardSummary.projectsCreatedByUser}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {projects.filter(p => p.projectTaskMetrics.overdue > 0).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No projects with overdue tasks.</p>
              </CardContent>
            </Card>
          ) : (
            projects
              .filter(p => p.projectTaskMetrics.overdue > 0)
              .map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdate={fetchDashboardData} 
                  hideControls={project.creatorId !== dashboardSummary.projectsCreatedByUser}
                />
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* Upcoming Deadlines Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-orange-500" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Tasks due soon across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.flatMap(project => 
              project.upcomingDeadlines.map(task => (
                <div key={task.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">Project: {project.name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                    <div className="flex items-center mt-1 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                </div>
              ))
            ).slice(0, 5)}
            
            {projects.flatMap(p => p.upcomingDeadlines).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming deadlines found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}