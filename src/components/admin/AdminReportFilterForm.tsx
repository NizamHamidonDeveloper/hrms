import React from "react";

/**
 * AdminReportFilterForm
 *
 * Props:
 * - fields: Array of field configs ({ type, label, name, options, ... })
 * - values: { [name]: value }
 * - onChange: (name, value) => void
 * - onSubmit: (e) => void
 * - onReset: () => void
 * - loading: boolean
 * - children: ReactNode (for custom fields/buttons)
 */
export default function AdminReportFilterForm({
  fields,
  values,
  onChange,
  onSubmit,
  onReset,
  loading,
  children,
}: {
  fields: Array<
    | { type: "select"; label: string; name: string; options: string[] }
    | { type: "text"; label: string; name: string; placeholder?: string }
    | { type: "date"; label: string; name: string }
  >;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {fields.map((field, idx) => {
          if (field.type === "select") {
            return (
              <div
                key={field.name + idx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col"
              >
                <label htmlFor={field.name} className="block text-base font-medium text-gray-900 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <select
                    id={field.name}
                    name={field.name}
                    aria-label={field.label}
                    className="appearance-none mt-0 block w-full h-12 pl-4 pr-10 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
                    value={values[field.name] ?? ""}
                    onChange={e => onChange(field.name, e.target.value)}
                    disabled={loading}
                  >
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
            );
          }
          if (field.type === "text") {
            return (
              <div
                key={field.name + idx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col"
              >
                <label htmlFor={field.name} className="block text-base font-medium text-gray-900 mb-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  aria-label={field.label}
                  className="mt-0 block w-full h-12 px-4 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder={field.placeholder || ""}
                  value={values[field.name] ?? ""}
                  onChange={e => onChange(field.name, e.target.value)}
                  disabled={loading}
                />
              </div>
            );
          }
          if (field.type === "date") {
            return (
              <div
                key={field.name + idx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col"
              >
                <label htmlFor={field.name} className="block text-base font-medium text-gray-900 mb-2">
                  {field.label}
                </label>
                <input
                  type="date"
                  id={field.name}
                  name={field.name}
                  aria-label={field.label}
                  className="mt-0 block w-full h-12 px-4 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
                  value={values[field.name] ?? ""}
                  onChange={e => onChange(field.name, e.target.value)}
                  disabled={loading}
                />
              </div>
            );
          }
          return null;
        })}
        {children}
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 w-full">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-full shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
          disabled={loading}
        >
          Reset Filters
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
          disabled={loading}
        >
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>
    </form>
  );
} 