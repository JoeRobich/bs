$(document).ready(function() {
   $('#run').click(function() {
      var source = $('#src').val();
      var ast = BS.Parser.parse(source);
      Ast.Interpreter.run(ast);
   });
});