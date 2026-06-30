'use client';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Modal from '@/src/components/ui/Modal';
import { DollarSign, AlertCircle } from 'lucide-react';
import { creatorApi } from '@/src/lib/api';
import { toast } from 'sonner';

interface WithdrawForm {
  amount: string;
  method: string;
  accountDetail: string;
}

interface WithdrawModalProps {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({ availableBalance, onClose, onSuccess }: WithdrawModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, control } = useForm<WithdrawForm>({
    defaultValues: { method: 'bank' },
  });

  const onSubmit = async (data: WithdrawForm) => {
    const amount = parseFloat(data.amount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }
    setIsSubmitting(true);
    try {
      await creatorApi.withdraw(amount);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountValue = useWatch({ control, name: 'amount' }) || '0';
  const amount = parseFloat(amountValue);
  const fee = amount > 0 ? Math.min(amount * 0.015, 15) : 0;
  const net = amount - fee;

  return (
    <Modal open onClose={onClose} title="Withdraw Funds" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-violet-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-violet-700 font-medium">Available balance</span>
          <span className="text-sm font-bold text-violet-800 tabular-nums">
            ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="wd-amount">
            Withdrawal Amount
          </label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="wd-amount"
              type="number"
              step="0.01"
              min="1"
              max={availableBalance}
              placeholder="100.00"
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.amount ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 1, message: 'Minimum withdrawal is ₹1' },
                validate: (v) => parseFloat(v) <= availableBalance || 'Exceeds available balance',
              })}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="wd-method">
            Payout Method
          </label>
          <select
            id="wd-method"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            {...register('method', { required: true })}
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="wd-account">
            Account Detail
          </label>
          <input
            id="wd-account"
            type="text"
            placeholder="Bank account / UPI ID / PayPal email"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${errors.accountDetail ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('accountDetail', { required: 'Account detail is required' })}
          />
          {errors.accountDetail && <p className="text-red-500 text-xs mt-1">{errors.accountDetail.message}</p>}
        </div>

        {amount > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between"><span>Withdrawal amount</span><span>₹{amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Processing fee (est.)</span><span>-₹{fee.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1.5">
              <span>You receive</span><span>₹{net.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Withdrawals require admin approval. Processing typically takes 1–3 business days after approval.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || availableBalance <= 0}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {isSubmitting ? 'Submitting…' : 'Request Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
