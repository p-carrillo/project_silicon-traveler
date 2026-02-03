'use client';

import { useEffect, useId, useState } from 'react';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

interface DateRangeActionProps {
  actionPath?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  buttonClassName?: string;
}

export default function DateRangeAction({
  actionPath = '/archive',
  initialStartDate = '',
  initialEndDate = '',
  buttonClassName = '',
}: DateRangeActionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    setStartDate(initialStartDate);
  }, [initialStartDate]);

  useEffect(() => {
    setEndDate(initialEndDate);
  }, [initialEndDate]);

  const buildParams = (rangeStart: string, rangeEnd: string) => {
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) params.set('q', query);
    if (rangeStart) params.set('start_date', rangeStart);
    if (rangeEnd) params.set('end_date', rangeEnd);
    return params;
  };

  const handleApply = () => {
    const params = buildParams(startDate, endDate);
    const queryString = params.toString();
    router.push(queryString ? `${actionPath}?${queryString}` : actionPath);
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    const params = buildParams('', '');
    const queryString = params.toString();
    router.push(queryString ? `${actionPath}?${queryString}` : actionPath);
    setIsOpen(false);
  };

  return (
    <div className="relative flex">
      <button
        type="button"
        className={`flex items-center gap-2 ${buttonClassName} ${
          isOpen ? 'bg-black text-white' : ''
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <CalendarDaysIcon className="h-4 w-4" />
        <span>Date Range</span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Date range filter"
          className="absolute left-0 top-full mt-2 w-72 max-w-[90vw] border border-black bg-white p-4 shadow-xl z-50"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest">
              Filter by published date
            </p>
            <button
              type="button"
              className="p-1 hover:bg-black hover:text-white transition-colors"
              aria-label="Close date range panel"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              Start date
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full border border-black px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
              />
            </label>

            <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              End date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full border border-black px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 border border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 border border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
