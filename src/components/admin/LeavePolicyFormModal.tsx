'use client';
import React, { useState, useEffect } from 'react';

export interface LeavePolicyFormData {
  id?: string;
  name: string;
  description: string;
  keyEntitlementRule: string;
  status: 'active' | 'inactive' | 'requires_approval';
  lastUpdated: string;
  entitlement: string;
  conditions: string;
  documentation: string;
}

interface LeavePolicyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeavePolicyFormData) => void;
  initialData?: LeavePolicyFormData | null;
  mode: 'create' | 'edit';
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'requires_approval', label: 'Requires Approval' },
];

export default function LeavePolicyFormModal({ open, onClose, onSubmit, initialData, mode }: LeavePolicyFormModalProps) {
  const [form, setForm] = useState<LeavePolicyFormData>({
    name: '',
    description: '',
    keyEntitlementRule: '',
    status: 'active',
    lastUpdated: '',
    entitlement: '',
    conditions: '',
    documentation: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: '',
        description: '',
        keyEntitlementRule: '',
        status: 'active',
        lastUpdated: '',
        entitlement: '',
        conditions: '',
        documentation: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, lastUpdated: new Date().toISOString().slice(0, 10) });
  };

  if (!open) return null;
  return (
    <div className="fixed z-40 inset-0 overflow-y-auto flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 sm:mx-auto">
        <div className="px-6 pt-6 pb-2 border-b border-gray-100 flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
            <i className="fas fa-file-alt text-teal-600"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{mode === 'create' ? 'Add New Leave Policy' : 'Edit Leave Policy'}</h3>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Policy Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Key Entitlement Rule</label>
            <input name="keyEntitlementRule" value={form.keyEntitlementRule} onChange={handleChange} required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm">
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Entitlement Rules</label>
            <textarea name="entitlement" value={form.entitlement} onChange={handleChange} required rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Conditions & Procedures</label>
            <textarea name="conditions" value={form.conditions} onChange={handleChange} required rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Documentation Required</label>
            <textarea name="documentation" value={form.documentation} onChange={handleChange} required rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm" />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {mode === 'create' ? 'Add Policy' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 