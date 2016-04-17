// LICENSE : MIT
"use strict";
var React = require("react");
var ReactCodeMirror = require("react-code-mirror");
require("codemirror/addon/mode/overlay.js");
require("codemirror/mode/xml/xml.js");
require("codemirror/mode/markdown/markdown.js");
require("codemirror/mode/gfm/gfm.js");
require("codemirror/mode/javascript/javascript.js");
require("codemirror/mode/css/css.js");
require("codemirror/mode/htmlmixed/htmlmixed.js");
require("codemirror/mode/clike/clike.js");
require("codemirror/mode/meta.js");
require("codemirror/addon/edit/continuelist.js");


import AppContextLocator from "../AppContextLocator";
import SaveEditorTextToStorageUseCase from "../js/UseCase/editor/SaveEditorTextToStorageUseCase";
function scrollToBottom(cm) {
    var line = cm.lineCount();
    cm.setCursor({line: line, ch: 0});
    var myHeight = cm.getScrollInfo().clientHeight;
    var coords = cm.charCoords({line: line, ch: 0}, "local");
    cm.scrollTo(null, (coords.top + coords.bottom - myHeight) / 2);
}
export default class MarkdownEditor extends React.Component {
    constructor(props) {
        super(props);
        this.editorStore = this.props.context.editorStore;
        var editorAction = this.props.context.editorAction;
        this.editorStore.on("quote", (quoteText)=> {
            setTimeout(()=> {
                scrollToBottom(this.editor);
            }, 64);
        });
        var quote = ()=> {
            this.props.quote();
        };
        var saveFile = ()=> {
            var filePath = this.editorStore.getFilePath();
            editorAction.saveAsFile(filePath);
        };
        var createNewFile = ()=> {
            editorAction.createNewFile();
        };
        var openFile = ()=> {
            editorAction.openFile();
        };
        this.extraKeys = {
            "Cmd-T": quote,
            "Ctrl-T": quote,
            "Cmd-S": saveFile,
            "Ctrl-S": saveFile,
            "Cmd-N": createNewFile,
            "Ctrl-N": createNewFile,
            "Cmd-O": openFile,
            "Ctrl-O": openFile,
            "Enter": "newlineAndIndentContinueMarkdownList"
        };
        this.debounceOnChange = this._codeMirrorOnChange.bind(this);
    }

    componentDidMount() {
        var nodes = React.findDOMNode(this);
        this.editor = nodes.querySelector(".CodeMirror").CodeMirror;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.source !== this.editor.value;
    }

    _codeMirrorOnChange(result) {
        var text = result.target.value;
        AppContextLocator.context.useCase(SaveEditorTextToStorageUseCase.create()).execute(text);
    }

    render() {
        // TODO: value ?
        return <div className="MarkdownEditor">
            <ReactCodeMirror defaultValue={this.props.source}
                             mode="gfm"
                             lineWrapping="true"
                             lineNumbers="true"
                             extraKeys={this.extraKeys}
                             onChange={this.debounceOnChange}/>
        </div>

    }
}