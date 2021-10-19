import * as vscode from 'vscode';
import * as pl from './pylex';

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "mind-reader" is now active!');
  vscode.window.showInformationMessage('Mind_Reader is loaded!');

  parser.parse('Beep Boop');

  // Increase Font Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.increaseFontScale', () => {
      vscode.commands.executeCommand('editor.action.fontZoomIn');
    })
  );

  // Decrease Font Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.decreaseFontScale', () => {
      vscode.commands.executeCommand('editor.action.fontZoomOut');
    })
  );

  // Reset Font Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.resetFontScale', () => {
      vscode.commands.executeCommand('editor.action.fontZoomReset');
    })
  );

  // Increase Editor Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.increaseEditorScale', () => {
      vscode.commands.executeCommand('workbench.action.zoomIn');
    })
  );

  // Decrease Editor Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.decreaseEditorScale', () => {
      vscode.commands.executeCommand('workbench.action.zoomOut');
    })
  );

  // Reset Editor Scale
  context.subscriptions.push(
    vscode.commands.registerCommand('mind-reader.resetEditorScale', () => {
      vscode.commands.executeCommand('workbench.action.zoomReset');
    })
  );
}

export function deactivate() {}
