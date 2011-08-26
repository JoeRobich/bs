define("ace/mode/bs_highlight_rules", 
       ["require", "exports", "module", "pilot/oop", "pilot/lang",
        "ace/mode/doc_comment_highlight_rules", "ace/mode/text_highlight_rules"],
        function(require, exports, module) {

var oop = require("pilot/oop");
var lang = require("pilot/lang");
var DocCommentHighlightRules = require("ace/mode/doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var BSHighlightRules = function() {
    
    var keywords = lang.arrayToMap(
    ("as|boolean|integer|float|string|for|end|exit|sub|function|if|then|const|var|to|return|while|else|and|or|not").split("|")
    );

    var buildinConstants = lang.arrayToMap(
        ("true|false").split("|")
    );


    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "\\/\\/.*$"
            },
            new DocCommentHighlightRules().getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                merge : true,
                next : "comment"
            }, {
                token : "string.regexp",
                regex : "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"
            }, {
                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : function(value) {
                    if (keywords.hasOwnProperty(value))
                        return "keyword";
                    else if (buildinConstants.hasOwnProperty(value))
                        return "constant.language";
                    else
                        return "identifier";
                },
                // TODO: Unicode escape sequences
                // TODO: Unicode identifiers
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "\\*|\\-|\\+|=|<>|<=|>=|<|>|\\b(?:not|and|or)"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                merge : true,
                regex : ".+"
            }
        ]
    };
    
    this.embedRules(DocCommentHighlightRules, "doc-",
        [ new DocCommentHighlightRules().getEndRule("start") ]);
};

oop.inherits(BSHighlightRules, TextHighlightRules);

exports.BSHighlightRules = BSHighlightRules;
});
