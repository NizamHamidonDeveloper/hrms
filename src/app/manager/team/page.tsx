"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from '@headlessui/react';

const mockTeam = [
  {
    id: 'EMP00123',
    name: 'Sarah Chen',
    role: 'Software Engineer',
    status: 'Active',
    email: 'sarah.chen@company.com',
    phone: '+65 8123 4567',
  },
  {
    id: 'EMP00456',
    name: 'Michael Johnson',
    role: 'QA Analyst',
    status: 'On Leave',
    email: 'michael.johnson@company.com',
    phone: '+65 8234 5678',
  },
  {
    id: 'EMP00789',
    name: 'Lisa Wong',
    role: 'UI/UX Designer',
    status: 'Active',
    email: 'lisa.wong@company.com',
    phone: '+65 8345 6789',
  },
  {
    id: 'EMP00999',
    name: 'Alicia Tan',
    role: 'Product Manager',
    status: 'Active',
    email: 'alicia.tan@company.com',
    phone: '+65 8456 7890',
  },
  {
    id: 'EMP00234',
    name: 'Ravi Kumar',
    role: 'Backend Developer',
    status: 'Inactive',
    email: 'ravi.kumar@company.com',
    phone: '+65 8567 8901',
  },
];

// Assuming team: { id: string; name: string; role: string; status: string; email: string; phone: string; }
type TeamMember = {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  phone: string;
};

export default function ManagerTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/manager/team')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setTeam(data);
        setLoading(false);
      })
      .catch(() => {
        setTeam(mockTeam);
        setError('Failed to fetch from API, using mock data.');
        setLoading(false);
      });
  }, []);

  const handleView = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };
  const handleMessage = (member: TeamMember) => {};

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Team (Manager)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">View and manage your team members. Use the controls below to filter or update team information.</p>
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-label="Team members">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {team.map((member, idx) => (
                <tr 
                  key={member.id} 
                  className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors`}
                  tabIndex={0}
                  role="row"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{member.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' :
                        member.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-200 text-gray-600'
                      }`}
                      role="status"
                      aria-label={`Status: ${member.status}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors" 
                      onClick={() => handleView(member)}
                      aria-label={`View ${member.name}'s profile`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* View Member Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">Team Member Details</Dialog.Title>
            {selectedMember && (
              <div className="space-y-2">
                <div><span className="font-semibold">Name:</span> {selectedMember.name}</div>
                <div><span className="font-semibold">Role:</span> {selectedMember.role}</div>
                <div><span className="font-semibold">Status:</span> {selectedMember.status}</div>
                <div><span className="font-semibold">Email:</span> {selectedMember.email}</div>
                <div><span className="font-semibold">Phone:</span> {selectedMember.phone}</div>
              </div>
            )}
            <button onClick={handleCloseModal} className="mt-6 w-full py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700">Close</button>
          </div>
        </div>
      </Dialog>
    </main>
  );
} 