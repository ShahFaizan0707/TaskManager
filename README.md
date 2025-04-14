# Task Manager Application

A modern, feature-rich task management application built with React and TypeScript that helps teams collaborate and manage projects efficiently.

# Deployed Link


## UI ScreenShots
![WhatsApp Image 2025-04-14 at 4 03 10 PM](https://github.com/user-attachments/assets/2f5738be-0cfd-43f2-a7a6-46f7df51ef73)
![WhatsApp Image 2025-04-14 at 4 03 11 PM](https://github.com/user-attachments/assets/668f3392-1d96-489f-997d-8d757a6d695f)
![WhatsApp Image 2025-04-14 at 4 03 11 PM (1)](https://github.com/user-attachments/assets/38918745-f5d1-4856-831e-75b18be7ddec)
![WhatsApp Image 2025-04-14 at 4 03 11 PM (2)](https://github.com/user-attachments/assets/7131fab1-3a0d-40b6-8a08-718de7cd098b)
![WhatsApp Image 2025-04-14 at 4 03 12 PM](https://github.com/user-attachments/assets/f9ecb385-38c7-435d-83f8-97c9c8ba0be0)
![WhatsApp Image 2025-04-14 at 4 03 12 PM (1)](https://github.com/user-attachments/assets/87735925-9899-4d7f-a254-a00f2f7e603b)
![WhatsApp Image 2025-04-14 at 4 03 13 PM](https://github.com/user-attachments/assets/c1070d8b-1062-4dbd-9129-3baccf2ea365)
![WhatsApp Image 2025-04-14 at 4 03 13 PM (1)](https://github.com/user-attachments/assets/d8021497-391d-49d9-be79-f39d9bebea48)

## Backend URL
[Backend](https://github.com/ShahFaizan0707/TaskManagerBackend)
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
