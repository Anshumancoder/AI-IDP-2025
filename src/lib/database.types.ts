export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'teacher' | 'student'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'teacher' | 'student'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'teacher' | 'student'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string
          due_date: string
          created_by: string
          created_at: string
          updated_at: string
          allow_late_submission: boolean
          penalty_percentage: number | null
          max_marks: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          due_date: string
          created_by: string
          created_at?: string
          updated_at?: string
          allow_late_submission?: boolean
          penalty_percentage?: number | null
          max_marks?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          due_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          allow_late_submission?: boolean
          penalty_percentage?: number | null
          max_marks?: number
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          submitted_at: string
          files: Json
          is_late: boolean
          marks: number | null
          feedback: string | null
          status: 'submitted' | 'graded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          submitted_at?: string
          files?: Json
          is_late?: boolean
          marks?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          submitted_at?: string
          files?: Json
          is_late?: boolean
          marks?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}