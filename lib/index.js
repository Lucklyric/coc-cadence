var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// src/index.ts
__markAsModule(exports);
__export(exports, {
  EmulatorState: () => EmulatorState,
  Extension: () => Extension2,
  activate: () => activate,
  renderExtension: () => renderExtension
});
var import_coc7 = __toModule(require("coc.nvim"));

// src/commands.ts
var import_coc3 = __toModule(require("coc.nvim"));

// src/language-server.ts
var import_coc = __toModule(require("coc.nvim"));

// src/account.ts
var Account = class {
  constructor(name, address) {
    this.address = address;
    this.name = name;
    this.index = -1;
  }
  setIndex(index) {
    this.index = index;
  }
  getAddress(withPrefix = true) {
    if (this.address.includes("0x")) {
      return withPrefix ? this.address : this.address.replace("0x", "");
    } else {
      return withPrefix ? `0x${this.address}` : this.address;
    }
  }
  getName() {
    const name = this.name === "" ? `Account ${this.index + 1}` : this.name;
    return `${name[0].toUpperCase()}${name.slice(1)}`;
  }
  fullName() {
    return `${this.getName()} (${this.getAddress()})`;
  }
};

// src/language-server.ts
var START_LANGUAGE_SERVER_ARGS = ["cadence", "language-server"];
var LanguageServerAPI = class {
  constructor(ctx, config, emulatorState, activeAccount) {
    this.running = false;
    const activeAccountName = activeAccount != null ? activeAccount.name : "";
    const activeAccountAddress = activeAccount != null ? activeAccount.address : "";
    const {configPath} = config;
    this.client = new import_coc.LanguageClient("cadence", "Cadence", {
      command: config.flowCommand,
      args: START_LANGUAGE_SERVER_ARGS
    }, {
      documentSelector: [{scheme: "file", language: "cadence"}],
      synchronize: {
        configurationSection: "cadence"
      },
      initializationOptions: {
        accessCheckMode: config.accessCheckMode,
        configPath,
        emulatorState,
        activeAccountName,
        activeAccountAddress
      }
    });
    this.client.onReady().then(() => import_coc.window.showInformationMessage("Cadence language server started")).catch((err) => import_coc.window.showErrorMessage(`Cadence language server failed to start: ${err.message}`));
    this.client.onDidChangeState((e) => {
      this.running = e.newState === import_coc.State.Running;
    });
    const clientDisposable = this.client.start();
    ctx.subscriptions.push(clientDisposable);
  }
  async initAccountManager() {
    return await this.client.sendRequest("workspace/executeCommand", {
      command: INIT_ACCOUNT_MANAGER,
      arguments: []
    });
  }
  async changeEmulatorState(emulatorState) {
    return await this.client.sendRequest("workspace/executeCommand", {
      command: CHANGE_EMULATOR_STATE,
      arguments: [emulatorState]
    });
  }
  async switchActiveAccount(account) {
    const {name, address} = account;
    return await this.client.sendRequest("workspace/executeCommand", {
      command: SWITCH_ACCOUNT_SERVER,
      arguments: [name, address]
    });
  }
  async createAccount() {
    const res = await this.client.sendRequest("workspace/executeCommand", {
      command: CREATE_ACCOUNT_SERVER,
      arguments: []
    });
    const {name, address} = res;
    return new Account(name, address);
  }
  async createDefaultAccounts(count) {
    const res = await this.client.sendRequest("workspace/executeCommand", {
      command: CREATE_DEFAULT_ACCOUNTS_SERVER,
      arguments: [count]
    });
    const accounts = [];
    for (const account of res) {
      const {name, address} = account;
      accounts.push(new Account(name, address));
    }
    return accounts;
  }
};

// src/terminal.ts
var import_coc2 = __toModule(require("coc.nvim"));
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));
var FLOW_CONFIG_FILENAME = "flow.json";
var FLOW_DB_FILENAME = "flowdb";
async function createTerminal(ctx) {
  const storagePath = getStoragePath(ctx);
  if (storagePath === void 0) {
    throw new Error("Missing extension storage path");
  }
  resetStorage(ctx);
  return await import_coc2.workspace.createTerminal({
    name: "Flow Emulator",
    cwd: storagePath
  });
}
function resetStorage(ctx) {
  const storagePath = ctx.storagePath;
  if (storagePath === void 0) {
    return;
  }
  try {
    (0, import_fs.unlinkSync)((0, import_path.join)(storagePath, FLOW_CONFIG_FILENAME));
    (0, import_fs.unlinkSync)((0, import_path.join)(storagePath, FLOW_DB_FILENAME));
  } catch (err) {
    if (err.code === "ENOENT") {
      return;
    }
    console.error("Error resetting storage: ", err);
  }
}
function getStoragePath(ctx) {
  let storagePath = ctx.storagePath;
  if (storagePath === void 0) {
    storagePath = "./";
  }
  console.log("Storage path: ", storagePath);
  if (!(0, import_fs.existsSync)(storagePath)) {
    try {
      (0, import_fs.mkdirSync)(storagePath);
    } catch (err) {
      console.log("Error creating storage path: ", err);
      return;
    }
  }
  return storagePath;
}

// src/strings.ts
var ACTIVE_PREFIX = "\u{1F7E2}";
var INACTIVE_PREFIX = "\u26AB\uFE0F";
var ADD_NEW_PREFIX = "\u{1F423}";
var COPY_ADDRESS = "Copy Address";
var CREATE_NEW_ACCOUNT = "Create New Account";

// src/commands.ts
var RESTART_SERVER = "cadence.restartServer";
var START_EMULATOR = "cadence.runEmulator";
var STOP_EMULATOR = "cadence.stopEmulator";
var CREATE_ACCOUNT = "cadence.createAccount";
var SWITCH_ACCOUNT = "cadence.switchActiveAccount";
var CREATE_ACCOUNT_SERVER = "cadence.server.flow.createAccount";
var CREATE_DEFAULT_ACCOUNTS_SERVER = "cadence.server.flow.createDefaultAccounts";
var SWITCH_ACCOUNT_SERVER = "cadence.server.flow.switchActiveAccount";
var CHANGE_EMULATOR_STATE = "cadence.server.flow.changeEmulatorState";
var INIT_ACCOUNT_MANAGER = "cadence.server.flow.initAccountManager";
function registerCommand(ctx, command, callback) {
  ctx.subscriptions.push(import_coc3.commands.registerCommand(command, callback));
}
function registerCommands(ext) {
  registerCommand(ext.ctx, RESTART_SERVER, restartServer(ext));
  registerCommand(ext.ctx, START_EMULATOR, startEmulator(ext));
  registerCommand(ext.ctx, STOP_EMULATOR, stopEmulator(ext));
  registerCommand(ext.ctx, CREATE_ACCOUNT, createAccount(ext));
  registerCommand(ext.ctx, SWITCH_ACCOUNT, switchActiveAccount(ext));
}
var restartServer = (ext) => async () => {
  await ext.api.client.stop();
  const activeAccount = ext.config.getActiveAccount();
  ext.api = new LanguageServerAPI(ext.ctx, ext.config, ext.emulatorState, activeAccount);
  return ext;
};
var startEmulator = (ext) => async () => {
  const {configPath} = ext.config;
  ext.setEmulatorState(EmulatorState.Starting);
  renderExtension(ext);
  ext.terminal.sendText([ext.config.flowCommand, `emulator`, `--config-path="${configPath}"`, `--verbose`].join(" "));
  ext.terminal.show();
  try {
    await ext.api.initAccountManager();
    const accounts = await ext.api.createDefaultAccounts(ext.config.numAccounts);
    for (const account of accounts) {
      ext.config.addAccount(account);
    }
    await setActiveAccount(ext, 0);
    ext.setEmulatorState(EmulatorState.Started);
    renderExtension(ext);
  } catch (err) {
    ext.setEmulatorState(EmulatorState.Stopped);
    renderExtension(ext);
  }
  return ext.getEmulatorState();
};
var stopEmulator = (ext) => async () => {
  ext.terminal.dispose();
  ext.terminal = await createTerminal(ext.ctx);
  ext.setEmulatorState(EmulatorState.Stopped);
  ext.config.resetAccounts();
  renderExtension(ext);
  await ext.api.client.stop();
  ext.api = new LanguageServerAPI(ext.ctx, ext.config, ext.emulatorState, null);
  return ext.getEmulatorState();
};
var createAccount = (ext) => async () => {
  return await createNewAccount(ext);
};
var switchActiveAccount = (ext) => async () => {
  const accountOptions = Object.values(ext.config.accounts).map((account) => {
    const prefix = account.index === ext.config.activeAccount ? ACTIVE_PREFIX : INACTIVE_PREFIX;
    const label = `${prefix} ${account.fullName()}`;
    return label;
  });
  accountOptions.push(`${ADD_NEW_PREFIX} ${CREATE_NEW_ACCOUNT}`);
  import_coc3.window.showQuickpick(accountOptions).then(async (selected) => {
    if (selected === void 0) {
      return;
    }
    if (selected === accountOptions.length - 1) {
      await createNewAccount(ext);
      return;
    }
    await setActiveAccount(ext, selected);
    renderExtension(ext);
  }, () => {
  });
};
var createNewAccount = async (ext) => {
  try {
    const account = await ext.api.createAccount();
    ext.config.addAccount(account);
    const lastIndex = ext.config.accounts.length - 1;
    await setActiveAccount(ext, lastIndex);
    renderExtension(ext);
  } catch (err) {
    import_coc3.window.showErrorMessage(`Failed to create account: ${err.message}`).then(() => {
    }, () => {
    });
  }
};
var setActiveAccount = async (ext, activeIndex) => {
  const activeAccount = ext.config.getAccount(activeIndex);
  if (activeAccount == null) {
    import_coc3.window.showErrorMessage("Failed to switch account: account does not exist.").then(() => {
    }, () => {
    });
    return;
  }
  try {
    await ext.api.switchActiveAccount(activeAccount);
    ext.config.setActiveAccount(activeIndex);
    import_coc3.window.showInformationMessage(`Switched to account ${activeAccount.fullName()}`, COPY_ADDRESS).then(() => {
    });
    renderExtension(ext);
  } catch (err) {
    import_coc3.window.showErrorMessage(`Failed to switch account: ${err.message}`).then(() => {
    }, () => {
    });
  }
};

// src/config.ts
var import_coc4 = __toModule(require("coc.nvim"));
var CONFIG_FLOW_COMMAND = "flowCommand";
var CONFIG_NUM_ACCOUNTS = "numAccounts";
var CONFIG_ACCESS_CHECK_MODE = "accessCheckMode";
var Config = class {
  constructor(flowCommand, numAccounts, accessCheckMode) {
    this.flowCommand = flowCommand;
    this.numAccounts = numAccounts;
    this.accessCheckMode = accessCheckMode;
    this.accounts = [];
    this.activeAccount = null;
    this.configPath = "";
  }
  async readLocalConfig() {
    const file = await import_coc4.workspace.findUp("flow.json");
    if (file === null) {
      return false;
    }
    const configFile = file;
    this.configPath = configFile;
    return true;
  }
  addAccount(account) {
    const index = this.accounts.length;
    account.setIndex(index);
    this.accounts.push(account);
  }
  setActiveAccount(index) {
    this.activeAccount = index;
  }
  getActiveAccount() {
    if (this.activeAccount == null) {
      return null;
    }
    return this.accounts[this.activeAccount];
  }
  getAccount(index) {
    if (index < 0 || index >= this.accounts.length) {
      return null;
    }
    return this.accounts[index];
  }
  accountExists(name) {
    return this.accounts.filter((acc) => {
      return acc.name === name;
    }).length > 0;
  }
  resetAccounts() {
    this.accounts = [];
    this.activeAccount = -1;
  }
};
function getConfig() {
  const cadenceConfig = import_coc4.workspace.getConfiguration("cadence");
  let flowCommand = cadenceConfig.get(CONFIG_FLOW_COMMAND);
  if (flowCommand === void 0) {
    flowCommand = "flow";
  }
  let numAccounts = cadenceConfig.get(CONFIG_NUM_ACCOUNTS);
  if (numAccounts === void 0) {
    numAccounts = 3;
  }
  let accessCheckMode = cadenceConfig.get(CONFIG_ACCESS_CHECK_MODE);
  if (accessCheckMode === void 0) {
    accessCheckMode = "strict";
  }
  return new Config(flowCommand, numAccounts, accessCheckMode);
}
function handleConfigChanges() {
  import_coc4.workspace.onDidChangeConfiguration((e) => {
    const promptRestartKeys = ["languageServerPath", "accountKey", "accountAddress", "emulatorAddress"];
    const shouldPromptRestart = promptRestartKeys.some((key) => e.affectsConfiguration(`cadence.${key}`));
    if (shouldPromptRestart) {
      import_coc4.window.showInformationMessage("Server launch configuration change detected. Reload the window for changes to take effect", "Reload Window", "Not now").then((choice) => {
        if (choice === "Reload Window") {
          import_coc4.commands.executeCommand("workbench.action.reloadWindow").then(() => {
          }, () => {
          });
        }
      }, () => {
      });
    }
  });
}

// src/lists.ts
var import_coc5 = __toModule(require("coc.nvim"));
var DemoList = class extends import_coc5.BasicList {
  constructor(nvim) {
    super(nvim);
    this.name = "demo_list";
    this.description = "CocList for coc-cadence";
    this.defaultAction = "open";
    this.actions = [];
    this.addAction("open", (item) => {
      import_coc5.window.showMessage(`${item.label}, ${item.data.name}`);
    });
  }
  async loadItems(context) {
    return [
      {
        label: "coc-cadence list item 1",
        data: {name: "list item 1"}
      },
      {
        label: "coc-cadence list item 2",
        data: {name: "list item 2"}
      }
    ];
  }
};
var lists_default = DemoList;

// src/status-bar.ts
var import_coc6 = __toModule(require("coc.nvim"));
function createEmulatorStatusBarItem() {
  return import_coc6.window.createStatusBarItem(1);
}
function updateEmulatorStatusBarItem(statusBarItem, emulatorState) {
  switch (emulatorState) {
    case EmulatorState.Stopped:
      statusBarItem.text = "$(debug-start) Start Flow Emulator";
      break;
    case EmulatorState.Starting:
      statusBarItem.text = "$(loading~spin) Emulator starting...";
      break;
    case EmulatorState.Started:
      statusBarItem.text = "$(debug-stop) Stop Flow Emulator";
      break;
  }
  statusBarItem.show();
}
function createActiveAccountStatusBarItem() {
  const statusBarItem = import_coc6.window.createStatusBarItem(2);
  return statusBarItem;
}
function updateActiveAccountStatusBarItem(statusBarItem, activeAccount) {
  if (activeAccount == null) {
    statusBarItem.hide();
    return;
  }
  statusBarItem.text = `$(key) Active account: ${activeAccount.fullName()}`;
  statusBarItem.show();
}

// src/index.ts
var EmulatorState;
(function(EmulatorState2) {
  EmulatorState2[EmulatorState2["Stopped"] = 0] = "Stopped";
  EmulatorState2[EmulatorState2["Starting"] = 1] = "Starting";
  EmulatorState2[EmulatorState2["Started"] = 2] = "Started";
})(EmulatorState || (EmulatorState = {}));
var Extension2 = class {
  constructor(config, ctx, api, terminal, emulatorStatusBarItem, activeAccountStatusBarItem) {
    this.emulatorState = 0;
    this.config = config;
    this.ctx = ctx;
    this.api = api;
    this.terminal = terminal;
    this.emulatorStatusBarItem = emulatorStatusBarItem;
    this.activeAccountStatusBarItem = activeAccountStatusBarItem;
  }
  getEmulatorState() {
    return this.emulatorState;
  }
  setEmulatorState(state) {
    this.emulatorState = state;
    this.api.changeEmulatorState(state).then(() => {
    }, () => {
    });
  }
};
async function activate(context) {
  import_coc7.window.showMessage(`coc-cadence works!`);
  let config;
  let terminal;
  let api;
  try {
    config = getConfig();
    await config.readLocalConfig();
    terminal = await createTerminal(context);
    api = new LanguageServerAPI(context, config, 0, null);
  } catch (err) {
    import_coc7.window.showErrorMessage("Failed to activate extension: ", err).then(() => {
    }, () => {
    });
    return;
  }
  handleConfigChanges();
  const ext = new Extension2(config, context, api, terminal, createEmulatorStatusBarItem(), createActiveAccountStatusBarItem());
  registerCommands(ext);
  renderExtension(ext);
  context.logger.info(`${import_coc7.workspace.root}`);
  context.subscriptions.push(import_coc7.commands.registerCommand("coc-cadence.Command", async () => {
    import_coc7.window.showMessage(`coc-cadence Commands works!`);
  }), import_coc7.listManager.registerList(new lists_default(import_coc7.workspace.nvim)), import_coc7.sources.createSource({
    name: "coc-cadence completion source",
    doComplete: async () => {
      const items = await getCompletionItems();
      return items;
    }
  }), import_coc7.workspace.registerKeymap(["n"], "cadence-keymap", async () => {
    import_coc7.window.showMessage(`registerKeymap`);
  }, {sync: false}), import_coc7.workspace.registerAutocmd({
    event: "InsertLeave",
    request: true,
    callback: () => {
      import_coc7.window.showMessage(`registerAutocmd on InsertLeave`);
    }
  }));
}
async function getCompletionItems() {
  return {
    items: [
      {
        word: "TestCompletionItem 1",
        menu: "[coc-cadence]"
      },
      {
        word: "TestCompletionItem 2",
        menu: "[coc-cadence]"
      }
    ]
  };
}
function renderExtension(ext) {
  updateEmulatorStatusBarItem(ext.emulatorStatusBarItem, ext.getEmulatorState());
  updateActiveAccountStatusBarItem(ext.activeAccountStatusBarItem, ext.config.getActiveAccount());
}
