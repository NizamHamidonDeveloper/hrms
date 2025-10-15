'use client';

import React from 'react';

export interface LeavePolicy {
  id: string;
  name: string;
  description: string;
  keyEntitlementRule: string;
  status: 'active' | 'inactive' | 'requires_approval';
  lastUpdated: string; // ISO date string
}

interface LeavePolicyListProps {
  policies: LeavePolicy[];
  onViewDetails: (policyId: string) => void;
  onEdit: (policyId: string) => void;
  onDelete: (policyId: string) => void;
  onApprove: (policyId: string) => void;
  isHRAdmin: boolean;
}

const statusMap = {
  active: 'bg-teal-100 text-teal-800',
  inactive: 'bg-gray-100 text-gray-800',
  requires_approval: 'bg-yellow-100 text-yellow-800',
};

const statusLabel = {
  active: 'Active',
  inactive: 'Inactive',
  requires_approval: 'Requires Approval',
};

export default function LeavePolicyList({ policies, onViewDetails, onEdit, onDelete, onApprove, isHRAdmin }: LeavePolicyListProps) {
  return (
    <>
      {/* Table for md+ screens */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Entitlement Rule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={policy.description}>{policy.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.keyEntitlementRule}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[policy.status]}`}>{statusLabel[policy.status]}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {policy.status === 'requires_approval' ? 'HR Admin' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.lastUpdated}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                  <button
                    onClick={() => onEdit(policy.id)}
                    className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold"
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    onClick={() => onViewDetails(policy.id)}
                    className="rounded-full border border-teal-600 text-teal-700 bg-white shadow px-4 py-2 font-semibold"
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                  <button
                    onClick={() => onDelete(policy.id)}
                    className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 font-semibold"
                  >
                    <i className="fas fa-trash mr-1"></i> Delete
                  </button>
                  {policy.status === 'requires_approval' && isHRAdmin && (
                    <button
                      onClick={() => onApprove(policy.id)}
                      className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold flex items-center gap-2"
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Card layout for mobile screens */}
      <div className="md:hidden space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">{policy.name}</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[policy.status]}`}>{statusLabel[policy.status]}</span>
            </div>
            <div className="text-sm text-gray-500">{policy.description}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Entitlement:</span> {policy.keyEntitlementRule}</div>
            <div className="text-sm text-gray-500"><span className="font-medium text-gray-700">Last Updated:</span> {policy.lastUpdated}</div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => onEdit(policy.id)}
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold"
              >
                <i className="fas fa-edit mr-1"></i> Edit
              </button>
              <button
                onClick={() => onViewDetails(policy.id)}
                className="rounded-full border border-teal-600 text-teal-700 bg-white shadow px-4 py-2 font-semibold"
              >
                <i className="fas fa-eye mr-1"></i> View
              </button>
              <button
                onClick={() => onDelete(policy.id)}
                className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 font-semibold"
              >
                <i className="fas fa-trash mr-1"></i> Delete
              </button>
              {policy.status === 'requires_approval' && isHRAdmin && (
                <button
                  onClick={() => onApprove(policy.id)}
                  className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold flex items-center gap-2"
                >
                  <i className="fas fa-check"></i> Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 