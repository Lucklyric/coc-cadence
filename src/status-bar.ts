import { StatusBarItem, window } from 'coc.nvim';
import { Account } from './account';
import { EmulatorState } from '.';

export function createEmulatorStatusBarItem(): StatusBarItem {
  return window.createStatusBarItem(1);
}

export function updateEmulatorStatusBarItem(statusBarItem: StatusBarItem, emulatorState: EmulatorState): void {
  switch (emulatorState) {
    case EmulatorState.Stopped:
      statusBarItem.text = '$(debug-start) Start Flow Emulator';
      break;
    case EmulatorState.Starting:
      statusBarItem.text = '$(loading~spin) Emulator starting...';
      break;
    case EmulatorState.Started:
      statusBarItem.text = '$(debug-stop) Stop Flow Emulator';
      break;
  }

  statusBarItem.show();
}

export function createActiveAccountStatusBarItem(): StatusBarItem {
  const statusBarItem = window.createStatusBarItem(2);
  return statusBarItem;
}

export function updateActiveAccountStatusBarItem(statusBarItem: StatusBarItem, activeAccount: Account | null): void {
  if (activeAccount == null) {
    statusBarItem.hide();
    return;
  }

  statusBarItem.text = `$(key) Active account: ${activeAccount.fullName()}`;
  statusBarItem.show();
}
