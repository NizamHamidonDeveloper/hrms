'use client'

import React from 'react'
import { useSession } from 'next-auth/react'

export default function TeamPage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <div className="p-6 bg-white min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 shadow-sm hover:shadow-md transition" aria-label="Team Directory" tabIndex={0}>
          <h2 className="text-lg font-semibold text-purple-800 mb-2">Team Directory</h2>
          <ul className="text-purple-900 text-sm list-disc pl-5">
            <li>No team members found</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 