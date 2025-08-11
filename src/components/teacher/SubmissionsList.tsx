import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Submission, FileObject } from '../../types';
import { FileText, Calendar, AlertTriangle, CheckCircle, Star, MessageSquare, Download, ExternalLink } from 'lucide-react';
import { downloadFile } from '../../lib/supabase';

interface SubmissionsListProps {
  assignmentId: string;
}

export function SubmissionsList({ assignmentId }: SubmissionsListProps) {
  const { assignments, getAssignmentSubmissions, updateSubmission } = useApp();
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const assignment = assignments.find(a => a.id === assignmentId);
  const submissions = getAssignmentSubmissions(assignmentId);

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  const handleGradeSubmission = async (submissionId: string) => {
    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > assignment.max_marks) {
      alert(`Marks must be between 0 and ${assignment.max_marks}`);
      return;
    }

    try {
      await updateSubmission(submissionId, marksNum, feedback);
      setGradingSubmission(null);
      setMarks('');
      setFeedback('');
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to save grade. Please try again.');
    }
  };

  const handleDownloadFile = async (file: FileObject) => {
    try {
      // Extract the file path from the URL
      const url = new URL(file.url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('assignment-files') + 1).join('/');
      
      const blob = await downloadFile('assignment-files', filePath);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleViewFile = (file: FileObject) => {
    window.open(file.url, '_blank');
  };

  const getSubmissionStatus = (submission: Submission) => {
    if (submission.status === 'graded') {
      return {
        color: 'text-green-600 bg-green-50 border-green-200',
        text: 'Graded',
        icon: CheckCircle,
      };
    }
    return {
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      text: 'Pending Review',
      icon: Calendar,
    };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
        <p className="text-gray-600">{assignment.description}</p>
        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
          <span>Max Marks: {assignment.max_marks}</span>
          <span>Total Submissions: {submissions.length}</span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Students haven't submitted their work for this assignment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const status = getSubmissionStatus(submission);
            const StatusIcon = status.icon;

            return (
              <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{submission.student_name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      </div>
                      {submission.is_late && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Late Submission</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{status.text}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {submission.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View file"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {submission.status === 'graded' ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Grade: {submission.marks}/{assignment.max_marks}
                      </span>
                    </div>
                    {submission.feedback && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                        <p className="text-green-700 text-sm">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {gradingSubmission === submission.id ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Marks (out of {assignment.max_marks})
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={assignment.max_marks}
                              value={marks}
                              onChange={(e) => setMarks(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter marks"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback (optional)
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Provide feedback to the student"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGradeSubmission(submission.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Save Grade
                          </button>
                          <button
                            onClick={() => {
                              setGradingSubmission(null);
                              setMarks('');
                              setFeedback('');
                            }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGradingSubmission(submission.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Grade Submission
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}