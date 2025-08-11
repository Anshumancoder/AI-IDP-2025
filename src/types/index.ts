export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar_url?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  allow_late_submission: boolean;
  penalty_percentage?: number;
  max_marks: number;
}

export interface FileObject {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  submitted_at: string;
  files: FileObject[];
  is_late: boolean;
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalAssignments: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  averageScore?: number;
}