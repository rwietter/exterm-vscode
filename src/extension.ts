import * as child_process from 'node:child_process';
import * as vscode from 'vscode';

const terminalWorkingDirectory = {
  'kitty': '-d',
  'gnome-terminal': '--working-directory',
  'xfce4-terminal': '--working-directory',
  'alacritty': '--working-directory',
  'kermit': '-w',
  'wezterm': 'start --cwd',
  'urxvt': '-cd',
  'xterm': '-e',
  'konsole': '--workdir',
  'cmd.exe': '/c', // TODO: I do not use Windows, so I am not sure if this is correct
} as const;

type DefaultPlatformTerminal = Partial<Record<typeof process.platform, TerminalKind>>;

const defaultPlatformTerminal: DefaultPlatformTerminal = {
  win32: 'cmd.exe',
  linux: 'kitty',
  darwin: 'alacritty',
}

type TerminalKind = keyof typeof terminalWorkingDirectory;

export function activate(context: vscode.ExtensionContext) {
  const openProjectInExternalTerminal = vscode.commands.registerCommand('exterm.openProjectInExternalTerminal', (uri: vscode.Uri | undefined) => {

    if (!uri) return vscode.window.showInformationMessage('No item selected. Please select a directory to open in an external terminal.');

    const fsPathNormalized = uri.fsPath?.replace(/ /g, '\\ ');

    const defaultTerminal = defaultPlatformTerminal[process.platform] || 'kitty';
    const terminalConfig = vscode.workspace.getConfiguration('exterm');
    const userTerm: TerminalKind | undefined = terminalConfig.get('terminalKind');

    const terminal: TerminalKind = userTerm || defaultTerminal
    const flagDirectory = terminalWorkingDirectory[terminal];
    const directoryPath = fsPathNormalized;

    const termArgs = [flagDirectory, directoryPath];

    const child = child_process.spawn(terminal, termArgs, {
      detached: false,
      shell: true,
      windowsHide: true
    });

    child.stderr.on('data', (err) => {
      vscode.window.showErrorMessage(`Exterm Error: ${err.toString()}`);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        vscode.window.showErrorMessage(`Exterm Exited: terminal process exited with code ${code}`);
        return;
      }
    });

    child.on('error', (err) => {
      vscode.window.showErrorMessage(`Exterm Error: failed to start terminal: ${err.message}`);
    });
  });

  context.subscriptions.push(openProjectInExternalTerminal);
}

export function deactivate() { }
