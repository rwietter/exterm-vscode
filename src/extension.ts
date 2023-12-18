import * as vscode from 'vscode';
import * as cp from 'child_process';

const supportedTerminals = {
  'kitty': '-d',
  'gnome-terminal': '--working-directory',
  'xfce4-terminal': '--working-directory',
  'alacritty': '--working-directory',
  'kermit': '-w',
  'wezterm': 'start --cwd',
  'urxvt': '-cd',
  'cmd.exe': '/c', // TODO: test this flag
}

type TerminalKind = keyof typeof supportedTerminals;

export function activate(context: vscode.ExtensionContext) {
  let openProjectInExternalTerminal = vscode.commands.registerCommand('exterm.openProjectInExternalTerminal', (uri: vscode.Uri | undefined) => {

    if (!uri) return vscode.window.showInformationMessage('No directory or file selected.');

    const defaultPlatformTerminalCommand = process.platform === 'win32' ? 'cmd.exe' : 'kitty';
    const terminalConfig = vscode.workspace.getConfiguration('exterm');
    const userTerm: TerminalKind | undefined = terminalConfig.get('terminalKind');

    let terminalKind: TerminalKind = userTerm || defaultPlatformTerminalCommand
    let flagDirectory = supportedTerminals[terminalKind];
    let directoryPath = uri.fsPath;

    vscode.window.showInformationMessage(`Opening ${directoryPath} in ${terminalKind}...`);

    cp.spawn(terminalKind, [flagDirectory, directoryPath], {
      detached: false,
      shell: true,
      windowsHide: false
    });
  });

  context.subscriptions.push(openProjectInExternalTerminal);
}

export function deactivate() { }
