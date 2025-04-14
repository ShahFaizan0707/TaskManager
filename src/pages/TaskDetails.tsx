import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ITask,
  ITaskMessage,
  TaskStatus,
  WebSocketMessageType,
} from '@/lib/types/project';
import {
  getTaskById,
  addTaskMessage,
  updateTaskStatus
} from '@/lib/api/taskApi';
import websocketService from '@/lib/api/websocketService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TaskStatusLabels } from '@/lib/types/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskHeader from '@/components/Task/TaskHeader';

// Messages Section Component  
const MessageSection: React.FC<{ messages: ITaskMessage[]; currentUserId: number }> =
  ({ messages, currentUserId }) => {

    // Get user initials
    const getUserInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    return (
      <div className="space-y-4 p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${Number(message.userId) === Number(currentUserId) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${Number(message.userId) === Number(currentUserId)
                ? 'bg-blue-50 text-blue-900'
                : 'bg-white border text-gray-900'
                }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  {getUserInitials(message.user?.name || '')}
                </div>
                <span className="text-sm font-medium">{message.user?.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm pl-8">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();

  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Track messages we've already seen - using both ID and content hash to prevent duplicates
  const processedMessageIds = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get current user status
  const isCreator = user?.id === task?.project?.creatorId;
  const isAssignee = task?.assignments?.some(a => Number(a.userId) === Number(user?.id));

  // Fetch task data
  useEffect(() => {
    if (!taskId || !user) return;

    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        // Get task data
        const taskData = await getTaskById(taskId);
        setTask(taskData);

        // Initialize processed message IDs with existing messages
        if (taskData.messages) {
          taskData.messages.forEach(message => {
            // Store the ID to help catch duplicates
            processedMessageIds.current.add(message.id.toString());
          });
        }
        // Connect to WebSocket for this project
        if (taskData.project?.id) {
          websocketService.joinProject(taskData.project.id);
        }
      } catch (err: any) {
        console.error('Error fetching task details:', err);
        setError(err.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();

    // Cleanup function
    return () => {
      if (task?.project?.id) {
        websocketService.leaveProject();
      }
    };
  }, [taskId, user]);
  // Set up WebSocket listeners
  useEffect(() => {
    if (!taskId) return;

    // Listen for task updates
    websocketService.on(WebSocketMessageType.TASK_UPDATED, (data) => {
      if (data.id === taskId) {
        setTask(prevTask => prevTask ? { ...prevTask, ...data } : data);
      }
    });

    // Listen for task status changes
    websocketService.on(WebSocketMessageType.TASK_STATUS_CHANGE, (data) => {
      console.log(data, " taskId);")
      if (data.taskId === taskId) {
        setTask(prevTask => prevTask ? { ...prevTask, status: data.status } : null);
      }
    });

    // Listen for new messages
    websocketService.on(WebSocketMessageType.NEW_TASK_MESSAGE, (data) => {
      // Check both potential taskId fields and convert to string for comparison
      console.log(data, " taskId);")
      const messageTaskId = String(data.task?.id || data.taskId);

      if (messageTaskId === String(taskId)) {
        // Only add message if we haven't seen it before by ID
        if (data.id && !processedMessageIds.current.has(data.id.toString())) {
          processedMessageIds.current.add(data.id.toString());
          if (data.userId !== user?.id) {
            toast.success('New message received', {
              description: (
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {`${data.user?.name || 'A user'} sent a message`}
                </span>
              )
            });
          }
          // Add the new message to the task
          setTask(prevTask => {
            if (!prevTask) return null;
            return {
              ...prevTask,
              messages: [...(prevTask.messages || []), data]
            };
          });
        }
      }
    });

    // Listen for typing indicators
    websocketService.on(WebSocketMessageType.USER_TYPING, (data) => {
      if (data.context === 'task' && data.contextId === taskId && data.userId !== user?.id) {
        handleUserTyping(data.userId);
      }
    });

    // User presence notifications
    websocketService.on(WebSocketMessageType.USER_JOINED_PROJECT, (data) => {
      if (data.projectId === task?.project?.id && data.userId !== user?.id) {
        // setActiveUsers(prev => new Set([...prev, data.userId]));

        // Show toast notification
        toast.success(`${data.user?.name || 'A user'} joined the project`)
      }
    });

    websocketService.on(WebSocketMessageType.USER_LEFT_PROJECT, (data) => {
      if (data.projectId === task?.project?.id && data.userId !== user?.id) {

        // Show toast notification
        toast.info(`${data.user?.name || 'A user'} left the project`)
      }
    });

    websocketService.on(WebSocketMessageType.USER_ONLINE, (data) => {
      if (data.projectId === task?.project?.id && data.userId !== user?.id) {

        toast.success(`${data.user?.name || 'A user'} is now online`)
      }
    });

    websocketService.on(WebSocketMessageType.USER_OFFLINE, (data) => {
      if (data.projectId === task?.project?.id && data.userId !== user?.id) {

        // Show toast notification
        toast.info(`${data.user?.name || 'A user'} went offline`)
      }
    });

    // Fetch initial active users
    if (task?.project?.id) {
      websocketService.getActiveProjectUsers(task.project.id.toString())
        .then(users => {
          // setActiveUsers(new Set(users.map(u => u.id.toString())));
        });
    }

    return () => {
      // Clean up listeners
      websocketService.removeAllListeners(WebSocketMessageType.TASK_UPDATED);
      websocketService.removeAllListeners(WebSocketMessageType.TASK_STATUS_CHANGE);
      websocketService.removeAllListeners(WebSocketMessageType.NEW_TASK_MESSAGE);
      websocketService.removeAllListeners(WebSocketMessageType.USER_TYPING);
      websocketService.removeAllListeners(WebSocketMessageType.USER_JOINED_PROJECT);
      websocketService.removeAllListeners(WebSocketMessageType.USER_LEFT_PROJECT);
      websocketService.removeAllListeners(WebSocketMessageType.USER_ONLINE);
      websocketService.removeAllListeners(WebSocketMessageType.USER_OFFLINE);
    };
  }, [taskId, user, task?.project?.id]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.messages]);

  // Handle typing indicators
  const handleUserTyping = (userId: string) => {
    setTypingUsers(prev => new Set([...prev, userId]));

    // Clear previous timeout if exists
    if (typingTimeouts.current.has(userId)) {
      clearTimeout(typingTimeouts.current.get(userId));
    }

    // Set timeout to remove typing indicator after 3 seconds
    const timeout = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(userId);
        return newSet;
      });
      typingTimeouts.current.delete(userId);
    }, 3000);

    typingTimeouts.current.set(userId, timeout);
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !task || !taskId || !user) return;

    try {
      const messageToSend = messageContent;
      setMessageContent('');
      websocketService.sendTaskMessage(taskId, messageToSend);

    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');

      // Re-enable the message content in case of error
      setMessageContent(messageContent);
    }
  };

  // Notify others that user is typing
  const handleTyping = () => {
    if (!taskId) return;
    websocketService.sendTyping('task', taskId);
  };

  // Update task status
  const handleStatusChange = async (status: TaskStatus) => {
    if (!task || !taskId) return;

    try {
      // Use WebSocket to update status instead of direct API call
      const newStatus = status as TaskStatus;
      await updateTaskStatus(taskId.toString(), newStatus);
      websocketService.sendTaskStatusChange(taskId, newStatus);
      // Optimistic update
      setTask(prevTask => prevTask ? { ...prevTask, status } : null);

      // Show toast notification
      toast.success(`Task status updated to ${TaskStatusLabels[status]}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
      toast.error('Failed to update task status');
    }
  };

  // Show typing indicators
  const getTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const projectMembers = task?.project?.members?.map(member => member.user) || [];
    const typingUsersList = Array.from(typingUsers)
      .map(id => projectMembers.find(member => member.id === Number(id))?.name || 'Someone');

    return (
      <div className="text-sm text-gray-500 italic mb-2">
        {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 flex justify-center">Loading task details...</div>;
  }

  if (error || !task || !user) {
    return <div className="p-4 text-red-500">{error || 'Task not found or user not authenticated'}</div>;
  }

  return (
    <div className="w-full flex flex-col h-screen items-center justify-center overflow-x-hidden">
      <div className="container mx-auto px-4">
        <TaskHeader
          task={task}
          isCreator={isCreator}
          isAssignee={isAssignee || true}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Messages Section - kept in the main file */}
      <div className="flex-1 flex flex-col container px-6 py-2 overflow-hidden mt-3">
        <h2 className="text-sm font-semibold mb-2">Live Updates</h2>
        <div className="flex-1 rounded-md overflow-y-auto mb-3">
          {task.messages && task.messages.length > 0 ? (
            <MessageSection messages={task.messages} currentUserId={Number(user.id)} />
          ) : (
            <div className="text-gray-500 italic text-center py-12 text-sm">
              No messages yet. Start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {getTypingIndicator()}

        <div className="sticky bottom-0 border rounded-lg py-3">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pl-5 pr-8">
            <Input
              type="text"
              value={messageContent}
              onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setMessageContent(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type your message..."
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              disabled={!messageContent.trim()}
              className="text-sm"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;