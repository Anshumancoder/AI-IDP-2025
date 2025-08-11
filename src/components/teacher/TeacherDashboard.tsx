import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { AssignmentCard } from './AssignmentCard';
import { SubmissionsList } from './SubmissionsList';
import { Plus, BookOpen, Users, CheckCircle, Clock } from 'lucide-react';

export function TeacherDashboard() {
  const { assignments, submissions } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const pendingGrading = submissions.filter(s => s.status === 'submitted').length;
  const completedGrading = submissions.filter(s => s.status === 'graded').length;

  const stats = [
    {
      title: 'Total Assignments',
      value: totalAssignments,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Submissions',
      value: totalSubmissions,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Grading',
      value: pendingGrading,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Completed Grading',
      value: completedGrading,
      icon: CheckCircle,
      color: 'bg-teal-500',
    },
  ];

  if (selectedAssignment) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
        <SubmissionsList assignmentId={selectedAssignment} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage assignments and track student progress</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Assignments</h2>
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onViewSubmissions={setSelectedAssignment}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}