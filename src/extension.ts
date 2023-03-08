import * as vscode from "vscode";
import axios from "axios";
import { camelCase, snakeCase } from "lodash";

export function activate(context: vscode.ExtensionContext) {
  let disposable1 = vscode.commands.registerCommand(
    "extension.translateToCamelCaseEnglish",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        detectLanguageAndTranslate(text, editor, selection, camelCase);
      }
    }
  );

  let disposable2 = vscode.commands.registerCommand(
    "extension.translateToSnakeCaseEnglish",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        detectLanguageAndTranslate(text, editor, selection, snakeCase);
      }
    }
  );

  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
}

async function detectLanguageAndTranslate(
  text: string,
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  transformFn: (text: string) => string
) {
  const detectUrl = `https://translation.googleapis.com/language/translate/v2/detect?key=${process.env.API_KEY}`;
  const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${process.env.API_KEY}`;

  const detectData = {
    q: text,
  };

  try {
    const detectResponse = await axios.post(detectUrl, detectData);
    const detectedLanguage = detectResponse.data.data.detections[0][0].language;

    if (detectedLanguage === "en") {
      vscode.window.showInformationMessage(
        "Selected text is already in English"
      );
    } else {
      const translateData = {
        q: text,
        target: "en",
      };

      const translateResponse = await axios.post(translateUrl, translateData);
      const translatedText =
        translateResponse.data.data.translations[0].translatedText;
      const transformedText = transformFn(translatedText);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, transformedText);
      });
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to translate text: ${error.message}`
    );
  }
}
