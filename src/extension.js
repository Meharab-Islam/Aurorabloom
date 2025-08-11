const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
  // Command: open custom.css
  const openCss = vscode.commands.registerCommand('aurora-bloom.openCustomCss', async () => {
    const cssPath = path.join(context.extensionPath, 'custom-css', 'custom.css');
    const uri = vscode.Uri.file(cssPath);
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });
    } catch (err) {
      vscode.window.showErrorMessage(`AuroraBloom: could not open custom.css`);
    }
  });

  // Command: set background image
  const setBg = vscode.commands.registerCommand('aurora-bloom.setBackgroundImage', async () => {
    const files = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { Images: ['png', 'jpg', 'jpeg', 'gif'] },
      openLabel: 'Select Background Image'
    });
    if (!files || files.length === 0) return;

    const imgPath = files[0].fsPath;
    const cssPath = path.join(context.extensionPath, 'custom-css', 'custom.css');

    let css = `
.monaco-workbench .part.editor > .content .editor-container,
.monaco-workbench .editor-instance .view-lines {
  background-image: url("file://${imgPath.replace(/\\/g, '/')}");
  background-size: cover;
  background-position: center center;
}
.monaco-workbench .part.editor .monaco-editor,
.monaco-workbench .part.editor .editor-instance .view-lines {
  background: transparent !important;
}
.monaco-workbench .part.editor > .content::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(6, 10, 20, 0.45);
  pointer-events: none;
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');

    // Update settings for Custom CSS Loader
    const config = vscode.workspace.getConfiguration();
    let imports = config.get('vscode_custom_css.imports') || [];
    const cssUri = `file://${cssPath.replace(/\\/g, '/')}`;
    if (!imports.includes(cssUri)) {
      imports.push(cssUri);
      await config.update('vscode_custom_css.imports', imports, vscode.ConfigurationTarget.Global);
    }

    vscode.window.showInformationMessage(
      'AuroraBloom: Background image set! Now run "Enable Custom CSS and JS" from Command Palette and restart VS Code.'
    );
  });

  context.subscriptions.push(openCss, setBg);
}

function deactivate() {}

module.exports = { activate, deactivate };
