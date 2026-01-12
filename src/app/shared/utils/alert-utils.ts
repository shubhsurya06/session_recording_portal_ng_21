import { WritableSignal } from '@angular/core';

/**
 * Utility to set alert data for success/error messages.
 * @param errorMessage Signal for error message
 * @param isError Signal for error boolean
 * @param isShowAlert Signal for alert visibility
 * @param data Response object with message/result
 */
export function setAlertData(
  errorMessage: WritableSignal<string>,
  isError: WritableSignal<boolean>,
  isShowAlert: WritableSignal<boolean>,
  data: { message: string; result: boolean }
) {
  errorMessage.set(data.message);
  isError.set(data.result);
  isShowAlert.set(true);
}

/**
 * Utility to show/hide alert
 * @param isShowAlert Signal for alert visibility
 * @param flag Boolean to show/hide
 */
export function toggleAlert(isShowAlert: WritableSignal<boolean>, flag: boolean) {
  isShowAlert.set(flag);
}
