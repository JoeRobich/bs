var AstMethod = function(name, parameters, type, body) {
  this.nodeType = "METHOD";
  this.name = name;
  this.parameters = parameters;
  this.type = type;
  this.body = body;
};

var AstMethodCall = function(name, parameters) {
  this.nodeType = "METHOD_CALL";
  this.name = name;
  this.parameters = parameters;
};

var AstSystemCall = function(name, parameters) {
  this.nodeType = "SYSTEM_CALL";
  this.name = name;
  this.parameters = parameters;
};

var AstReturn = function(expression) {
  this.nodeType = "RETURN";
  this.expression = expression;
};

var AstConstant = function(type, value) {
  this.nodeType = "CONSTANT";
  this.type = type;
  this.value = value;
};

var AstVariableRef = function(name) {
  this.nodeType = "VAR_REF";
  this.name = name;
};

var AstArrayRef = function(name, index) {
  this.nodeType = "ARRAY_REF";
  this.name = name;
  this.index = index;
};

var AstComment = function(message) { 
  this.nodeType = "COMMENT";
  this.message = message;
};

var AstAssignment = function(variable, expression) {
  this.nodeType = "ASSIGNMENT";
  this.variable = variable;
  this.expression = expression;
};

var AstIf = function(condition, body, elseBody) {
  this.nodeType = "IF";
  this.condition = condition;
  this.body = body;
  this.elseBody = elseBody;
};

var AstExit = function(flowType) {
  this.nodeType = "EXIT";
  this.flowType = flowType;
};

var AstComparison = function(left, right, operation) {
  this.nodeType = "COMPARISON";
  this.operation = operation;
  this.left = left;
  this.right = right;
};

var AstArithmetic = function(left, right, operation) {
  this.nodeType = "ARITHMETIC";
  this.operation = operation;
  this.left = left;
  this.right = right;
};

var AstNot = function(expression, operation) {
  this.nodeType = "NOT";
  this.operation = operation;
  this.expression = expression;
};

var AstWhile = function(condition, body) {
  this.nodeType = "WHILE";
  this.condition = condition;
  this.body = body;
};

var AstFor = function(variable, lower, upper, step, body) {
  this.nodeType = "FOR";
  this.variable = variable;
  this.lower = lower;
  this.upper = upper;
  this.step = step;
  this.body = body;
};

var AstVarDeclaration = function(term, type, expression) {
  this.nodeType = "VAR_DEC";
  this.term = term;
  this.type = type;
  this.expression = expression;
};

var AstConstDeclaration = function(term, type, expression) {
  this.nodeType = "CONST_DEC";
  this.term = term;
  this.type = type;
  this.expression = expression;
};