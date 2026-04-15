'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/src/components/ui/Modal';
import { DollarSign, AlertCircle } from 'lucide-react';

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
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<WithdrawForm>({
    defaultValues: { method: 'paypal' }
  });

  const amount = parseFloat(watch('amount') || '0');
  const fee = amount > 0 ? Math.min(amount * 0.015, 15) : 0;
  const net = amount - fee;

  const onSubmit = async (data: WithdrawForm) => {
    setIsSubmitting(true);
    // BACKEND: POST /api/wallet/withdraw { amount: data.amount, method: data.method, accountDetail: data.accountDetail }
    await new Promise(r => setTimeout(r, 1200));
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Modal open onClose={onClose} title="Withdraw Funds" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Balance info */}
        <div className="bg-violet-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-violet-700 font-medium">Available balance</span>
          <span className="text-sm font-bold text-violet-800 tabular-nums">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
              placeholder="100.00"
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.amount ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              {...register('amount', {
                required: 'Enter an amount',
                min: { value: 10, message: 'Minimum withdrawal is $10' },
                max: { value: availableBalance, message: `Cannot exceed available balance of $${availableBalance.toLocaleString()}` },
                validate: v => parseFloat(v) > 0 || 'Enter a valid amount',
              })}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          <div className="flex gap-2 mt-2">
            {[50, 100, 500].map(v => (
              <button
                key={`quick-${v}`}
                type="button"
                onClick={() => setValue('amount', Math.min(v, availableBalance).toString())}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                ${v}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValue('amount', availableBalance.toString())}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="wd-method">
            Withdrawal Method
          </label>
          <select
            id="wd-method"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            {...register('method', { required: true })}
          >
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer (ACH)</option>
            <option value="stripe">Stripe Instant Payout</option>
            <option value="wise">Wise (International)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="wd-account">
            Account / Email
          </label>
          <input
            id="wd-account"
            type="text"
            placeholder="your@paypal.com or account number"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.accountDetail ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('accountDetail', { required: 'Account detail is required' })}
          />
          {errors.accountDetail && <p className="text-red-500 text-xs mt-1">{errors.accountDetail.message}</p>}
        </div>

        {/* Fee breakdown */}
        {amount > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Withdrawal amount</span>
              <span className="tabular-nums">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Platform fee (1.5%, max $15)</span>
              <span className="tabular-nums text-red-600">-${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1.5 mt-1.5">
              <span>You receive</span>
              <span className="tabular-nums text-emerald-700">${net.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Processing takes 1–3 business days. Funds must not be in escrow to withdraw.</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || amount <= 0}
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing...</span></>
            ) : (
              'Request Withdrawal'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}