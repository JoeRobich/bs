$(document).ready(function() {
   var editor = ace.edit("editor");
   editor.setTheme("ace/theme/idle_fingers");
   var BsMode = require("ace/mode/bs").Mode;
   editor.getSession().setMode(new BsMode());
    
   $('#run').click(function() {
      var source = editor.getSession().toString();
      var ast = BS.Parser.parse(source);
      Ast.Interpreter.run(ast);
   });
});