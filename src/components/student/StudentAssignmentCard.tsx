import React from 'react';
import { Assignment, Submission } from '../../types';
import { Calendar, AlertTriangle, CheckCircle, Clock, Star, MessageSquare, Upload } from 'lucide-react';

interface StudentAssignmentCardProps {
  assignment: Assignment;
  isSubmitted: boolean;
  submission?: Submission;
  onSubmit: (assignmentId: string) => void;
}

export function StudentAssignmentCard({ assignment, isSubmitted, submission, onSubmit }: StudentAssignmentCardProps) {
  const isOverdue = new Date() > new Date(assignment.due_date);
  const daysUntilDue = Math.ceil((new Date(assignment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    if (isSubmitted) {
      if (submission?.status === 'graded') return 'text-green-600 bg-green-50 border-green-200';
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    if (isOverdue) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilDue <= 1) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isSubmitted) {
      if (submission?.status === 'graded') return 'Graded';
      return 'Submitted';
    }
    if (isOverdue) return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `${daysUntilDue} days remaining`;
  };

  const getStatusIcon = () => {
    if (isSubmitted) {
      if (submission?.status === 'graded') return CheckCircle;
      return CheckCircle;
    }
    if (isOverdue) return AlertTriangle;
    return Clock;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{assignment.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor()}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{getStatusText()}</span>
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

      {isSubmitted && submission ? (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
              </span>
              {submission.is_late && (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  Late
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600">
              Files: {submission.files.map(f => f.name).join(', ')}
            </div>
          </div>

          {submission.status === 'graded' && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Grade: {submission.marks}/{assignment.max_marks} ({Math.round((submission.marks! / assignment.max_marks) * 100)}%)
                </span>
              </div>
              {submission.feedback && (
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-green-700 text-sm">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="pt-4 border-t border-gray-100">
          {isOverdue && !assignment.allow_late_submission ? (
            <div className="text-center py-2">
              <p className="text-red-600 text-sm font-medium">Submission closed</p>
              <p className="text-red-500 text-xs">This assignment no longer accepts submissions</p>
            </div>
          ) : (
            <button
              onClick={() => onSubmit(assignment.id)}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                isOverdue
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isOverdue ? 'Submit Late' : 'Submit Assignment'}</span>
            </button>
          )}
          
          {isOverdue && assignment.allow_late_submission && assignment.penalty_percentage && (
            <p className="text-orange-600 text-xs text-center mt-2">
              Late penalty: {assignment.penalty_percentage}% per day
            </p>
          )}
        </div>
      )}
    </div>
  );
}