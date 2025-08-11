import React from 'react';
import { Assignment } from '../../types';
import { useApp } from '../../context/AppContext';
import { Calendar, Users, AlertTriangle, Clock, Eye } from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  onViewSubmissions: (assignmentId: string) => void;
}

export function AssignmentCard({ assignment, onViewSubmissions }: AssignmentCardProps) {
  const { getAssignmentSubmissions } = useApp();
  
  const submissions = getAssignmentSubmissions(assignment.id);
  const totalSubmissions = submissions.length;
  const lateSubmissions = submissions.filter(s => s.is_late).length;
  
  const isOverdue = new Date() > new Date(assignment.due_date);
  const daysUntilDue = Math.ceil((new Date(assignment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilDue <= 1) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isOverdue) return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `${daysUntilDue} days remaining`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{assignment.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-medium">{assignment.max_marks}</span>
          <span>marks</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">Total Submissions</span>
          </div>
          <p className="text-xl font-bold text-blue-900 mt-1">{totalSubmissions}</p>
        </div>
        
        {lateSubmissions > 0 && (
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800 font-medium">Late Submissions</span>
            </div>
            <p className="text-xl font-bold text-orange-900 mt-1">{lateSubmissions}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {assignment.allow_late_submission ? (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Late allowed ({assignment.penalty_percentage}% penalty)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>No late submissions</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onViewSubmissions(assignment.id)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>View Submissions</span>
        </button>
      </div>
    </div>
  );
}