import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Assignment, Submission, FileObject } from '../types';
import { supabase, uploadFile, getFileUrl } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  assignments: Assignment[];
  submissions: Submission[];
  loading: boolean;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>;
  logout: () => void;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  submitAssignment: (assignmentId: string, files: File[]) => Promise<void>;
  updateSubmission: (submissionId: string, marks: number, feedback: string) => Promise<void>;
  getStudentSubmissions: (studentId: string) => Submission[];
  getAssignmentSubmissions: (assignmentId: string) => Submission[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAssignments([]);
        setSubmissions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
      
      // Set up real-time subscriptions
      const assignmentsSubscription = supabase
        .channel('assignments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
          fetchAssignments();
        })
        .subscribe();

      const submissionsSubscription = supabase
        .channel('submissions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
          fetchSubmissions();
        })
        .subscribe();

      return () => {
        assignmentsSubscription.unsubscribe();
        submissionsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles!submissions_student_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const submissionsWithNames = data?.map(submission => ({
        ...submission,
        student_name: submission.profiles?.name || 'Unknown Student'
      })) || [];

      setSubmissions(submissionsWithNames);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchAssignments(), fetchSubmissions()]);
  };

  const login = async (email: string, password: string, role: 'teacher' | 'student'): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has the correct role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== role) {
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: user.id,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  };

  const submitAssignment = async (assignmentId: string, files: File[]): Promise<void> => {
    if (!user) return;

    try {
      // Upload files to Supabase Storage
      const uploadedFiles: FileObject[] = [];
      
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `submissions/${user.id}/${assignmentId}/${fileName}`;
        
        await uploadFile(file, 'assignment-files', filePath);
        const fileUrl = getFileUrl('assignment-files', filePath);
        
        uploadedFiles.push({
          name: file.name,
          url: fileUrl,
          size: file.size,
          type: file.type,
        });
      }

      // Check if assignment is late
      const assignment = assignments.find(a => a.id === assignmentId);
      const isLate = assignment ? new Date() > new Date(assignment.due_date) : false;

      // Insert or update submission
      const { error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          files: uploadedFiles,
          is_late: isLate,
          status: 'submitted' as const,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  };

  const updateSubmission = async (submissionId: string, marks: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          marks,
          feedback,
          status: 'graded' as const,
        })
        .eq('id', submissionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  };

  const getStudentSubmissions = (studentId: string) => {
    return submissions.filter(s => s.student_id === studentId);
  };

  const getAssignmentSubmissions = (assignmentId: string) => {
    return submissions.filter(s => s.assignment_id === assignmentId);
  };

  return (
    <AppContext.Provider value={{
      user,
      assignments,
      submissions,
      loading,
      login,
      logout,
      createAssignment,
      submitAssignment,
      updateSubmission,
      getStudentSubmissions,
      getAssignmentSubmissions,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}