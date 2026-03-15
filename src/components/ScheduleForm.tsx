'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addMinutes, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  isBooked?: boolean;
}

interface ConflictingSlot {
  start: Date;
  end: Date;
}

interface ScheduleFormProps {
  availableSlots: TimeSlot[];
  conflictingSlots: ConflictingSlot[];
  onSchedule?: (slot: TimeSlot) => void;
}

export default function ScheduleForm({
  availableSlots,
  conflictingSlots,
  onSchedule,
}: ScheduleFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const checkConflict = (start: Date, end: Date): boolean => {
    return conflictingSlots.some(
      conflict =>
        isWithinInterval(start, { start: conflict.start, end: conflict.end }) ||
        isWithinInterval(end, { start: conflict.start, end: conflict.end }) ||
        (start < conflict.start && end > conflict.end)
    );
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isBooked) {
      toast.error('该时间段已被预订');
      return;
    }

    const hasConflict = checkConflict(slot.start, slot.end);

    if (hasConflict) {
      setError('所选时间段与其他预约冲?);
      toast.error('时间冲突，请选择其他时间?);
      return;
    }

    setError('');
    setSelectedSlot(slot.id);
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      setError('请先选择一个时间段');
      return;
    }

    const slot = availableSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    setIsSubmitting(true);
    setError('');

    try {
      // 模拟预约过程
      await new Promise(resolve => setTimeout(resolve, 800));

      onSchedule?.(slot);
      toast.success('预约成功?);
    } catch (err) {
      setError('预约失败，请重试');
      toast.error('预约失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          选择预约时间
        </h2>
        <p className="text-gray-600">请选择合适的时间段进行预?/p>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
          data-testid="conflict-error"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {availableSlots.map(slot => {
          const isBooked = slot.isBooked;
          const isSelected = selectedSlot === slot.id;
          const hasConflict = checkConflict(slot.start, slot.end);

          let slotStyle = 'border-gray-200 hover:border-blue-300';
          if (isBooked)
            slotStyle =
              'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed';
          if (isSelected)
            slotStyle = 'border-blue-500 bg-blue-50 ring-2 ring-blue-200';
          if (hasConflict) slotStyle = 'border-red-200 bg-red-50';

          return (
            <button
              key={slot.id}
              onClick={() => !isBooked && handleSlotSelect(slot)}
              disabled={isBooked}
              className={`p-4 border rounded-lg text-left transition-all ${slotStyle}`}
              data-testid={`slot-${format(slot.start, 'HHmm')}-${format(slot.end, 'HHmm')}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                  </span>
                </div>
                {isBooked && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    已预?                  </span>
                )}
                {hasConflict && (
                  <span className="text-xs bg-red-200 text-red-600 px-2 py-1 rounded">
                    冲突
                  </span>
                )}
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {!isBooked && !hasConflict && (
                <div className="text-xs text-gray-500">可预?/div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!selectedSlot || isSubmitting || !!error}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="confirm-appointment"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              预约?..
            </>
          ) : (
            '确认预约'
          )}
        </button>

        <button
          onClick={() => {
            setSelectedSlot(null);
            setError('');
          }}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          重置
        </button>
      </div>

      {selectedSlot && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700">已选择时间段，请确认预?/span>
        </div>
      )}
    </div>
  );
}
