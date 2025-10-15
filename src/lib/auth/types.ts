import { DefaultSession } from 'next-auth'

export type UserRole = '4' | '3' | '5' | 'hr_admin' | 'manager' | 'employee'

export interface User {
  id: string
  email: string
  name: string
  roles: UserRole[]
  department: string
  managerId?: string
  joinDate: Date
  status: 'active' | 'inactive'
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      roles: UserRole[]
      image?: string
      name: string
      email: string
    } & Omit<DefaultSession['user'], 'image' | 'name' | 'email'>
  }

  interface User {
    roles: UserRole[]
  }
} 