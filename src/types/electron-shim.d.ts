declare global {
  namespace Electron {
    interface SaveDialogReturnValue { canceled?: boolean; filePath?: string; filePaths?: string[]; }
    interface MessageBoxReturnValue { response?: number; checkboxChecked?: boolean; }
    interface OpenDialogReturnValue { canceled?: boolean; filePaths?: string[]; }
    interface MessageBoxOptions {}
    interface OpenDialogOptions {}
    interface SaveDialogOptions {}
  }
}

export {};
