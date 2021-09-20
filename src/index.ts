import {
  commands,
  CompleteResult,
  ExtensionContext,
  listManager,
  sources,
  StatusBarItem,
  Terminal,
  window,
  workspace,
} from 'coc.nvim';
import {registerCommands} from './commands';
import { Config, getConfig, handleConfigChanges } from './config';
import { LanguageServerAPI } from './language-server';
import DemoList from './lists';
import { createActiveAccountStatusBarItem, createEmulatorStatusBarItem, updateActiveAccountStatusBarItem, updateEmulatorStatusBarItem } from './status-bar';
import {createTerminal} from './terminal';

export enum EmulatorState {
  Stopped = 0,
  Starting,
  Started,
}

// The container for all data relevant to the extension.
export class Extension {
  config: Config;
  ctx: ExtensionContext;
  api: LanguageServerAPI;
  terminal: Terminal;
  emulatorState: EmulatorState = EmulatorState.Stopped;
  emulatorStatusBarItem: StatusBarItem;
  activeAccountStatusBarItem: StatusBarItem;

  constructor(
    config: Config,
    ctx: ExtensionContext,
    api: LanguageServerAPI,
    terminal: Terminal,
    emulatorStatusBarItem: StatusBarItem,
    activeAccountStatusBarItem: StatusBarItem
  ) {
    this.config = config;
    this.ctx = ctx;
    this.api = api;
    this.terminal = terminal;
    this.emulatorStatusBarItem = emulatorStatusBarItem;
    this.activeAccountStatusBarItem = activeAccountStatusBarItem;
  }

  getEmulatorState(): EmulatorState {
    return this.emulatorState;
  }

  setEmulatorState(state: EmulatorState): void {
    this.emulatorState = state;
    this.api.changeEmulatorState(state).then(
      () => {},
      () => {}
    );
    // refreshCodeLenses();
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-cadence works!`);
  let config: Config;
  let terminal: Terminal;
  let api: LanguageServerAPI;

  try {
    config = getConfig();
    await config.readLocalConfig();
    terminal = await createTerminal(context);
    api = new LanguageServerAPI(context, config, EmulatorState.Stopped, null);
  } catch (err: any) {
    window.showErrorMessage('Failed to activate extension: ', err).then(
      () => {},
      () => {}
    );
    return;
  }
  handleConfigChanges();

  const ext = new Extension(
    config,
    context,
    api,
    terminal,
    createEmulatorStatusBarItem(),
    createActiveAccountStatusBarItem()
  );

  registerCommands(ext);
  renderExtension(ext);
  context.logger.info(`${workspace.root}`);

  context.subscriptions.push(
    commands.registerCommand('coc-cadence.Command', async () => {
      window.showMessage(`coc-cadence Commands works!`);
    }),

    listManager.registerList(new DemoList(workspace.nvim)),

    sources.createSource({
      name: 'coc-cadence completion source', // unique id
      doComplete: async () => {
        const items = await getCompletionItems();
        return items;
      },
    }),

    workspace.registerKeymap(
      ['n'],
      'cadence-keymap',
      async () => {
        window.showMessage(`registerKeymap`);
      },
      { sync: false }
    ),

    workspace.registerAutocmd({
      event: 'InsertLeave',
      request: true,
      callback: () => {
        window.showMessage(`registerAutocmd on InsertLeave`);
      },
    })
  );
}

async function getCompletionItems(): Promise<CompleteResult> {
  return {
    items: [
      {
        word: 'TestCompletionItem 1',
        menu: '[coc-cadence]',
      },
      {
        word: 'TestCompletionItem 2',
        menu: '[coc-cadence]',
      },
    ],
  };
}
export function renderExtension(ext: Extension): void {
  updateEmulatorStatusBarItem(ext.emulatorStatusBarItem, ext.getEmulatorState());
  updateActiveAccountStatusBarItem(ext.activeAccountStatusBarItem, ext.config.getActiveAccount());
}
