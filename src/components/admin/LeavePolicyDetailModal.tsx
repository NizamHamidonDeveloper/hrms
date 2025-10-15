'use client';
import React from 'react';

interface LeavePolicyDetail {
  id: string;
  name: string;
  description: string;
  entitlement: string;
  conditions: string;
  documentation: string;
}

interface LeavePolicyDetailModalProps {
  open: boolean;
  onClose: () => void;
  policy: LeavePolicyDetail | null;
  onEdit: (policyId: string) => void;
}

export default function LeavePolicyDetailModal({ open, onClose, policy, onEdit }: LeavePolicyDetailModalProps) {
  if (!open || !policy) return null;
  return (
    <div className="fixed z-40 inset-0 overflow-y-auto flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 sm:mx-auto">
        <div className="px-6 pt-6 pb-2 border-b border-gray-100 flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
            <i className="fas fa-file-alt text-teal-600"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
          <div><span className="font-medium">Description:</span> {policy.description}</div>
          <div><span className="font-medium">Entitlement Rules:</span> {policy.entitlement}</div>
          <div><span className="font-medium">Conditions & Procedures:</span> {policy.conditions}</div>
          <div><span className="font-medium">Documentation Required:</span> {policy.documentation}</div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            onClick={() => onEdit(policy.id)}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Edit Policy
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 