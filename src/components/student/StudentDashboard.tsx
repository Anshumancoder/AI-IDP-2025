import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import { StudentAssignmentCard } from './StudentAssignmentCard';
import { BookOpen, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export function StudentDashboard() {
  const { user, assignments, getStudentSubmissions } = useApp();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  if (!user) return null;

  const submissions = getStudentSubmissions(user.id);
  const submittedAssignmentIds = submissions.map(s => s.assignment_id);
  
  const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.includes(a.id));
  const completedAssignments = assignments.filter(a => submittedAssignmentIds.includes(a.id));
  const overdueAssignments = pendingAssignments.filter(a => new Date() > new Date(a.due_date));
  
  const averageScore = submissions.length > 0 
    ? submissions.filter(s => s.marks !== undefined && s.marks !== null).reduce((sum, s) => sum + (s.marks || 0), 0) / submissions.filter(s => s.marks !== undefined && s.marks !== null).length
    : 0;

  const stats = [
    {
      title: 'Total Assignments',
      value: assignments.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Completed',
      value: completedAssignments.length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Pending',
      value: pendingAssignments.length,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Average Score',
      value: `${Math.round(averageScore)}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
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

        {/* Overdue Assignments Alert */}
        {overdueAssignments.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-800 font-medium">
                You have {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? 's' : ''}
              </h3>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Please submit your assignments as soon as possible to avoid further penalties.
            </p>
          </div>
        )}
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Assignments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingAssignments.map((assignment) => (
              <StudentAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={setSelectedAssignment}
                isSubmitted={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Assignments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedAssignments.map((assignment) => {
              const submission = submissions.find(s => s.assignment_id === assignment.id);
              return (
                <StudentAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={setSelectedAssignment}
                  isSubmitted={true}
                  submission={submission}
                />
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-600">Your teacher hasn't assigned any work yet. Check back later!</p>
        </div>
      )}

      <SubmitAssignmentModal
        assignmentId={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
      />
    </div>
  );
}