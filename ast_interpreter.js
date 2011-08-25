var Ast = {};
Ast.Interpreter = (function() {
  
    var VariableInstance = function(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
    };
    
    var ArrayInstance = function(name, length, type, source) {
        this.name = name;
        this.length = length;
        this.type = type;
        this.values = source;
    };
    
    var Program = function() {
        this.methods = {};
        this.constants = {};
        this.frames = [];
        
        this.getActiveFrame = function() {
            if (this.frames.length > 0) {
                return this.frames[this.frames.length - 1];
            }
            
            return undefined;
        };
        
        this.findConstant = function(name) {
            if (this.constants.hasOwnProperty(name)) {
                return this.constants[name];   
            }
            
            return undefined;
        };
    };
  
    var Frame = function(parent) {
        this.parent = parent;
        
        this.variables = {};
        this.constants = {};
        
        this.findVariable = function(name, recurse) {
            if (this.variables.hasOwnProperty(name)) {
                return this.variables[name];
            }
            else if (recurse && this.parent) {
                return this.parent.findVariable(name, recurse);   
            }
            
            return undefined;
        };
        
        this.findConstant = function(name) {
            if (this.constants.hasOwnProperty(name)) {
                return this.constants[name];   
            }
            else if (this.parent) {
                return this.parent.findConstant(name);   
            }
            else if (activeProgram) {
                return activeProgram.findConstant(name);   
            }
            
            return undefined;
        };
    };
    
    var activeProgram = null;
  
    var result = {
        run: function(ast) {
            activeProgram = new Program();
            
            this.loadConstantsAndMethods(ast);
            
            this.runMethod("main", []);
            
            activeProgram = null;
        },
        
        loadConstantsAndMethods: function(ast) {
            for (var index = 0; index < ast.length; index++) {
                var node = ast[index];
                
                if (node.nodeType == "CONST_DEC") {
                    this.visitGlobalConstantDec(node);   
                } 
                else if (node.nodeType == "METHOD") {
                    this.visitMethod(node);   
                }
            }
        },
        
        visitGlobalConstantDec: function(node) {
            var constant = activeProgram.findConstant(node.term.name);
            
            if (constant === undefined) {
                var value = this.executeGlobalConstantExpression(node.expression);
                constant = new VariableInstance(node.term.name, node.type, value);
                activeProgram.constants[node.term.name] = constant;
            }
            else {
                throw new Error("The constant " + node.term.name + 
                              " is already defined");
            }
        },
        
        executeGlobalConstantExpression: function(node) {
            var left;
            var right;
            
            if (node.nodeType == "COMPARISON") {
                left = this.executeGlobalConstantExpression(node.left);
                right = this.executeGlobalConstantExpression(node.right);

                if (node.operation == "and") {
                    return left && right;
                }
                else if (node.operation == "or") {
                    return left || right;
                }
                else if (node.operation == "=") {
                    return left === right;
                }
                else if (node.operation == "<>") {
                    return left !== right;
                }
                else if (node.operation == ">=") {
                    return left >= right;
                }
                else if (node.operation == "<=") {
                    return left <= right;
                }
                else if (node.operation == ">") {
                    return left > right;
                }
                else if (node.operation == "<") {
                    return left < right;
                }
                else {
                    throw new Error("Expected and, or, =, <>, >=, <=, >, < but found " + 
                                   node.operation);
                }   
            } 
            else if (node.nodeType == "ARITHMETIC") {
                left = this.executeGlobalConstantExpression(node.left);
                right = this.executeGlobalConstantExpression(node.right);

                if (node.operation == "+") {
                    return left + right;
                }
                else if (node.operation == "-") {
                    return left - right;
                }
                else if (node.operation == "*") {
                    return left * right;
                }
                else if (node.operation == "/") {
                    if (right !== 0) {
                        return left / right;
                    }
                    
                    throw new Error("Expression tried to divide by zero.");
                }
                else {
                    throw new Error("Expected +. -. *, / but found " + 
                                   node.operation);
                }    
            }
            else if (node.nodeType == "NOT") {
                right = this.executeGlobalConstantExpression(node.expression);
                return !right;
            }
            else if (node.nodeType == "VARIABLE_REF") {
                return activeProgram.findConstant(node.name);
            }
            else if (node.nodeType == "CONSTANT") {
                return node.value;
            }
            
        },
        
        visitMethod: function(node) {
            var method = activeProgram.methods[node.name];
            
            if (method === undefined) {
                activeProgram.methods[node.name] = node;
            }
            else {
                throw new Error("The method " + node.name +
                              " is already defined");
            }
        },
        
        runMethod: function(name, params) {
            var returnValue;
            var frame;
            var node;
            var index;
            var methodNode = activeProgram.methods[name];
            
            if (methodNode) {
                if (methodNode.parameters.length == params.length) {
                    
                    frame = this.createFrame(null, methodNode.parameters, params);
                    
                    activeProgram.frames.push(frame);
                    
                    for (index = 0; index < methodNode.body.length; index++) {
                        node = methodNode.body[index]; 
                        
                        try {
                            this.visitNode(node);
                        }
                        catch (ex) {
                            if (ex.type == "RETURN") {
                                returnValue = ex.value;
                                break;
                            }
 
                            activeProgram.frames.pop();
                            throw ex;
                        }
                    }
                    
                    activeProgram.frames.pop();
                }
                else {
                    throw new Error("Expected " + methodNode.parameters.legnth +
                                  " parameters but passed " + params.length);   
                }
            }
            else {
                throw new Error("Could not find method " + name);   
            }
            
            return returnValue;
        },
        
        createFrame: function (parent, paramDefs, params) {
            var frame = new Frame(parent);
            
            for (var index = 0; index < paramDefs.length; index++) {
                var paramDef = paramDefs[index];
                var param = params[index];
                
                var value = this.executeExpression(param);
                
                var parameter = frame.findVariable(paramDef.term.name);
            
                if (parameter === undefined) {
                    if (paramDef.term.nodeType == "ARRAY_REF") {
                        parameter = new ArrayInstance(paramDef.term.name,
                            paramDef.term.index, paramDef.type, value);
                    }
                    else if (paramDef.term.nodeType == "VAR_REF") {
                        parameter = new VariableInstance(paramDef.term.name,
                            paramDef.type, value);
                    }
                    else {
                        throw new Error("Expected an array or variable definition " +
                                      "but found a " + paramDef.term.nodeType);
                    }
                    
                    frame.variables[paramDef.term.name] = parameter;
                }
                else {
                    throw new Error("The parameter " + paramDef.term.name +
                                  " is already defined");
                }
            }
        
            return frame;
        },
        
        executeExpression: function(node) {
            var left;
            var right;
            var frame;
            var variable;
            
            if (node.nodeType == "COMPARISON") {
                left = this.executeExpression(node.left);
                right = this.executeExpression(node.right);

                if (node.operation == "and") {
                    return left && right;
                }
                else if (node.operation == "or") {
                    return left || right;
                }
                else if (node.operation == "=") {
                    return left == right;
                }
                else if (node.operation == "<>") {
                    return left != right;
                }
                else if (node.operation == ">=") {
                    return left >= right;
                }
                else if (node.operation == "<=") {
                    return left <= right;
                }
                else if (node.operation == ">") {
                    return left > right;
                }
                else if (node.operation == "<") {
                    return left < right;
                }
                else {
                    throw new Error("Expected and, or, =, <>, >=, <=, >, < but found " + 
                                   node.operation);
                }   
            } 
            else if (node.nodeType == "ARITHMETIC") {
                left = this.executeExpression(node.left);
                right = this.executeExpression(node.right);

                if (node.operation == "+") {
                    return left + right;
                }
                else if (node.operation == "-") {
                    return left - right;
                }
                else if (node.operation == "*") {
                    return left * right;
                }
                else if (node.operation == "/") {
                    if (right !== 0) {
                        return left / right;
                    }
                    
                    throw new Error("Expression tried to divide by zero.");
                }
                else {
                    throw new Error("Expected +. -. *, / but found " + 
                                   node.operation);
                }    
            }
            else if (node.nodeType == "NOT") {
                right = this.executeExpression(node.expression);
                return !right;
            }
            else if (node.nodeType == "METHOD_CALL") {
                return this.runMethod(node.name, node.parameters);
            }
            else if (node.nodeType == "SYSTEM_CALL") {
                return this.visitSystemCall(node);   
            }
            else if (node.nodeType == "ARRAY_REF") {
                frame = activeProgram.getActiveFrame();
                variable = frame.findVariable(node.name, true);
                
                if (variable) {
                    return variable.values[node.index];
                }
                
                throw new Error("Array " + node.name + " could not be found.");
            }
            else if (node.nodeType == "VAR_REF") {
                frame = activeProgram.getActiveFrame();
                variable = frame.findVariable(node.name, true);
                
                if (variable) {
                    return variable.value;   
                }
                
                variable = frame.findConstant(node.name);
                
                if (variable) {
                    return variable.value;   
                }
                
                throw new Error("Variable " + node.name + " could not be found.");
            }
            else if (node.nodeType == "CONSTANT") {
                return node.value;
            }  
        },
        
        visitNode: function(node) {
            if (node.nodeType == "METHOD_CALL") {
                this.visitMethodCall(node);   
            }
            else if (node.nodeType == "SYSTEM_CALL") {
                this.visitSystemCall(node);   
            }
            else if (node.nodeType == "RETURN") {
                this.visitReturn(node);   
            }
            else if (node.nodeType == "ASSIGNMENT") {
                this.visitAssignment(node);
            }
            else if (node.nodeType == "EXIT") {
                this.visitExit(node);
            }
            else if (node.nodeType == "WHILE") {
                this.visitWhile(node);
            }
            else if (node.nodeType == "FOR") {
                this.visitFor(node);
            }
            else if (node.nodeType == "IF") {
                this.visitIf(node);   
            }
            else if (node.nodeType == "VAR_DEC") {
                this.visitVarDec(node);
            }
            else if (node.nodeType == "CONST_DEC") {
                this.visitConstDec(node);
            }
            else {
                throw new Error("Did not understand " + node.nodeType);
            }
        },
        
        visitMethodCall: function(node) {
            this.runMethod(node.name, node.parameters);
        },
        
        visitSystemCall: function(node) {
            var paramValues = this.executeParameters(node.parameters);
            
            if (node.name == "print") {
                alert(paramValues[0]);
            }
            else if (node.name == "input") {
                return prompt(paramValues[0]);
            }
            else {
                throw new Error("System method " + node.name + 
    							" does not exist");
            }
        },
        
        executeParameters: function(params) {
            var paramValues = [];
            
            for (var index = 0; index < params.length; index++) {
                paramValues[index] = this.executeExpression(params[index]);   
            }
            
            return paramValues;
        },
        
        visitReturn: function(node) {
            var value = this.executeExpression(node.expression);
            throw { type: "RETURN",
                    value: value };
        },
        
        visitAssignment: function(node) {
            var frame = activeProgram.getActiveFrame();
            var variable = frame.findVariable(node.variable.name, true);
            var value = this.executeExpression(node.expression);
            
            if (variable) {
                if (node.variable.index === undefined && 
                    variable.values === undefined) {
                    variable.value = value;
                }
                else {
                    variable.values[node.index] = value;
                }
            }
        },
        
        visitExit: function(node) {
            if (node.flowType == "for") {
                throw new { type:"EXIT_FOR" };
            }
            else if (node.flowType == "while") {
                throw new { type:"EXIT_WHILE" };
            }
            
            throw new Error("Expected flow type of for or while but found " +
                           node.flowType);
        },
        
        visitWhile: function(node) {
            var parentFrame = activeProgram.getActiveFrame();
            var condition = this.executeExpression(node.condition);
            
            while (condition) {
                var frame = this.createFrame(parentFrame, [], []);
                    
                activeProgram.frames.push(frame);
                
                try {
                    for (index = 0; index < node.body.length; index++) {
                        var bodyNode = node.body[index]; 
                    
                        this.visitNode(bodyNode);
                    }
                }
                catch (ex) {
                    activeProgram.frames.pop();
 
                    if (ex.type == "EXIT_WHILE") {
                        break;
                    }
                    
                    throw ex;
                }
                
                activeProgram.frames.pop();   
                
                condition = this.executeExpression(node.condition);
            }
        },
        
        visitFor: function(node) {
            var parentFrame = activeProgram.getActiveFrame();
            var lower = this.executeExpression(node.lower);
            var upper = this.executeExpression(node.upper);
            var step = this.executeExpression(node.step);
            
            for (var index = lower; index <= upper; index = index + step) {
                var frame = this.createFrame(parentFrame, [], []);
                
                var varIndex = new VariableInstance(node.variable.name, "FLOAT", index);
                frame.variables[node.variable.name] = varIndex;
                
                activeProgram.frames.push(frame);
                
                try {
                    for (var nodeIndex = 0; nodeIndex < node.body.length; nodeIndex++) {
                        var bodyNode = node.body[nodeIndex]; 
                    
                        this.visitNode(bodyNode);
                    }
                }
                catch (ex) {
                    activeProgram.frames.pop();   

                    if (ex.type == "EXIT_FOR") {
                        break;
                    }
                    
                    throw ex;
                }
                
                activeProgram.frames.pop();   
            }
        },
        
        visitIf: function(node) {
            var parentFrame = activeProgram.getActiveFrame();
            var comparison = this.executeExpression(node.condition);
            var index;
            var frame;
            var bodyNode;
            
            if (comparison) {
                frame = this.createFrame(parentFrame, [], []);               
                activeProgram.frames.push(frame);
                
                try {
                    for (index = 0; index < node.body.length; index++) {
                        bodyNode = node.body[index]; 
                    
                        this.visitNode(bodyNode);
                    }
                }
                catch (ex) {
                    activeProgram.frames.pop();

                    throw ex;
                }
                
                activeProgram.frames.pop(); 
            }
            else {
                frame = this.createFrame(parentFrame, [], []);               
                activeProgram.frames.push(frame);
                
                try {
                    for (index = 0; index < node.elseBody.length; index++) {
                        bodyNode = node.elseBody[index]; 
                    
                        this.visitNode(bodyNode);
                    }
                }
                catch (ex) {
                    activeProgram.frames.pop();

                    throw ex;
                }
                
                activeProgram.frames.pop();                 
            }
        },
        
        visitVarDec: function(node) {
            var frame = activeProgram.getActiveFrame();
            var variable = frame.findConstant(node.term.name);
            
            if (variable === undefined) {
                variable = frame.findVariable(node.term.name, false);
                
                if (variable === undefined) {                  
                    if (node.term.nodeType == "ARRAY_REF") {
                        variable = new ArrayInstance(node.term.name, 
                                node.term.length, node.type, []);
                    }
                    else if (node.term.nodeType == "VAR_REF") {
                        var value = this.executeExpression(node.expression);
                        variable = new VariableInstance(node.term.name,
                                node.type, value);
                    }
                    
                    frame.variables[node.term.name] = variable;
                }
                else {
                    throw new Error("The variable " + node.term.name + 
                        " is already defined as a constant.");   
                }
            }
            else {
                throw new Error("The variable " + node.term.name + 
                        " is already defined as a constant.");
            }           
        },
        
        visitConstDec: function(node) {
            var frame = activeProgram.getActiveFrame();
            var constant = frame.findConstant(node.term.name);
            
            if (constant === undefined) {
                var value = this.executeExpression(node.exepression);
            }
            else {
                throw new Error("The constant " + node.term.name + 
                        " is already defined.");
            }
        }
    };
  
  
    return result;
})();