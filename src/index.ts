import {
  commands,
  CompleteResult,
  ExtensionContext,
  LanguageClient,
  listManager,
  sources,
  State,
  StateChangeEvent,
  window,
  workspace,
} from 'coc.nvim';
import { getConfig } from './config';
import DemoList from './lists';

const START_LANGUAGE_SERVER_ARGS = ['cadence', 'language-server'];
export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-cadence works!`);
  const config = getConfig();
  await config.readLocalConfig();
  let running = false;
  context.logger.info(`${workspace.root}`);
  const client = new LanguageClient(
    'cadence',
    'Cadence',
    {
      command: 'flow',
      args: START_LANGUAGE_SERVER_ARGS,
    },
    {
      documentSelector: [{ scheme: 'file', language: 'cadence' }],
      synchronize: {
        configurationSection: 'cadence',
      },
      initializationOptions: {
        accessCheckMode: config.accessCheckMode,
        configPath: config.configPath,
        emulatorState: 0,
        activeAccountName: '',
        activeAccountAddress: '',
      },
    }
  );

  client
    .onReady()
    .then(() => window.showInformationMessage('Cadence language server started'))
    .catch((err: Error) => window.showErrorMessage(`Cadence language server failed to start: ${err.message}`));

  client.onDidChangeState((e: StateChangeEvent) => {
    running = e.newState === State.Running;
  });

  const d = client.start();

  context.subscriptions.push(d);

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
