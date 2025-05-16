import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import { Task } from '../types';
import { getTasks, completeTask } from '../services/api';

const TasksPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Refresh tasks when navigating to this page
  useEffect(() => {
    // Refresh the task list whenever this component mounts or is navigated to
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [location.pathname, queryClient]);

  // Fetch tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => getTasks(statusFilter),
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCompleteTask = (id: string) => {
    completeTaskMutation.mutate(id);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Task Management</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
          <div>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Error: {data?.error || 'Failed to load tasks'}
          </div>
        ) : data?.data?.tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.tasks.map((task: Task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={handleCompleteTask} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
