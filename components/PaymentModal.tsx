/**
 * Payment Modal Component
 * Handles payment confirmation and processing
 */

import React, { useState } from "react";
import { PaymentHistory } from "../types";

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  token: string;
  description: string;
  balance: number;
  onConfirm: (isPaid: boolean) => void;
  onCancel: () => void;
  onTopUp?: () => void;
  isProcessing?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  amount,
  token,
  description,
  balance,
  onConfirm,
  onCancel,
  onTopUp,
  isProcessing = false,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const sufficientBalance = balance >= amount;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      onConfirm(true);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full space-y-6 p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{description}</h3>
        </div>

        {/* Payment Details */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Amount</span>
            <span className="font-bold text-slate-900">
              {amount.toFixed(6)} {token}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">
              Current Balance
            </span>
            <span
              className={`font-bold ${
                sufficientBalance ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance.toFixed(6)} {token}
            </span>
          </div>
          {!sufficientBalance && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Shortfall
              </span>
              <span className="font-bold text-red-600">
                {(amount - balance).toFixed(6)} {token}
              </span>
            </div>
          )}
        </div>

        {/* Warning */}
        {!sufficientBalance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-yellow-800">
                Insufficient balance. Please top up your account to continue.
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {sufficientBalance ? (
            <>
              <button
                onClick={handleConfirm}
                disabled={isProcessing || isConfirming}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing || isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Confirm Payment</span>
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isProcessing || isConfirming}
                className="w-full px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {onTopUp && (
                <button
                  onClick={onTopUp}
                  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Top Up Balance</span>
                </button>
              )}
              <button
                onClick={onCancel}
                className="w-full px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 text-center">
          Payment will be processed via x402 protocol on Movement M2
        </p>
      </div>
    </div>
  );
};
