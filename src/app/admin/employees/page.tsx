'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { UserCircleIcon, PencilSquareIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { getRoleNameById, ROLE_LABELS, ROLE_NAME_TO_ID } from '@/lib/roles';

const roleColors: Record<string, string> = {
  employee: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
  hr_admin: 'bg-teal-100 text-teal-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-200 text-gray-500',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// Employee type
export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  department: string;
  role: string;
  reportingManager: string;
  status: string;
  state: string;
  gender: string;
  race: string;
  initialPassword?: string;
}

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  // Debug: Show current user roles
  const userRoles = session?.user?.roles;

  // Add local state for employees, loading, and error
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for fallback - moved inside useEffect to avoid dependency issues

  // Fetch employees with fallback
  useEffect(() => {
    // Mock data for fallback
    const mockEmployees: Employee[] = [
      {
        id: '1',
        userId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        role: 'employee',
        reportingManager: 'Jane Smith',
        status: 'active',
        state: 'Selangor',
        gender: 'Male',
        race: 'Malay',
        initialPassword: '',
      },
      // Add more mock employees as needed
    ];

    setLoading(true);
    setError(null);
    fetch('/api/admin/employees')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(() => {
        setEmployees(mockEmployees);
        setError('Failed to fetch employees from API, using mock data.');
        setLoading(false);
      });
  }, []);

  const departments: string[] = ['All', ...Array.from(new Set(employees.map((e: Employee) => e.department))) as string[]];
  const statuses: string[] = ['All', 'active', 'inactive'];

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchesDept = department === 'All' || emp.department === department;
      const matchesStatus = status === 'All' || emp.status === status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, search, department, status]);
  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => { setCurrentPage(1); }, [search, department, status]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Add Employee form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Employee>({
    defaultValues: {
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: 'employee',
      reportingManager: '',
      initialPassword: '',
      status: 'active',
      state: '',
      gender: '',
      race: '',
    },
  });

  const departmentOptions = [
    '', 'Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations'
  ];
  const roleOptions = [
    '', 'Employee', 'Manager', 'HR Admin'
  ];
  const managerOptions = [
    '', 'John Doe (Engineering Manager)', 'Jane Smith (Director)', 'Emily Carter (HR Admin - for HR staff)'
  ];
  const stateOptions = [
    '', 'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
  ];
  const genderOptions = [
    '', 'Male', 'Female'
  ];
  const raceOptions = [
    '', 'Malay', 'Chinese', 'Indian', 'Others'
  ];

  const openAddModal = () => {
    setIsAddModalOpen(true);
    reset();
    setModalLoading(false);
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    reset();
    setModalLoading(false);
  };

  const onAddEmployee = async (data: Employee) => {
    setModalLoading(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('API error');
      const newEmployee = await res.json();
      setEmployees(prev => [...prev, newEmployee]);
      closeAddModal();
      toast.success('Employee added successfully.');
    } catch {
      setModalLoading(false);
      toast.error('Failed to add employee.');
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditForm(emp);
    setIsEditModalOpen(true);
    setModalLoading(false);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm(null);
    setModalLoading(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const onEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/employees/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('API error');
      const updatedEmployee = await res.json();
      setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
      closeEditModal();
      toast.success('Employee updated successfully.');
    } catch {
      setModalLoading(false);
      toast.error('Failed to update employee.');
    }
  };

  const openDeleteModal = (emp: Employee) => {
    setDeleteTarget(emp);
    setIsDeleteModalOpen(true);
    setModalLoading(false);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setModalLoading(false);
  };

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/employees/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('API error');
      await res.json();
      setEmployees(prev => prev.filter(emp => emp.id !== deleteTarget.id));
      closeDeleteModal();
      toast.success('Employee deleted successfully.');
    } catch {
      setModalLoading(false);
      toast.error('Failed to delete employee.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading employees...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">{error}</div>;
  }

  return (
    <div className="p-8 relative">
      {/* DEBUG: Show current user roles */}
      <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
        <strong>DEBUG:</strong> User roles from session: <pre>{JSON.stringify(userRoles)}</pre>
        <div>Status: {sessionStatus}</div>
      </div>
      <h1 className="text-3xl font-bold mb-6">Employee Management</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-gray-700"
            value={department}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartment(e.target.value)}
          >
            {departments.map((dept: string) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-gray-700"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
          >
            {statuses.map((s: string) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow px-6 py-3 text-base transition-all hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
          style={{ minWidth: 180 }}
          onClick={openAddModal}
          aria-label="Add Employee"
        >
          <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
          Add Employee
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" aria-label="Employee Table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-lg">No employees found.</td>
              </tr>
            ) : (
              paginatedEmployees.map((emp: Employee, idx: number) => (
                <tr
                  key={emp.id}
                  tabIndex={0}
                  className={`focus:outline-none focus:ring-2 focus:ring-teal-500 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-teal-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-500 font-bold text-lg border border-gray-200">
                      {getInitials(emp.name)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${roleColors[emp.role] || 'bg-gray-100 text-gray-700'}`}>
                      {emp.role === 'employee' && <UserCircleIcon className="h-4 w-4" />}
                      {emp.role === 'manager' && <PencilSquareIcon className="h-4 w-4" />}
                      {emp.role === 'hr_admin' && <UserCircleIcon className="h-4 w-4" />}
                      {ROLE_LABELS[emp.role] || emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status] || 'bg-gray-100 text-gray-700'}`}>{emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="rounded-full border border-teal-600 text-teal-700 bg-white shadow px-4 py-2 font-semibold" title="Edit" onClick={() => openEditModal(emp)}>
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 font-semibold" title="Delete" onClick={() => openDeleteModal(emp)}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <span className="text-sm text-gray-600">Showing {paginatedEmployees.length} of {employees.length}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} aria-label="Previous page">Prev</button>
            <button className="px-3 py-1 rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} aria-label="Next page">Next</button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={closeModal} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white rounded-lg shadow-xl sm:max-w-2xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 z-10 font-sans">
              <Dialog.Title className="text-lg font-bold mb-4">Employee Details</Dialog.Title>
              {selectedEmployee && typeof selectedEmployee === 'object' && (
                <div className="space-y-2">
                  <div><span className="font-semibold">Name:</span> {selectedEmployee.name}</div>
                  <div><span className="font-semibold">Email:</span> {selectedEmployee.email}</div>
                  <div><span className="font-semibold">Department:</span> {selectedEmployee.department}</div>
                  <div><span className="font-semibold">Role:</span> {selectedEmployee.role}</div>
                  <div><span className="font-semibold">Status:</span> {selectedEmployee.status}</div>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Close</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onClose={closeAddModal} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black opacity-30" />
            <form
              onSubmit={handleSubmit(onAddEmployee)}
              className="relative bg-white rounded-lg shadow-xl sm:max-w-2xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 z-10 font-sans"
            >
              <Dialog.Title className="text-lg font-bold mb-4">Add New Employee</Dialog.Title>
              <div className="overflow-y-auto max-h-[50vh] sm:max-h-[60vh] px-1 sm:px-2 pb-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">User ID *</label>
                  <input {...register('userId', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., EMP00155" />
                  {errors.userId && <span className="text-red-600 text-xs">User ID is required</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input {...register('firstName', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2" />
                    {errors.firstName && <span className="text-red-600 text-xs">First Name is required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input {...register('lastName', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2" />
                    {errors.lastName && <span className="text-red-600 text-xs">Last Name is required</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <input {...register('email', { required: true })} type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="user@example.com" />
                  {errors.email && <span className="text-red-600 text-xs">Email is required</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select {...register('department', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2">
                      {departmentOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Department'}</option>)}
                    </select>
                    {errors.department && <span className="text-red-600 text-xs">Department is required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select {...register('role', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2">
                      {roleOptions.map((opt: string) => <option key={opt} value={opt ? getRoleNameById(ROLE_NAME_TO_ID[opt.toLowerCase().replace(' ', '_')]) : ''}>{opt || 'Select Role'}</option>)}
                    </select>
                    {errors.role && <span className="text-red-600 text-xs">Role is required</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Reporting Manager</label>
                  <select {...register('reportingManager')} className="w-full border border-gray-300 rounded px-3 py-2">
                    {managerOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Manager (if applicable)'}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Initial Password *</label>
                  <input {...register('initialPassword', { required: true, minLength: 8 })} type="password" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Min. 8 characters" />
                  <p className="mt-1 text-xs text-gray-500">User will be prompted to change this on first login.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">State in Malaysia</label>
                    <select {...register('state')} className="w-full border border-gray-300 rounded px-3 py-2">
                      {stateOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select State'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select {...register('gender')} className="w-full border border-gray-300 rounded px-3 py-2">
                      {genderOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Gender'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Race</label>
                    <select {...register('race')} className="w-full border border-gray-300 rounded px-3 py-2">
                      {raceOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Race'}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select {...register('status', { required: true })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 border-t border-gray-100 pt-4 bg-white">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  disabled={modalLoading}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 hover:bg-teal-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  disabled={modalLoading}
                  aria-label="Add"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
      {isEditModalOpen && editForm && (
        <Dialog open={isEditModalOpen} onClose={closeEditModal} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black opacity-30" />
            <form onSubmit={onEditEmployee} className="relative bg-white rounded-lg shadow-xl sm:max-w-2xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 z-10 font-sans">
              <Dialog.Title className="text-lg font-bold mb-4">Edit Employee</Dialog.Title>
              <div className="overflow-y-auto max-h-[50vh] sm:max-h-[60vh] px-1 sm:px-2 pb-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">User ID *</label>
                  <input name="userId" value={editForm.userId || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" readOnly />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input name="firstName" value={editForm.firstName || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input name="lastName" value={editForm.lastName || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <input name="email" value={editForm.email || ''} onChange={handleEditChange} type="email" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select name="department" value={editForm.department || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      {departmentOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Department'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select name="role" value={editForm.role || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      {roleOptions.map((opt: string) => <option key={opt} value={opt ? getRoleNameById(ROLE_NAME_TO_ID[opt.toLowerCase().replace(' ', '_')]) : ''}>{opt || 'Select Role'}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Reporting Manager</label>
                  <select name="reportingManager" value={editForm.reportingManager || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                    {managerOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Manager (if applicable)'}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Initial Password *</label>
                  <input name="initialPassword" value={editForm.initialPassword || ''} onChange={handleEditChange} type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <p className="mt-1 text-xs text-gray-500">User will be prompted to change this on first login.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">State in Malaysia</label>
                    <select name="state" value={editForm.state || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      {stateOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select State'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select name="gender" value={editForm.gender || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      {genderOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Gender'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Race</label>
                    <select name="race" value={editForm.race || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      {raceOptions.map((opt: string) => <option key={opt} value={opt}>{opt || 'Select Race'}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" value={editForm.status || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 border-t border-gray-100 pt-4 bg-white">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  disabled={modalLoading}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 hover:bg-teal-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  disabled={modalLoading}
                  aria-label="Save"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
      {isDeleteModalOpen && (
        <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white rounded-lg shadow-xl sm:max-w-md w-full max-h-[90vh] flex flex-col p-4 sm:p-6 z-10 font-sans">
              <Dialog.Title className="text-lg font-bold mb-4 text-red-700">Delete Employee</Dialog.Title>
              <div className="mb-4">Are you sure you want to delete <span className="font-semibold">{selectedEmployee?.name}</span>? This action cannot be undone.</div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 border-t border-gray-100 pt-4 bg-white">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEmployee}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 