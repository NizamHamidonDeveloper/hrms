'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useContext, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { RoleContext } from '@/components/common/RoleProvider'
import { ROLE_ID } from '@/lib/roles'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  // Determine available roles based on backend role_id
  const availableRoleIds = useMemo(() => {
    const profile = (session as { profile?: { role_id?: number } })?.profile || (session as { user?: { profile?: { role_id?: number } } })?.user?.profile
    const roleId = profile && profile.role_id ? Number(profile.role_id) : undefined
    if (roleId === ROLE_ID.HR_ADMIN) {
      return [ROLE_ID.HR_ADMIN, ROLE_ID.EMPLOYEE]
    } else if (roleId === ROLE_ID.MANAGER) {
      return [ROLE_ID.MANAGER, ROLE_ID.EMPLOYEE]
    } else if (roleId === ROLE_ID.EMPLOYEE) {
      return [ROLE_ID.EMPLOYEE]
    }
    // Fallback: just employee
    return [ROLE_ID.EMPLOYEE]
  }, [session])
  const { activeRole, setActiveRole } = useContext(RoleContext)
  const [activeRoleId, setActiveRoleId] = useState<number>(availableRoleIds[0])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // On mount, set context if not set
  useEffect(() => {
    if (typeof activeRole !== 'number' || !availableRoleIds.includes(activeRole)) {
      setActiveRole(availableRoleIds[0])
    }
  }, [activeRole, availableRoleIds, setActiveRole])

  // Keep local state in sync with context
  useEffect(() => {
    if (typeof activeRole === 'number' && availableRoleIds.includes(activeRole)) {
      setActiveRoleId(activeRole)
    }
  }, [activeRole, availableRoleIds])

  // Debounced redirect on role change
  useEffect(() => {
    const roleId = activeRoleId ?? availableRoleIds[0]
    const timeout = setTimeout(() => {
      if (roleId === ROLE_ID.HR_ADMIN) {
        router.push('/admin/dashboard')
      } else if (roleId === ROLE_ID.MANAGER) {
        router.push('/manager/dashboard')
      } else if (roleId === ROLE_ID.EMPLOYEE) {
        router.push('/employee/dashboard')
      }
    }, 150)
    return () => clearTimeout(timeout)
  }, [activeRoleId, availableRoleIds, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const effectiveRoleId = activeRoleId ?? availableRoleIds[0]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeRoleId={effectiveRoleId} />
      <div className="flex-1 flex flex-col">
        <Header
          userName={session.user.name || ''}
          userRoleId={effectiveRoleId}
          userAvatar={session.user.image || ''}
          availableRoleIds={availableRoleIds}
          activeRoleId={effectiveRoleId}
          onRoleChange={(roleId: number) => setActiveRole(roleId)}
        />
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 