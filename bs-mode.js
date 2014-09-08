ace.define("ace/mode/bs", 
       ["require", "exports", "module", "pilot/oop", "ace/mode/text", 
        "ace/tokenizer", "ace/mode/bs_highlight_rules", "ace/mode/behaviour/Bsstyle"],
       function(require, exports, module) {

var oop = require("pilot/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var BSHighlightRules = require("ace/mode/bs_highlight_rules").BSHighlightRules;
var BsstyleBehaviour = require("ace/mode/behaviour/Bsstyle").BsstyleBehaviour;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new BSHighlightRules().getRules());
    this.$behaviour = new BsstyleBehaviour();
};
oop.inherits(Mode, TextMode);

(function() {
    
      this.getNextLineIndent = function(state, line, tab) {
	      var indent = this.$getIndent(line);

	      var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
	      var tokens = tokenizedLine.tokens;
	      var endState = tokenizedLine.state;

	      if (tokens.length && tokens[tokens.length-1].type == "comment") {
	          return indent;
	      }
      
	      if (state == "start") {
	          var match = line.match(/^.*[\{\(\[]\s*$/);
	          if (match) {
	              indent += tab;
	          }
	      }

	      return indent;
	  };


    this.createWorker = function(session) {
        return null;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
