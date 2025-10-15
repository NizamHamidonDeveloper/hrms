'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

// TODO: Replace with actual role-based protection logic
const isManager = true; // Mocked for now

type ReviewCycle = {
  id: string;
  name: string;
  period: string;
  status: string;
};

// Mock data for review cycles
const mockReviewCycles: ReviewCycle[] = [
  {
    id: 'cycle-1',
    name: '2024 Mid-Year Review',
    period: 'Jan 2024 - Jun 2024',
    status: 'Open',
  },
  {
    id: 'cycle-2',
    name: '2023 Year-End Review',
    period: 'Jul 2023 - Dec 2023',
    status: 'Closed',
  },
];

// Mock data for review history
const mockReviewHistory = [
  {
    id: 'hist-1',
    employee: 'Alice Johnson',
    cycle: '2023 Year-End Review',
    feedback: 'Consistently exceeded expectations.',
    rating: 5,
    date: '2024-01-15',
  },
  {
    id: 'hist-2',
    employee: 'Bob Smith',
    cycle: '2023 Year-End Review',
    feedback: 'Met most goals, room for improvement.',
    rating: 4,
    date: '2024-01-16',
  },
  {
    id: 'hist-3',
    employee: 'Carol Lee',
    cycle: '2024 Mid-Year Review',
    feedback: 'Strong team player, great attitude.',
    rating: 5,
    date: '2024-06-10',
  },
];

// Add a minimal type for reviewHistory items
interface ReviewHistoryItem {
  id: string;
  employee: string;
  cycle: string;
  feedback: string;
  rating: number;
  date: string;
}

function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map(row => row.map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PerformancePage() {
  const router = useRouter();
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [cycleStatusFilter, setCycleStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [cycleSearch, setCycleSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCycle, setViewCycle] = useState<ReviewCycle | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!isManager) {
      router.replace('/');
    }
  }, [router]);

  // Fetch review cycles
  useEffect(() => {
    setFallbackWarning(null);
    fetch('/api/manager/performance/cycles')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch review cycles');
        return res.json();
      })
      .then(data => setReviewCycles(data))
      .catch(() => {
        setReviewCycles(mockReviewCycles);
        setFallbackWarning('Failed to fetch review cycles from API, using mock data.');
      });
  }, [router]);

  // Fetch review history
  const fetchReviewHistory = () => {
    setFallbackWarning(null);
    fetch('/api/manager/performance/reviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch review history');
        return res.json();
      })
      .then(data => setReviewHistory(data))
      .catch(() => {
        setReviewHistory(mockReviewHistory);
        setFallbackWarning('Failed to fetch review history from API, using mock data.');
      });
  };
  useEffect(() => {
    fetchReviewHistory();
  }, [router]);

  const openReviewModal = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setShowModal(true);
    setFeedback('');
    setRating('');
    setSuccess(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCycle(null);
    setFeedback('');
    setRating('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setNotification(null);
    try {
      const res = await fetch('/api/manager/performance/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee: 'Mock Employee', // Replace with actual employee if available
          cycle: selectedCycle?.name,
          feedback,
          rating: Number(rating),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setNotification('Review submitted successfully!');
        fetchReviewHistory(); // Refresh history
        setTimeout(() => {
          closeModal();
          setNotification(null);
        }, 1200);
      } else {
        setNotification(data.message || 'Failed to submit review');
      }
    } catch (err: unknown) {
      setNotification((err as Error)?.message || 'Failed to submit review');
    }
  };

  const openViewModal = (cycle: ReviewCycle) => {
    setViewCycle(cycle);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewCycle(null);
  };

  // Filtered review cycles
  const filteredCycles = reviewCycles.filter((cycle) => {
    const statusMatch = cycleStatusFilter === 'All' || cycle.status === cycleStatusFilter;
    const searchMatch = cycle.name.toLowerCase().includes(cycleSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Filtered review history
  const filteredHistory = reviewHistory.filter((hist) => {
    const search = historySearch.toLowerCase();
    return (
      hist.employee.toLowerCase().includes(search) ||
      hist.cycle.toLowerCase().includes(search)
    );
  });

  return (
    <main className="p-8 max-w-6xl mx-auto min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Performance Reviews</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage and review your team's performance cycles and feedback.</p>
      {fallbackWarning && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded" role="alert">{fallbackWarning}</div>
      )}
      {notification && (
        <div className="mb-4 p-4 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold border border-green-200 dark:border-green-700" role="alert" aria-live="polite">
          {notification}
        </div>
      )}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">Manage and review your team's performance cycles here.</p>
      </div>
      {/* Filters for review cycles */}
      <div className="flex flex-wrap gap-4 mb-4 items-end" role="search" aria-label="Review cycles filters">
        <div>
          <label id="status-filter-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
          <select
            aria-labelledby="status-filter-label"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            value={cycleStatusFilter}
            onChange={e => setCycleStatusFilter(e.target.value as 'All' | 'Open' | 'Closed')}
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div>
          <label id="cycle-search-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Search Cycle</label>
          <input
            type="text"
            aria-labelledby="cycle-search-label"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            placeholder="Search by cycle name..."
            value={cycleSearch}
            onChange={e => setCycleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end mb-2">
        <button
          className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={() => {
            const rows = [
              ['Cycle Name', 'Period', 'Status'],
              ...filteredCycles.map(cycle => [cycle.name, cycle.period, cycle.status]),
            ];
            downloadCSV('review_cycles.csv', rows);
          }}
          aria-label="Export review cycles to CSV"
        >
          <i className="fas fa-download" aria-hidden="true"></i> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-label="Review cycles">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cycle Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCycles.map((cycle, idx) => (
              <tr
                key={cycle.id}
                className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors`}
                tabIndex={0}
                role="row"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">{cycle.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{cycle.period}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cycle.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                    role="status"
                    aria-label={`Status: ${cycle.status}`}
                  >
                    {cycle.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                  <button
                    className="rounded-full border border-teal-600 text-teal-700 bg-white dark:bg-gray-900 shadow px-4 py-2 font-semibold mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    onClick={() => openViewModal(cycle)}
                    aria-label={`View details of ${cycle.name}`}
                  >
                    <i className="fas fa-eye" aria-hidden="true"></i> View
                  </button>
                  {cycle.status === 'Open' && (
                    <button
                      className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      onClick={() => openReviewModal(cycle)}
                      aria-label={`Submit review for ${cycle.name}`}
                    >
                      <i className="fas fa-pen" aria-hidden="true"></i> Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredCycles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600 dark:text-gray-400" role="status">No review cycles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Filters for review history */}
      <div className="flex flex-wrap gap-4 mb-4 items-end mt-12" role="search" aria-label="Review history filters">
        <div>
          <label id="history-search-label" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Search History</label>
          <input
            type="text"
            aria-labelledby="history-search-label"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            placeholder="Search by employee or cycle..."
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end mb-2">
        <button
          className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={() => {
            const rows = [
              ['Employee', 'Cycle', 'Feedback', 'Rating', 'Date'],
              ...filteredHistory.map(hist => [hist.employee, hist.cycle, hist.feedback, String(hist.rating), new Date(hist.date).toLocaleDateString()]),
            ];
            downloadCSV('review_history.csv', rows);
          }}
          aria-label="Export review history to CSV"
        >
          <i className="fas fa-download" aria-hidden="true"></i> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow">
        <h2 id="history-table-title" className="text-xl font-bold mb-4 px-6 pt-6 text-gray-800 dark:text-gray-100">Review History</h2>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-labelledby="history-table-title">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cycle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredHistory.map((hist) => (
              <tr 
                key={hist.id} 
                className="hover:bg-gray-50 dark:hover:bg-teal-900 transition-colors"
                tabIndex={0}
                role="row"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{hist.employee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{hist.cycle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{hist.feedback}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200" aria-label={`Rating: ${hist.rating} out of 5`}>{hist.rating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(hist.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400 dark:text-gray-500" role="status">No review history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* View Modal */}
      {showViewModal && viewCycle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" 
          role="dialog" 
          aria-labelledby="view-modal-title"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-lg relative border border-gray-200 dark:border-gray-700">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-full p-1" 
              onClick={closeViewModal}
              aria-label="Close modal"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
            <h2 id="view-modal-title" className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Review Cycle Details</h2>
            <div className="mb-4">
              <div><span className="font-semibold text-gray-700 dark:text-gray-200">Name:</span> <span className="text-gray-800 dark:text-gray-100">{viewCycle.name}</span></div>
              <div><span className="font-semibold text-gray-700 dark:text-gray-200">Period:</span> <span className="text-gray-800 dark:text-gray-100">{viewCycle.period}</span></div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Status:</span> 
                <span 
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${viewCycle.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                  role="status"
                  aria-label={`Status: ${viewCycle.status}`}
                >
                  {viewCycle.status}
                </span>
              </div>
            </div>
            <h3 id="cycle-reviews-title" className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Reviews in this Cycle</h3>
            <div className="max-h-48 overflow-y-auto">
              <table className="min-w-full text-sm" role="table" aria-labelledby="cycle-reviews-title">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-700 dark:text-gray-200">Employee</th>
                    <th className="text-left font-medium text-gray-700 dark:text-gray-200">Feedback</th>
                    <th className="text-left font-medium text-gray-700 dark:text-gray-200">Rating</th>
                    <th className="text-left font-medium text-gray-700 dark:text-gray-200">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewHistory.filter(r => r.cycle === viewCycle.name).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-gray-400 dark:text-gray-500 py-2" role="status">No reviews for this cycle.</td>
                    </tr>
                  ) : (
                    reviewHistory.filter(r => r.cycle === viewCycle.name).map(r => (
                      <tr 
                        key={r.id}
                        tabIndex={0}
                        role="row"
                      >
                        <td className="text-gray-800 dark:text-gray-100">{r.employee}</td>
                        <td className="text-gray-700 dark:text-gray-200">{r.feedback}</td>
                        <td className="text-gray-700 dark:text-gray-200" aria-label={`Rating: ${r.rating} out of 5`}>{r.rating}</td>
                        <td className="text-gray-500 dark:text-gray-300">{new Date(r.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          role="dialog"
          aria-labelledby="review-modal-title"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-full p-1" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
            <h2 id="review-modal-title" className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Submit Review for {selectedCycle?.name}</h2>
            {success ? (
              <div className="text-green-600 dark:text-green-200 font-semibold text-center py-8" role="status" aria-live="polite">Review submitted successfully!</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label id="feedback-label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Feedback</label>
                  <textarea
                    aria-labelledby="feedback-label"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label id="rating-label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Rating</label>
                  <select
                    aria-labelledby="rating-label"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="5">Excellent</option>
                    <option value="4">Good</option>
                    <option value="3">Average</option>
                    <option value="2">Below Average</option>
                    <option value="1">Poor</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
} 