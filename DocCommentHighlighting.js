define("ace/mode/doc_comment_highlight_rules", 
       ["require", "exports", "module", "pilot/oop", "ace/mode/text_highlight_rules"],
       function (require, exports, module) {
           
    var oop = require("pilot/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
    
    var DocCommentHighlightRules = function() {
    
        this.$rules = {
            "start" : [ {
                token : "comment.doc.tag",
                regex : "@[\\w\\d_]+" // TODO: fix email addresses
            }, {
                token : "comment.doc",
                merge : true,
                regex : "\\s+"
            }, {
                token : "comment.doc",
                merge : true,
                regex : "TODO"
            }, {
                token : "comment.doc",
                merge : true,
                regex : "[^@\\*]+"
            }, {
                token : "comment.doc",
                merge : true,
                regex : "."
            }]
        };
    };
    
    oop.inherits(DocCommentHighlightRules, TextHighlightRules);
    
    (function() {
    
        this.getStartRule = function(start) {
            return {
                token : "comment.doc", // doc comment
                merge : true,
                regex : "\\/\\*(?=\\*)",
                next  : start
            };
        };
        
        this.getEndRule = function (start) {
            return {
                token : "comment.doc", // closing comment
                merge : true,
                regex : "\\*\\/",
                next  : start
            };
        };
    
    }).call(DocCommentHighlightRules.prototype);
    
    exports.DocCommentHighlightRules = DocCommentHighlightRules;

});