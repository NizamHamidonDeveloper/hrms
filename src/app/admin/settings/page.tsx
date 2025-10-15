"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/admin/MultiSelectDropdown";
import { Dialog } from '@headlessui/react';

// Simple unique ID generator
function genId() {
  return 'lt_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const DEFAULT_COLORS = [
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#f59e42", // orange
  "#f43f5e", // rose
  "#10b981", // emerald
  "#fbbf24", // amber
];

function randomColor() {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

// Simplified interface for leave type configuration
interface LeaveTypeConfig {
  name: string;
  color: string;
  enabled: boolean;
  displayUnit: string;
  visibleToPeers: boolean;
  visibleToSubordinates: boolean;
  entitlementType: string;
  entitlementValue: number;
  carryForward: boolean;
  maxCarry: number;
  carryExpiry: string;
  overAllowanceAllowed: boolean;
  proRata: boolean;
  encashment: boolean;
  maxEncash: number;
  negativeBalance: boolean;
  customCode: string;
  accrualTiers: { years: number; entitlement: number }[];
  approvalWorkflow: string;
  approverRoles?: string[];
  autoApproval?: boolean;
  escalateTo?: string;
  escalateAfterDays?: number;
  notificationOnRequest: boolean;
  notificationOnApproval: boolean;
  notificationOnReject: boolean;
  notificationOnCancel?: boolean;
  notifyByEmail?: boolean;
  notifyByInApp?: boolean;
  additionalNotified: string[];
  notificationTemplate?: string;
  minDuration: number;
  maxDuration: number;
  maxConsecutiveDays?: number;
  requiredDocuments?: string[];
  auditLog: boolean;
}

const defaultTypeConfig: LeaveTypeConfig = {
  name: '',
  color: '#14b8a6',
  enabled: true,
  displayUnit: 'days',
  visibleToPeers: true,
  visibleToSubordinates: false,
  entitlementType: 'annual',
  entitlementValue: 14,
  carryForward: false,
  maxCarry: 0,
  carryExpiry: '',
  overAllowanceAllowed: false,
  proRata: false,
  encashment: false,
  maxEncash: 0,
  negativeBalance: false,
  customCode: '',
  accrualTiers: [
    { years: 0, entitlement: 14 },
    { years: 5, entitlement: 20 },
  ],
  approvalWorkflow: 'Manager → HR',
  approverRoles: [],
  autoApproval: false,
  escalateTo: 'HR',
  escalateAfterDays: 3,
  notificationOnRequest: false,
  notificationOnApproval: false,
  notificationOnReject: false,
  notificationOnCancel: false,
  notifyByEmail: true,
  notifyByInApp: true,
  additionalNotified: [],
  notificationTemplate: 'Dear {{recipient}},\n\nYour leave request for {{leaveType}} has been {{status}}.\n\nRegards,\nHRMS',
  minDuration: 1,
  maxDuration: 30,
  maxConsecutiveDays: undefined,
  requiredDocuments: [],
  auditLog: false,
};

// Example departments and roles
const DEPARTMENTS = ["Engineering", "HR", "Finance", "Sales", "Marketing"];
const ROLES = ["employee", "manager", "hr_admin"];

// Tabs for config sections
const CONFIG_TABS = [
  { key: "general", label: "General" },
  { key: "entitlement", label: "Entitlement" },
  { key: "accrual", label: "Accrual" },
  { key: "approval", label: "Approval" },
  { key: "notifications", label: "Notifications" },
  { key: "restrictions", label: "Restrictions" },
  { key: "advanced", label: "Advanced" },
];

const MOCK_SETTINGS = {
  companyName: 'Acme Corp',
  leaveYearStart: '2024-01-01',
  workingDays: [1,2,3,4,5],
  blackoutDates: ['2024-12-25', '2024-12-31'],
  leaveSettings: {
    approvalWorkflow: 'Manager → HR',
    minNoticeDays: 2,
    halfDayAllowed: true,
    sickLeaveAttachmentRequired: true,
  },
  notificationSettings: {
    emailEnabled: false,
    inAppEnabled: true,
    smsEnabled: false,
  },
};

export default function AdminSettingsPage() {
  // Dynamic leave types state
  const [leaveTypes, setLeaveTypes] = useState([
    { id: genId(), name: "Annual Leave", color: "#14b8a6", enabled: true },
    { id: genId(), name: "Sick Leave", color: "#6366f1", enabled: true },
    { id: genId(), name: "Emergency Leave", color: "#f59e42", enabled: true },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState({ name: "", color: randomColor(), enabled: true });
  const [typeConfigs, setTypeConfigs] = useState<{ [id: string]: LeaveTypeConfig }>({});
  const [configModalId, setConfigModalId] = useState<string | null>(null);
  // Per-type restrictions
  const [typeRestrictions, setTypeRestrictions] = useState<{ [id: string]: { departments: string[]; roles: string[] } }>({});
  const [activeConfigTab, setActiveConfigTab] = useState("general");
  const [companyName, setCompanyName] = useState('');
  const [leaveYearStart, setLeaveYearStart] = useState('2024-01-01');
  const [workingDays, setWorkingDays] = useState<number[]>([1,2,3,4,5]);
  const [settingsBlackoutDates, setSettingsBlackoutDates] = useState<string[]>([]);
  const [leaveSettings, setLeaveSettings] = useState(MOCK_SETTINGS.leaveSettings);
  const [notificationSettings, setNotificationSettings] = useState(MOCK_SETTINGS.notificationSettings);
  const [settingsFallback, setSettingsFallback] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setCompanyName(data.companyName);
        setLeaveYearStart(data.leaveYearStart);
        setWorkingDays(data.workingDays);
        setSettingsBlackoutDates(data.blackoutDates);
        setLeaveSettings(data.leaveSettings);
        setNotificationSettings(data.notificationSettings);
        setSettingsFallback(false);
      } catch {
        setCompanyName(MOCK_SETTINGS.companyName);
        setLeaveYearStart(MOCK_SETTINGS.leaveYearStart);
        setWorkingDays(MOCK_SETTINGS.workingDays);
        setSettingsBlackoutDates(MOCK_SETTINGS.blackoutDates);
        setLeaveSettings(MOCK_SETTINGS.leaveSettings);
        setNotificationSettings(MOCK_SETTINGS.notificationSettings);
        setSettingsFallback(true);
        setSettingsError("Could not load settings from API. Using mock data.");
      } finally {
        setSettingsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          leaveYearStart,
          workingDays,
          blackoutDates: settingsBlackoutDates,
          leaveSettings,
          notificationSettings,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setSettingsFallback(false);
    } catch {
      setSettingsError("Could not save settings to API. Changes are not persisted.");
      setSettingsFallback(true);
    }
  }

  // Add new leave type
  function handleAddType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newType.name.trim()) return;
    setLeaveTypes(types => [
      ...types,
      { id: genId(), ...newType, name: newType.name.trim() },
    ]);
    setNewType({ name: "", color: randomColor(), enabled: true });
  }

  // Edit leave type
  function handleEditType(id: string, updates: Partial<{ name: string; color: string; enabled: boolean }>) {
    setLeaveTypes(types => types.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  // Delete leave type
  function handleDeleteType(id: string) {
    setLeaveTypes(types => types.filter(t => t.id !== id));
  }

  // Save config
  function saveConfig(id: string, config: LeaveTypeConfig) {
    setTypeConfigs(cfgs => ({ ...cfgs, [id]: config }));
    setConfigModalId(null);
  }


  // Update per-type restrictions
  function updateTypeRestriction(id: string, field: "departments" | "roles", values: string[]) {
    setTypeRestrictions(r => ({
      ...r,
      [id]: {
        departments: r[id]?.departments || [],
        roles: r[id]?.roles || [],
        [field]: values,
      },
    }));
  }

  // UI
  return (
    <div className="w-full px-0 sm:px-6 md:px-12 bg-gray-50 min-h-screen font-sans text-sm max-w-6xl mx-auto">
      <div className="py-6 flex flex-col gap-6 w-full">
        <div className="mb-6">
          <a href="/admin" className="text-sm text-teal-600 hover:text-teal-800 flex items-center mb-2">
            <span className="mr-2">&#8592;</span> Back to Admin Home
          </a>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">System Settings</h1>
          <p className="text-base text-gray-700">Configure global HRMS settings. Changes here affect all users and modules.</p>
        </div>

        {/* General Settings Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6 w-full">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">General Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-base font-medium text-gray-900 mb-2">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="mt-0 block w-full h-12 px-4 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner placeholder-gray-400"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="leaveYearStart" className="block text-base font-medium text-gray-900 mb-2">Leave Year Start</label>
              <input
                type="date"
                id="leaveYearStart"
                name="leaveYearStart"
                className="appearance-none mt-0 block w-full h-12 pl-4 pr-10 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner"
                value={leaveYearStart}
                onChange={e => setLeaveYearStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <label key={d} className="inline-flex items-center cursor-pointer bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-teal-50">
                    <input type="checkbox" className="form-checkbox text-teal-600 focus:ring-teal-500 mr-2" defaultChecked={workingDays.includes(Number(d.slice(1)))} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 w-full">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-full shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Leave Types Management Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 w-full">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Leave Types Management</h2>
          <form onSubmit={handleAddType} className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name</label>
              <input
                type="text"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={newType.name}
                onChange={e => setNewType(nt => ({ ...nt, name: e.target.value }))}
                placeholder="e.g. Maternity Leave"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                className="w-10 h-10 p-0 border-0 bg-transparent"
                value={newType.color}
                onChange={e => setNewType(nt => ({ ...nt, color: e.target.value }))}
                title="Pick a color for this leave type"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <input
                type="checkbox"
                checked={newType.enabled}
                onChange={e => setNewType(nt => ({ ...nt, enabled: e.target.checked }))}
                className="form-checkbox text-teal-600 focus:ring-teal-500"
                id="newTypeEnabled"
              />
              <label htmlFor="newTypeEnabled" className="text-sm text-gray-700">Enabled</label>
            </div>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500"
            >
              Add
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveTypes.map(type => (
                  <tr key={type.id} className="hover:bg-teal-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === type.id ? (
                        <input
                          type="text"
                          className="w-full h-9 px-2 border border-gray-200 rounded"
                          value={type.name}
                          onChange={e => handleEditType(type.id, { name: e.target.value })}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{type.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === type.id ? (
                        <input
                          type="color"
                          className="w-8 h-8 border-0 bg-transparent"
                          value={type.color}
                          onChange={e => handleEditType(type.id, { color: e.target.value })}
                        />
                      ) : (
                        <span className="inline-block w-6 h-6 rounded-full border border-gray-200 align-middle" style={{ background: type.color }} title={type.color}></span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={type.enabled}
                        onChange={e => handleEditType(type.id, { enabled: e.target.checked })}
                        className="form-checkbox text-teal-600 focus:ring-teal-500"
                        disabled={editingId !== type.id}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-teal-100 text-teal-700 text-xs font-semibold hover:bg-teal-200"
                        onClick={() => {
                          setConfigModalId(type.id);
                          setActiveConfigTab("general"); // Always start on General tab
                          // Optionally, initialize typeConfigs[type.id] if not present
                          if (!typeConfigs[type.id]) {
                            setTypeConfigs(cfgs => ({ ...cfgs, [type.id]: { ...defaultTypeConfig, name: type.name, color: type.color, enabled: type.enabled } }));
                          }
                        }}
                        type="button"
                      >
                        Configure
                      </button>
                      {editingId === type.id ? (
                        <>
                          <button
                            className="px-3 py-1 rounded bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600"
                            onClick={() => setEditingId(null)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                            onClick={() => setEditingId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                            onClick={() => setEditingId(type.id)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200"
                            onClick={() => handleDeleteType(type.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {leaveTypes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-6">No leave types defined yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Config Modal */}
        {configModalId && (
          <Dialog open={!!configModalId} onClose={() => setConfigModalId(null)} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
              <div className="fixed inset-0 bg-black opacity-30" />
              <div className="relative bg-white rounded-lg shadow-xl sm:max-w-4xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 z-10">
                <Dialog.Title className="text-lg font-bold mb-4">{leaveTypes.find(t => t.id === configModalId)?.name || "Leave Type"}</Dialog.Title>
                {/* Tabs */}
                <div className="sticky top-0 z-20 flex border-b border-gray-200 bg-white mb-4 overflow-x-auto rounded-t-lg">
                  {CONFIG_TABS.map((tab, idx) => {
                    const isActive = activeConfigTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        className={`relative py-2 px-4 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 whitespace-nowrap h-12 flex items-center justify-center
                          ${isActive ? 'font-semibold text-teal-600' : 'font-normal text-gray-500 hover:text-teal-600'}
                          ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === CONFIG_TABS.length - 1 ? 'rounded-r-lg' : ''}`}
                        style={{ minWidth: 120 }}
                        onClick={() => setActiveConfigTab(tab.key)}
                        type="button"
                      >
                        <span className="relative z-10">{tab.label}</span>
                        {isActive && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-teal-500 rounded-none" style={{ zIndex: 5 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Tab Content */}
                <div className="overflow-y-auto max-h-[50vh] sm:max-h-[60vh] px-1 sm:px-2 pb-2">
                  {activeConfigTab === "general" && (
                    <>
                      {/* General fields: color, enabled, visibility, display unit, etc. */}
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-900 mb-2">Color</label>
                        <input
                          type="color"
                          className="w-12 h-12 border-0 bg-transparent"
                          value={typeConfigs[configModalId]?.color}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], color: e.target.value } }))}
                        />
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.enabled}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], enabled: e.target.checked } }))}
                          id="enabled"
                        />
                        <label htmlFor="enabled" className="text-base font-medium text-gray-900">Enabled</label>
                      </div>
                      <div className="mb-4 flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={typeConfigs[configModalId]?.visibleToPeers || false}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], visibleToPeers: e.target.checked } }))}
                            className="form-checkbox text-teal-600 focus:ring-teal-500"
                            id="visibleToPeers"
                          />
                          <label htmlFor="visibleToPeers" className="text-sm">Visible to Peers</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={typeConfigs[configModalId]?.visibleToSubordinates || false}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], visibleToSubordinates: e.target.checked } }))}
                            className="form-checkbox text-teal-600 focus:ring-teal-500"
                            id="visibleToSubordinates"
                          />
                          <label htmlFor="visibleToSubordinates" className="text-sm">Visible to Subordinates</label>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-900 mb-2">Display Unit</label>
                        <select
                          className="w-full border border-gray-200 rounded h-10 px-2"
                          value={typeConfigs[configModalId]?.displayUnit || "days"}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], displayUnit: e.target.value } }))}
                        >
                          <option value="days">Days</option>
                          <option value="hours">Hours</option>
                        </select>
                      </div>
                    </>
                  )}
                  {activeConfigTab === "entitlement" && (
                    <>
                      {/* Entitlement fields: type, value, carry forward, expiry, over-allowance, pro-rata, encashment, negative balance, custom code */}
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-900 mb-2">Entitlement Type</label>
                        <select
                          className="w-full border border-gray-200 rounded h-10 px-2"
                          value={typeConfigs[configModalId]?.entitlementType}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], entitlementType: e.target.value } }))}
                        >
                          <option value="annual">Annual</option>
                          <option value="monthly">Monthly</option>
                          <option value="unlimited">Unlimited</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      {typeConfigs[configModalId]?.entitlementType !== "unlimited" && (
                        <div className="mb-4">
                          <label className="block text-base font-medium text-gray-900 mb-2">Entitlement Value</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-200 rounded h-10 px-2"
                            value={typeConfigs[configModalId]?.entitlementValue}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], entitlementValue: Number(e.target.value) } }))}
                          />
                        </div>
                      )}
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.carryForward}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], carryForward: e.target.checked } }))}
                          id="carryForward"
                        />
                        <label htmlFor="carryForward" className="text-base font-medium text-gray-900">Carry Forward</label>
                      </div>
                      {typeConfigs[configModalId]?.carryForward && (
                        <div className="mb-4 flex gap-4">
                          <div>
                            <label className="block text-base font-medium text-gray-900 mb-2">Max Carry</label>
                            <input
                              type="number"
                              min={0}
                              className="w-20 border border-gray-200 rounded h-10 px-2"
                              value={typeConfigs[configModalId]?.maxCarry}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], maxCarry: Number(e.target.value) } }))}
                            />
                          </div>
                          <div>
                            <label className="block text-base font-medium text-gray-900 mb-2">Carry Expiry</label>
                            <input
                              type="date"
                              className="w-36 border border-gray-200 rounded h-10 px-2"
                              value={typeConfigs[configModalId]?.carryExpiry}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], carryExpiry: e.target.value } }))}
                            />
                          </div>
                        </div>
                      )}
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.overAllowanceAllowed}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], overAllowanceAllowed: e.target.checked } }))}
                          id="overAllowanceAllowed"
                        />
                        <label htmlFor="overAllowanceAllowed" className="text-base font-medium text-gray-900">Permit Over-Allowance Requests</label>
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.proRata}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], proRata: e.target.checked } }))}
                          id="proRata"
                        />
                        <label htmlFor="proRata" className="text-base font-medium text-gray-900">Pro-Rata Calculation</label>
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.encashment}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], encashment: e.target.checked } }))}
                          id="encashment"
                        />
                        <label htmlFor="encashment" className="text-base font-medium text-gray-900">Encashment Allowed</label>
                        {typeConfigs[configModalId]?.encashment && (
                          <input
                            type="number"
                            min={0}
                            className="w-20 border border-gray-200 rounded h-10 px-2 ml-2"
                            value={typeConfigs[configModalId]?.maxEncash}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], maxEncash: Number(e.target.value) } }))}
                          />
                        )}
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.negativeBalance}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], negativeBalance: e.target.checked } }))}
                          id="negativeBalance"
                        />
                        <label htmlFor="negativeBalance" className="text-base font-medium text-gray-900">Allow Negative Balance</label>
                      </div>
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-900 mb-2">Custom Leave Code</label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded h-10 px-2"
                          value={typeConfigs[configModalId]?.customCode}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], customCode: e.target.value } }))}
                        />
                      </div>
                    </>
                  )}
                  {activeConfigTab === "accrual" && (
                    <>
                      {/* Accrual tiers */}
                      <div className="mb-4">
                        <label className="block text-base font-medium text-gray-900 mb-2">Entitlement Accrual</label>
                        <div className="space-y-2">
                          {typeConfigs[configModalId]?.accrualTiers?.map((tier, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="number"
                                min={0}
                                className="w-20 border border-gray-200 rounded h-10 px-2"
                                value={tier.years}
                                onChange={e => setTypeConfigs(cfgs => {
                                  const tiers = [...(cfgs[configModalId]?.accrualTiers || [])];
                                  tiers[idx].years = Number(e.target.value);
                                  return { ...cfgs, [configModalId]: { ...cfgs[configModalId], accrualTiers: tiers } };
                                })}
                                aria-label="Years of Service"
                              />
                              <span className="text-gray-500">years →</span>
                              <input
                                type="number"
                                min={1}
                                className="w-20 border border-gray-200 rounded h-10 px-2"
                                value={tier.entitlement}
                                onChange={e => setTypeConfigs(cfgs => {
                                  const tiers = [...(cfgs[configModalId]?.accrualTiers || [])];
                                  tiers[idx].entitlement = Number(e.target.value);
                                  return { ...cfgs, [configModalId]: { ...cfgs[configModalId], accrualTiers: tiers } };
                                })}
                                aria-label="Entitlement Value"
                              />
                              <span className="text-gray-500">{typeConfigs[configModalId]?.displayUnit === 'hours' ? 'hours' : 'days'}</span>
                              <button
                                type="button"
                                className="ml-2 px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200"
                                onClick={() => setTypeConfigs(cfgs => {
                                  const tiers = [...(cfgs[configModalId]?.accrualTiers || [])];
                                  tiers.splice(idx, 1);
                                  return { ...cfgs, [configModalId]: { ...cfgs[configModalId], accrualTiers: tiers } };
                                })}
                                aria-label="Remove tier"
                                disabled={typeConfigs[configModalId]?.accrualTiers?.length <= 1}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow hover:from-teal-600 hover:to-teal-700"
                            onClick={() => setTypeConfigs(cfgs => ({
                              ...cfgs,
                              [configModalId]: {
                                ...cfgs[configModalId],
                                accrualTiers: [
                                  ...((cfgs[configModalId]?.accrualTiers) || []),
                                  { years: 0, entitlement: 1 },
                                ],
                              },
                            }))}
                            aria-label="Add accrual tier"
                          >
                            Add Tier
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {activeConfigTab === "approval" && (
                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Approval Workflow *</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                          value={typeConfigs[configModalId]?.approvalWorkflow || "Manager → HR"}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], approvalWorkflow: e.target.value } }))}
                          required
                        >
                          <option value="Manager → HR">Manager → HR</option>
                          <option value="Manager Only">Manager Only</option>
                          <option value="HR Only">HR Only</option>
                          <option value="Manager → Department Head → HR">Manager → Department Head → HR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Approver Roles *</label>
                        <select
                          multiple
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm h-32"
                          value={typeConfigs[configModalId]?.approverRoles || []}
                          onChange={e => {
                            const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                            setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], approverRoles: options } }));
                          }}
                          required
                        >
                          <option value="Manager">Manager</option>
                          <option value="Department Head">Department Head</option>
                          <option value="HR">HR</option>
                        </select>
                        <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles.</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-checkbox text-teal-600 focus:ring-teal-500"
                          checked={typeConfigs[configModalId]?.autoApproval || false}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], autoApproval: e.target.checked } }))}
                          id="autoApproval"
                        />
                        <label htmlFor="autoApproval" className="text-sm font-medium text-gray-900">Enable Auto-Approval (if not actioned in time)</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Escalation Rule</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <select
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            value={typeConfigs[configModalId]?.escalateTo || "HR"}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], escalateTo: e.target.value } }))}
                          >
                            <option value="HR">HR</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Manager">Manager</option>
                          </select>
                          <span className="text-gray-500 text-center">after</span>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            value={typeConfigs[configModalId]?.escalateAfterDays || 3}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], escalateAfterDays: Number(e.target.value) } }))}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">If not approved/rejected within this period, escalate to selected role.</div>
                      </div>
                    </form>
                  )}
                  {activeConfigTab === "notifications" && (
                    <form className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative group">
                          <svg className="w-4 h-4 text-teal-500 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                          <span className="absolute left-6 top-0 z-10 w-72 p-2 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            These settings control <b>which events and channels</b> send notifications for this leave type. <b>Both global and per-type settings must allow a channel/event</b> for a notification to be sent.
                          </span>
                        </span>
                        <span className="text-xs text-gray-500">Per-type notification settings</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Notification Triggers</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notificationOnRequest || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notificationOnRequest: e.target.checked } }))}
                              id="notificationOnRequest"
                            />
                            <label htmlFor="notificationOnRequest" className="text-sm">On Apply/Request</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notificationOnApproval || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notificationOnApproval: e.target.checked } }))}
                              id="notificationOnApproval"
                            />
                            <label htmlFor="notificationOnApproval" className="text-sm">On Approval</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notificationOnReject || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notificationOnReject: e.target.checked } }))}
                              id="notificationOnReject"
                            />
                            <label htmlFor="notificationOnReject" className="text-sm">On Rejection</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notificationOnCancel || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notificationOnCancel: e.target.checked } }))}
                              id="notificationOnCancel"
                            />
                            <label htmlFor="notificationOnCancel" className="text-sm">On Cancel</label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Notification Channels</label>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notifyByEmail ?? true}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notifyByEmail: e.target.checked } }))}
                              id="notifyByEmail"
                            />
                            <label htmlFor="notifyByEmail" className="text-sm">Email</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.notifyByInApp ?? true}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notifyByInApp: e.target.checked } }))}
                              id="notifyByInApp"
                            />
                            <label htmlFor="notifyByInApp" className="text-sm">In-App</label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Additional Recipients</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                          placeholder="Comma-separated emails (e.g. hr@example.com, manager@example.com)"
                          value={typeConfigs[configModalId]?.additionalNotified?.join(", ") || ""}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], additionalNotified: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } }))}
                        />
                        <div className="text-xs text-gray-500 mt-1">Optional: Add emails to notify in addition to the requester and approver(s).</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Notification Template (Preview)</label>
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm min-h-[80px]"
                          value={typeConfigs[configModalId]?.notificationTemplate || 'Dear {{recipient}},\n\nYour leave request for {{leaveType}} has been {{status}}.\n\nRegards,\nHRMS'}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], notificationTemplate: e.target.value } }))}
                        />
                        <div className="text-xs text-gray-500 mt-1">You can use variables: <code>{`{{recipient}}, {{leaveType}}, {{status}}`}</code></div>
                      </div>
                    </form>
                  )}
                  {activeConfigTab === "restrictions" && (
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Minimum Duration (days)</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            value={typeConfigs[configModalId]?.minDuration || 1}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], minDuration: Number(e.target.value) } }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Maximum Duration (days)</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            value={typeConfigs[configModalId]?.maxDuration || 30}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], maxDuration: Number(e.target.value) } }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Max Consecutive Days</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            value={typeConfigs[configModalId]?.maxConsecutiveDays || ''}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], maxConsecutiveDays: Number(e.target.value) } }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Required Documents</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                          placeholder="Comma-separated (e.g. Medical Certificate, Police Report)"
                          value={typeConfigs[configModalId]?.requiredDocuments?.join(", ") || ""}
                          onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], requiredDocuments: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } }))}
                        />
                        <div className="text-xs text-gray-500 mt-1">Optional: Specify required documents for this leave type.</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Department Restrictions</label>
                          <MultiSelectDropdown
                            label="Departments"
                            options={DEPARTMENTS.map(dep => ({ label: dep, value: dep }))}
                            selected={typeRestrictions[configModalId]?.departments || []}
                            onChange={vals => updateTypeRestriction(configModalId, "departments", vals)}
                            placeholder="Select departments"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Role Restrictions</label>
                          <MultiSelectDropdown
                            label="Roles"
                            options={ROLES.map(role => ({ label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '), value: role }))}
                            selected={typeRestrictions[configModalId]?.roles || []}
                            onChange={vals => updateTypeRestriction(configModalId, "roles", vals)}
                            placeholder="Select roles"
                          />
                        </div>
                      </div>
                    </form>
                  )}
                  {activeConfigTab === "advanced" && (
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Pro-Rata Calculation</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.proRata || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], proRata: e.target.checked } }))}
                              id="proRata"
                            />
                            <label htmlFor="proRata" className="text-sm">Enable pro-rata calculation for join/resign</label>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">If enabled, leave entitlement is prorated based on join/resign date.</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Encashment Allowed</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.encashment || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], encashment: e.target.checked } }))}
                              id="encashment"
                            />
                            <label htmlFor="encashment" className="text-sm">Allow leave encashment</label>
                            {typeConfigs[configModalId]?.encashment && (
                              <input
                                type="number"
                                min={0}
                                className="w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm ml-2"
                                value={typeConfigs[configModalId]?.maxEncash || 0}
                                onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], maxEncash: Number(e.target.value) } }))}
                                placeholder="Max days"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Specify if unused leave can be encashed and the maximum days allowed.</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Allow Negative Balance</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.negativeBalance || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], negativeBalance: e.target.checked } }))}
                              id="negativeBalance"
                            />
                            <label htmlFor="negativeBalance" className="text-sm">Allow negative leave balance</label>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">If enabled, employees can apply for leave even if balance is insufficient.</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Custom Leave Code</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                            placeholder="e.g. AL, SL, EL"
                            value={typeConfigs[configModalId]?.customCode || ''}
                            onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], customCode: e.target.value } }))}
                          />
                          <div className="text-xs text-gray-500 mt-1">Optional: Set a custom code for this leave type (for payroll/export).</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Audit Log</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox text-teal-600 focus:ring-teal-500"
                              checked={typeConfigs[configModalId]?.auditLog || false}
                              onChange={e => setTypeConfigs(cfgs => ({ ...cfgs, [configModalId]: { ...cfgs[configModalId], auditLog: e.target.checked } }))}
                              id="auditLog"
                            />
                            <label htmlFor="auditLog" className="text-sm">Enable audit logging for changes</label>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">If enabled, all changes to this leave type will be logged for compliance.</div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
                {/* Save/Cancel Bar */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setConfigModalId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    onClick={() => saveConfig(configModalId, typeConfigs[configModalId])}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
} 