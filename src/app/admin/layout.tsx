'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useSession } from 'next-auth/react'
import { useContext, useMemo } from 'react'
import { RoleContext, RoleProvider } from '@/components/common/RoleProvider'
import { ROLE_ID } from '@/lib/roles'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  // Determine available roles based on backend role_id
  const availableRoleIds = useMemo(() => {
    const profile = (session as { profile?: { role_id?: number } })?.profile || (session as { user?: { profile?: { role_id?: number } } })?.user?.profile
    const roleId = profile && profile.role_id ? Number(profile.role_id) : undefined
    if (roleId === ROLE_ID.HR_ADMIN) {
      return [ROLE_ID.HR_ADMIN, ROLE_ID.MANAGER, ROLE_ID.EMPLOYEE]
    } else if (roleId === ROLE_ID.MANAGER) {
      return [ROLE_ID.MANAGER, ROLE_ID.EMPLOYEE]
    } else if (roleId === ROLE_ID.EMPLOYEE) {
      return [ROLE_ID.EMPLOYEE]
    }
    // Fallback: just employee
    return [ROLE_ID.EMPLOYEE]
  }, [session])

  // Helper to get the highest available role
  const getHighestRole = (roles: number[]) => {
    if (roles.includes(ROLE_ID.HR_ADMIN)) return ROLE_ID.HR_ADMIN;
    if (roles.includes(ROLE_ID.MANAGER)) return ROLE_ID.MANAGER;
    return ROLE_ID.EMPLOYEE;
  };
  const initialRole = getHighestRole(availableRoleIds);

  // Show loading state while session is loading
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <RoleProvider initialRole={initialRole}>
      <AdminLayoutContent availableRoleIds={availableRoleIds} session={session || {}} handleRoleChange={undefined}>{children}</AdminLayoutContent>
    </RoleProvider>
  )
}

// Extracted content to a new component to use context as before
function AdminLayoutContent({ children, availableRoleIds, session }: { children: React.ReactNode, availableRoleIds: number[], session: { user?: { name?: string; image?: string } }, handleRoleChange: unknown }) {
  const { activeRole, setActiveRole } = useContext(RoleContext)
  const effectiveRoleId = typeof activeRole === 'number' ? activeRole : availableRoleIds[0];
  const handleRoleChange = (roleId: number) => {
    if (availableRoleIds.includes(roleId)) {
      setActiveRole(roleId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('hrms-active-role', String(roleId))
      }
    }
  }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeRoleId={effectiveRoleId} />
      <div className="flex-1 flex flex-col">
        <Header
          userName={session?.user?.name || ''}
          userRoleId={effectiveRoleId}
          userAvatar={session?.user?.image || ''}
          availableRoleIds={availableRoleIds}
          activeRoleId={effectiveRoleId}
          onRoleChange={handleRoleChange}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 