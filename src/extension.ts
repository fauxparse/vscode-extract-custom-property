import * as vscode from 'vscode';

function defaultCustomPropertyName(lines: string[]): string {
  // get all the lines with opening or closing braces
  const selectors = lines
    .reduce((s: string[], line: string) => {
      const matches = Array.from(line.match(/[^{]*\}|[^}]*\{/g) || []);
      return [...s, ...matches];
    }, [])
    .reverse();

  // remove complete nestings
  while (true) {
    const index = selectors.findIndex(
      (selector, i) => selector.includes('{') && selectors[i + 1]?.includes('}')
    );
    if (index < 0) break;
    selectors.splice(index, 2);
  }

  // add the property name
  return [
    '-',
    ...selectors.map((s) => s.replace(/[^\w_-]/g, '')),
    lines[0].split(/:/)[0].trim(),
  ].join('-');
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Activated extract-custom-property');

  let disposable = vscode.commands.registerCommand('extract-custom-property.extract', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const value = editor.document.getText(selection);

    const previous = editor.document.getText(
      new vscode.Range(0, 0, selection.start.line + 1, selection.start.character)
    );

    const lines = previous.split('\n').reverse();
    const blockStart = lines.findIndex((line) => line.includes('{'));
    const nextLineIndex = Math.max(blockStart - 1, 0);
    const indent = ((blockStart > 0 ? lines[nextLineIndex] : '').match(/^\s*/) || [''])[0];

    let propertyName = await vscode.window.showInputBox({
      placeHolder: '--your-custom-property-name',
      prompt: 'Custom property name',
      value: defaultCustomPropertyName(lines),
    });

    if (!propertyName) return;
    propertyName = propertyName.trim().replace(/^-*/, '--');

    editor.edit((builder) => {
      builder.replace(selection, `var(${propertyName})`);
      const row = lines.length - blockStart - 1;
      const column = lines[blockStart].lastIndexOf('{') + 1;
      builder.replace(
        new vscode.Range(row, column, row, column),
        `\n${indent}${propertyName}: ${value};`
      );
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
