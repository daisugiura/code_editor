document.addEventListener("DOMContentLoaded", function() {
    var editor = CodeMirror(document.getElementById('editor'), {
        mode: "javascript",
        lineNumbers: true,
        theme: "default",
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        }
    });

    // 初期コメントを設定（自動補完機能の説明を含む）
    editor.setValue(`// ここにJavaScriptコードを入力してください
// 自動補完機能が利用できます。
// 自動補完を使用するには、Ctrl-Space を押してください。\n
console.log("Hello, World!");\n`);

    // 実行ボタンのクリックイベントを設定
    document.getElementById('runButton').addEventListener('click', function() {
        // エディタの内容を取得
        var code = editor.getValue();
        
        // 出力エリアをクリア
        var output = document.getElementById('output');
        output.textContent = '';

        // console.logの出力をキャプチャ
        var originalConsoleLog = console.log;
        console.log = function(message) {
            output.textContent += message + '\n';
            originalConsoleLog.apply(console, arguments);
        };

        try {
            // 新しい関数を作成し、コードを実行
            var result = new Function(code)();
            if (result !== undefined) {
                output.textContent += result;
            }
        } catch (error) {
            output.textContent += 'Error: ' + error.message;
        } finally {
            // console.logを元に戻す
            console.log = originalConsoleLog;
        }
    });

    // 保存ボタンのクリックイベントを設定
    document.getElementById('saveButton').addEventListener('click', async function() {
        // エディタの内容を取得
        var code = editor.getValue();
        // ファイル名を取得
        var fileName = document.getElementById('fileName').value;

        // ファイル名が指定されていない場合のデフォルト名
        if (!fileName) {
            fileName = 'code.js';
        } else if (!fileName.endsWith('.js')) {
            fileName += '.js';
        }

        // ブラウザの種類を判別
        const isChromium = window.chrome !== null && window.chrome !== undefined && window.navigator.vendor === 'Google Inc.';

        if (isChromium && window.showDirectoryPicker) {
            // Chromiumベースのブラウザ用の保存処理
            try {
                // フォルダを選択
                const handle = await window.showDirectoryPicker();
                // ファイルを作成または既存ファイルを取得
                const fileHandle = await handle.getFileHandle(fileName, { create: true });
                // 書き込み用ストリームを作成
                const writable = await fileHandle.createWritable();
                // コードを書き込む
                await writable.write(code);
                // 書き込みを完了
                await writable.close();
                alert('File saved successfully!');
            } catch (error) {
                console.error('Error saving file:', error);
                alert('Failed to save file: ' + error.message);
            }
        } else {
            // その他のブラウザ用の保存処理
            const blob = new Blob([code], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // ファイルロードのクリックイベントを設定
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.js';
        fileInput.onchange = function(event) {
            var file = event.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    editor.setValue(e.target.result);
                };
                reader.readAsText(file);
            }
        };
        fileInput.click();
    });
});
