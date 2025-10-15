import { Fragment } from 'react'
import { Menu, Transition, Listbox } from '@headlessui/react'
import { BellIcon, UserCircleIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { ROLE_LABELS, ROLE_ID, RoleKey } from '@/lib/roles'
import { getRoleNameById } from '@/lib/roles'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userName: string
  userRoleId: number
  userAvatar?: string
  availableRoleIds?: number[]
  activeRoleId?: number
  onRoleChange?: (roleId: number) => void
}

export default function Header({ userName, userRoleId, userAvatar, availableRoleIds = [userRoleId], activeRoleId, onRoleChange }: HeaderProps) {
  const showRoleSwitcher = availableRoleIds.length > 1
  const currentRoleId = activeRoleId ?? userRoleId
  const currentRoleName = getRoleNameById(currentRoleId) || currentRoleId
  const currentRoleLabel = ROLE_LABELS[currentRoleName] || currentRoleName || 'Unknown'
  const router = useRouter();

  // Centralized role change handler
  const handleRoleChange = (roleId: number) => {
    if (onRoleChange) {
      onRoleChange(roleId);
      // Navigate to the correct dashboard for the selected role
      if (roleId === ROLE_ID.HR_ADMIN) {
        router.replace('/admin/dashboard');
      } else if (roleId === ROLE_ID.MANAGER) {
        router.replace('/manager/dashboard');
      } else if (roleId === ROLE_ID.EMPLOYEE) {
        router.replace('/employee/dashboard');
      }
    }
  };

  return (
    <header className="bg-white shadow-sm h-20 border-b border-gray-100">
      <div className="pl-0 md:pl-64 mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="flex h-full justify-between items-center w-full">
          {/* Logo removed for alignment */}
          <div />

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-primary-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Role Switcher */}
            {showRoleSwitcher && (
              <Listbox value={currentRoleId} onChange={handleRoleChange}>
                <div className="relative">
                  <Listbox.Button className="flex items-center px-3 py-1 border border-gray-200 rounded-md bg-white text-sm text-gray-700 shadow-sm focus:outline-none">
                    <span className="mr-2">{currentRoleLabel}</span>
                    <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {availableRoleIds.map((roleId) => (
                        <Listbox.Option
                          key={roleId}
                          value={roleId}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? 'bg-teal-50 text-teal-800' : 'text-gray-700'}`
                          }
                        >
                          {ROLE_LABELS[getRoleNameById(roleId) || roleId] || getRoleNameById(roleId) || roleId}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500">{currentRoleLabel}</p>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={currentRoleId === ROLE_ID.EMPLOYEE ? '/employee/profile' : '/profile'}
                        className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                      >
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={currentRoleId === ROLE_ID.EMPLOYEE ? '/employee/settings' : '/settings'}
                        className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                      >
                        Settings
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}