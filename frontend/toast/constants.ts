// toast/constants.ts
// Constants untuk toast system

"use client";

import type { ToastOptions } from './types';

// Mapping tipe toast ke metode sonner
export const TYPE_METHOD = {
  success: 'success',
  error: 'error',
  warn: 'warning', // sonner menggunakan "warning"
  info: 'info',
} as const;

// Default options untuk toast
export const DEFAULTS: Required<ToastOptions> = {
  type: 'info',
  title: '',
  message: '',
  delay: 0,
  duration: 3200,
  dismissible: true,
  actionText: '',
  onAction: () => {},
  // ✅ TAMBAHKAN PROPERTI I18N YANG MISSING
  i18nKey: '',
  i18nTitleKey: '',
  i18nValues: {},
  i18nActionTextKey: '',
};