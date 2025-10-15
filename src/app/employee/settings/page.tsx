'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiMail, FiBell, FiMoon, FiSun, FiShield, FiHelpCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { status } = useSession()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [supportOpen, setSupportOpen] = useState(false)
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null)

  const recentLogins = [
    { date: '2024-06-10 09:12', device: 'Chrome on Windows', location: 'Kuala Lumpur, MY' },
    { date: '2024-06-09 21:45', device: 'Safari on iPhone', location: 'Petaling Jaya, MY' },
    { date: '2024-06-08 14:30', device: 'Edge on Mac', location: 'Singapore' },
  ]

  useEffect(() => {
    async function fetchSettings() {
      try {
        setFallbackWarning(null)
        const res = await fetch('/api/employee/settings')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setEmail(data.email || '')
        setEmailNotif(data.emailNotif ?? true)
        setPushNotif(data.pushNotif ?? false)
        setTheme(data.theme ?? 'light')
      } catch {
        setFallbackWarning('Failed to fetch settings from API, using mock data.')
        setEmail('sarah.chen@example.com')
        setEmailNotif(true)
        setPushNotif(false)
        setTheme('light')
        toast.error('Failed to fetch settings from API, using mock data.')
      }
    }
    fetchSettings()
  }, [])

  async function handleUpdate() {
    try {
      setFallbackWarning(null)
      const res = await fetch('/api/employee/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, emailNotif, pushNotif, theme })
      })
      if (!res.ok) throw new Error('API error')
      toast.success('Settings updated successfully!')
    } catch {
      setFallbackWarning('Failed to update settings to API. Changes are only local.')
      toast.error('Failed to update settings to API. Changes are only local.')
    }
  }

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
    <div className="p-8 bg-teal-50 min-h-screen text-gray-900">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage your account, preferences, and security</p>
        </div>

        {/* Account Settings */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="flex items-center text-lg font-semibold mb-2"><FiMail className="mr-2 text-teal-600" /> Account Settings</h2>
          {fallbackWarning && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-xl shadow-sm">{fallbackWarning}</div>
          )}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
              <input id="email" type="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="current-password">Current Password</label>
              <input id="current-password" type="password" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="button" onClick={handleUpdate} className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold shadow-md hover:from-teal-600 hover:to-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition">Update Account</button>
          </form>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="flex items-center text-lg font-semibold mb-2"><FiBell className="mr-2 text-teal-600" /> Notification Preferences</h2>
          <div className="flex items-center justify-between">
            <span>Email notifications</span>
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(v => !v)} className="form-checkbox h-5 w-5 text-teal-600 focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" />
          </div>
          <div className="flex items-center justify-between">
            <span>Push notifications</span>
            <input type="checkbox" checked={pushNotif} onChange={() => setPushNotif(v => !v)} className="form-checkbox h-5 w-5 text-teal-600 focus:ring-2 focus:ring-teal-400 focus-visible:ring-4" />
          </div>
        </section>

        {/* Personalization */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="flex items-center text-lg font-semibold mb-2"><FiMoon className="mr-2 text-teal-600" /> Personalization</h2>
          <div className="flex items-center space-x-4">
            <span>Theme:</span>
            <button type="button" onClick={() => setTheme('light')} className={`px-4 py-2 rounded-full border ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'} border-gray-200 hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition`}> <FiSun className="inline mr-1" /> Light</button>
            <button type="button" onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-full border ${theme === 'dark' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'} border-gray-200 hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition`}> <FiMoon className="inline mr-1" /> Dark</button>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="flex items-center text-lg font-semibold mb-2"><FiShield className="mr-2 text-teal-600" /> Privacy & Security</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Device</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((login, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2 whitespace-nowrap">{login.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{login.device}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{login.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Support */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="flex items-center text-lg font-semibold mb-2"><FiHelpCircle className="mr-2 text-teal-600" /> Support</h2>
          <button onClick={() => setSupportOpen(true)} className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold shadow-md hover:from-teal-600 hover:to-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 transition">Contact HR / Help Center</button>
          {supportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">Contact HR / Help Center</h3>
                <p className="mb-4 text-gray-700">For urgent matters, email <a href="mailto:hr@example.com" className="text-teal-700 underline">hr@example.com</a> or call +6012-3456789.</p>
                <button onClick={() => setSupportOpen(false)} className="mt-2 px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300">Close</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
} 