import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/lib/types/project';
import { ReactNode } from 'react';

interface DroppableContainerProps {
  id: TaskStatus;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export const DroppableContainer = ({ 
  id, 
  title, 
  color, 
  count, 
  children 
}: DroppableContainerProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <Card 
      ref={setNodeRef} 
      className={`overflow-hidden transition-all ${isOver ? 'ring-2 ring-primary shadow-lg' : ''}`}
      style={{ 
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader className={`${color} py-2 px-3`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">{title}</CardTitle>
          <Badge variant="outline" className="bg-white/20 text-black">
            {count} {count === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
};