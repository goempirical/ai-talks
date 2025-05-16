import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskItem = ({ task, onComplete }: TaskItemProps) => {
  const handleComplete = () => {
    if (!task.completed) {
      onComplete(task.id);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            ID: {task.id} • Created: {new Date(task.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          {task.completed ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          ) : (
            <button
              onClick={handleComplete}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
