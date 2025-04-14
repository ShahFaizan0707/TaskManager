# Task Manager Application

A modern, feature-rich task management application built with React and TypeScript that helps teams collaborate and manage projects efficiently.

## Features

### Project Management
- Create and manage multiple projects
- Add project descriptions and details 
- Track project completion progress
- View project statistics and metrics
- Transfer project ownership
- Archive/Delete projects

### Task Management
#### Task Creation & Organization
- Create tasks with titles and detailed descriptions
- Set task priorities (LOW, MEDIUM, HIGH, URGENT)
- Assign due dates to tasks
- Organize tasks in Kanban-style boards
- Drag-and-drop interface for task status updates

#### Task Statuses
- TODO: New tasks awaiting action
- IN_PROGRESS: Tasks currently being worked on
- UNDER_REVIEW: Tasks pending review
- COMPLETED: Finished tasks

### Team Collaboration
- Add multiple members to projects
- Assign/unassign tasks to team members
- Real-time task status updates
- Add comments and messages on tasks
- View team member activity and contributions

### User Management
- User authentication and authorization
- Personal dashboard with assigned tasks
- Track individual task metrics
- View upcoming deadlines
- Leave projects

### Search & Filter
- Search for specific tasks
- Filter tasks by status
- Filter tasks by priority
- Filter tasks by assignee
- View tasks by project

### Interface Features
- Responsive design for mobile and desktop
- Dark/Light theme toggle
- Drag-and-drop task management
- Progress indicators
- Task completion statistics
- User avatars and presence indicators

### Project Analytics
- Project completion percentage
- Task distribution metrics
- Member contribution insights
- Upcoming deadline alerts
- Task priority distribution

## Technical Features
- Real-time updates
- Secure authentication
- RESTful API integration
- Responsive UI with Tailwind CSS
- Accessible components using Radix UI
- Modern React patterns and hooks
- TypeScript for type safety
- Error handling and validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL=your_api_endpoint
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
