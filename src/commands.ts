// Command identifiers for locally handled commands
export const RESTART_SERVER = 'cadence.restartServer';
export const START_EMULATOR = 'cadence.runEmulator';
export const STOP_EMULATOR = 'cadence.stopEmulator';
export const CREATE_ACCOUNT = 'cadence.createAccount';
export const SWITCH_ACCOUNT = 'cadence.switchActiveAccount';

// Command identifiers for commands running in CLI
export const DEPLOY_CONTRACT = 'cadence.deployContract';
export const EXECUTE_SCRIPT = 'cadence.executeScript';
export const SEND_TRANSACTION = 'cadence.sendTransaction';

// Command identifies for commands handled by the Language server
export const CREATE_ACCOUNT_SERVER = 'cadence.server.flow.createAccount';
export const CREATE_DEFAULT_ACCOUNTS_SERVER = 'cadence.server.flow.createDefaultAccounts';
export const SWITCH_ACCOUNT_SERVER = 'cadence.server.flow.switchActiveAccount';
export const CHANGE_EMULATOR_STATE = 'cadence.server.flow.changeEmulatorState';
export const INIT_ACCOUNT_MANAGER = 'cadence.server.flow.initAccountManager';
