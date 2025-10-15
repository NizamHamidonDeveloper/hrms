"use client"

import { useSession } from 'next-auth/react'
import { FaUserCircle } from 'react-icons/fa'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Import or define the Profile interface for type safety
interface Profile {
  name: string;
  email: string;
  department: string;
  employeeId: string;
  manager: string;
  joined: string;
  phone: string;
  address: string;
  emergencyContact: string;
  image: string;
}

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editFields, setEditFields] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/employee/profile')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setProfile(data)
      } catch {
        setProfile({
          name: 'Sarah Chen',
          email: 'sarah.chen@example.com',
          department: 'Engineering',
          employeeId: 'EMP00123',
          manager: 'John Doe',
          joined: '15 March 2022',
          phone: '+6012-3456789',
          address: '123 Jalan ABC, Taman DEF, 55100 Kuala Lumpur, Malaysia',
          emergencyContact: 'Michael Chen (Father) - +6012-9876543',
          image: '',
        })
        toast.error('Failed to fetch profile from API, using mock data.')
      }
    }
    fetchProfile()
  }, [])

  async function handleSave() {
    try {
      // Always send the full profile (merge edits with current profile)
      const updatedProfile = { ...profile, ...editFields }
      const res = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setProfile(data)
      setEditOpen(false)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile to API. Changes are only local.')
    }
  }

  if (status === 'loading' || !profile) {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  // Use profile state for all fields
  const {
    name = 'Sarah Chen',
    email = 'sarah.chen@example.com',
    image = '',
    department = 'Engineering',
    employeeId = 'EMP00123',
    manager = 'John Doe',
    joined = '15 March 2022',
    phone = '+6012-3456789',
    address = '123 Jalan ABC, Taman DEF, 55100 Kuala Lumpur, Malaysia',
    emergencyContact = 'Michael Chen (Father) - +6012-9876543',
  } = profile || {}

  // Fallback for role (not always present on session.user)
  const role = (session?.user && 'role' in session.user ? (session.user as { role?: string }).role : undefined) || 'Employee';

  const imageSrc: string | undefined = (image && typeof image === 'string') ? image : undefined;

  return (
    <div className="p-8 bg-teal-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">View and manage your personal information</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                {imageSrc ? (
                  <Image src={imageSrc} alt={name} className="h-16 w-16 rounded-full object-cover" width={64} height={64} />
                ) : (
                  <FaUserCircle className="text-gray-400 text-4xl" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
          </div>
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-sm text-gray-900">{employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reporting Manager</p>
                    <p className="text-sm text-gray-900">{manager}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Joined</p>
                    <p className="text-sm text-gray-900">{joined}</p>
                  </div>
                </div>
              </div>
              {/* Contact Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-sm text-gray-900">{phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                    <p className="text-sm text-gray-900">{emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end">
              <button onClick={() => { setEditFields(profile); setEditOpen(true); }} className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold shadow-md hover:from-teal-600 hover:to-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for editing profile */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm" aria-modal="true" role="dialog" onClick={() => setEditOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative mx-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-2xl font-bold focus:outline-none" aria-label="Close">&times;</button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={editFields?.name || ''} onChange={e => setEditFields({ ...(profile as Profile), ...(editFields as Profile), name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={editFields?.phone || ''} onChange={e => setEditFields({ ...(profile as Profile), ...(editFields as Profile), phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={editFields?.address || ''} onChange={e => setEditFields({ ...(profile as Profile), ...(editFields as Profile), address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={editFields?.emergencyContact || ''} onChange={e => setEditFields({ ...(profile as Profile), ...(editFields as Profile), emergencyContact: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button onClick={() => setEditOpen(false)} className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold shadow-md hover:from-teal-600 hover:to-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 