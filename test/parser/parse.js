const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.normalize(path.join(path.dirname(__filename), '..', '..'));
const dryad = require(path.join(ROOT_DIR, 'index.js'));


describe('Parser', function() {
    describe('Function', function() {
        it('should parse multiple functions', function () {
            var parsed = dryad.parser.parse(getTestFileContents('function.dryad'));
            stripLocations(parsed);
            expect(parsed).to.deep.equal([
                {
                    type: 'DryadFunction',
                    name: 'func1',
                    args: [],
                    body: [
                        {
                            command: {
                                type: 'value',
                                value: {type: 'expression', value: '123'}
                            },
                            children: []
                        }
                    ]
                },
                {
                    type: 'DryadFunction',
                    name: 'func2',
                    args: [
                        {type: 'DryadArgumentDeclaration', name: 'arg1'}
                    ],
                    body: [
                        {
                            command: {
                                type: 'value',
                                value: {type: 'expression', value: '"hello"'}
                            },
                            children: []
                        }
                    ]
                },
                {
                    type: 'DryadFunction',
                    name: 'func3',
                    args: [
                        {type: 'DryadArgumentDeclaration', name: 'arg1'},
                        {type: 'DryadArgumentDeclaration', name: 'arg2'},
                        {type: 'DryadArgumentDeclaration', name: 'arg3'}
                    ],
                    body: []
                },
                {
                    type: 'DryadFunction',
                    name: 'func4',
                    args: [
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg1',
                            value: {type: 'expression', value: '(\'default\')'}
                        }
                    ],
                    body: [
                        {
                            command: {
                                type: 'value',
                                value: {type: 'expression', value: '(\'world\')'}
                            },
                            children: []
                        }
                    ]
                },
                {
                    type: 'DryadFunction',
                    name: 'func5',
                    args: [
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg1',
                            value: {type: 'expression', value: '111'}
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg2',
                            value: {type: 'expression', value: 'true'}
                        }
                    ],
                    body: []
                },
                {
                    type: 'DryadFunction',
                    name: 'func6',
                    args: [
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg1'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg2',
                            value: {type: 'expression', value: '(1 + 2)'}
                        }
                    ],
                    body: [
                        {
                            command: {
                                type: 'value',
                                value: {type: 'expression', value: '"!!"'}
                            },
                            children: []
                        },
                        {
                            command: {
                                type: 'value',
                                value: {type: 'expression', value: '"??"'}
                            },
                            children: []
                        }
                    ]
                },
                {
                    type: 'DryadFunction',
                    name: 'func7',
                    args: [
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg1'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg2'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg3',
                            value: {type: 'expression', value: '"some"'}
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: 'arg4',
                            value: {type: 'expression', value: '\'value\''}
                        }
                    ],
                    body: []
                }
            ]);
        });

        it('should parse multiple functions surrounded by comments', function () {
            var parsed = dryad.parser.parse(getTestFileContents('function.dryad'));
            var parsed2 = dryad.parser.parse(getTestFileContents('function2.dryad'));
            stripLocations(parsed);
            stripLocations(parsed2);
            expect(parsed2).to.deep.equal(parsed);
        });
    });

    describe('Value command', function() {
        it('should parse JavaScript literals', function() {
            expect(getParsedCommand('null')).to.deep.equal(getExpectedValueResult('null'));
            expect(getParsedCommand('true')).to.deep.equal(getExpectedValueResult('true'));
            expect(getParsedCommand('false')).to.deep.equal(getExpectedValueResult('false'));
            expect(getParsedCommand('123')).to.deep.equal(getExpectedValueResult('123'));
            expect(getParsedCommand('.123')).to.deep.equal(getExpectedValueResult('.123'));
            expect(getParsedCommand('12e3')).to.deep.equal(getExpectedValueResult('12e3'));
            expect(getParsedCommand('0x123')).to.deep.equal(getExpectedValueResult('0x123'));
            expect(getParsedCommand('/\\(/gi')).to.deep.equal(getExpectedValueResult('/\\(/gi'));
            expect(function() { getParsedCommand('null aaa bbb'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'aaa bbb'");
            expect(function() { getParsedCommand('true false'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'false'");
        });

        it('should parse array literals', function() {
            expect(getParsedCommand('[]')).to.deep.equal(getExpectedValueResult('[]', 'array'));
            expect(getParsedCommand('[1, "2", [3]]')).to.deep.equal(getExpectedValueResult('[1, "2", [3]]', 'array'));
            expect(getParsedCommand("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]")).to.deep.equal(getExpectedValueResult("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]", 'array'));
            expect(function() { getParsedCommand('[] false'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'false'");
            expect(function() { getParsedCommand('[] []'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '[]'");
            expect(function() { getParsedCommand('[]{}'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '{}'");
            expect(function() { getParsedCommand('[]aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'aa'");
            expect(function() { getParsedCommand('['); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
        });

        it('should parse object literals', function() {
            expect(getParsedCommand('{}')).to.deep.equal(getExpectedValueResult('{}', 'object'));
            expect(getParsedCommand('{a: 1, b: "2", c: [3]}')).to.deep.equal(getExpectedValueResult('{a: 1, b: "2", c: [3]}', 'object'));
            expect(getParsedCommand("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}")).to.deep.equal(getExpectedValueResult("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}", 'object'));
            expect(function() { getParsedCommand('{} null'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'null'");
            expect(function() { getParsedCommand('{} {}'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '{}'");
            expect(function() { getParsedCommand('{}[]'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '[]'");
            expect(function() { getParsedCommand('{}aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'aa'");
            expect(function() { getParsedCommand('{'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
        });

        it('should parse expressions in parenthesis', function() {
            expect(getParsedCommand('(1 + "2" + 3)')).to.deep.equal(getExpectedValueResult('(1 + "2" + 3)'));
            expect(getParsedCommand("(function() { return /\\(/.exec('(')[0]; })")).to.deep.equal(getExpectedValueResult("(function() { return /\\(/.exec('(')[0]; })"));
            expect(function() { getParsedCommand('(1 + "2" + 3) null'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'null'");
            expect(function() { getParsedCommand('(1 + "2" + 3) (4 + "5" + 6)'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '(4 + \"5\" + 6)'");
            expect(function() { getParsedCommand('(1 + "2" + 3)(4 + "5" + 6)'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '(4 + \"5\" + 6)'");
            expect(function() { getParsedCommand('(1 + "2" + 3)aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'aa'");
            expect(function() { getParsedCommand('('); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
        });

        it('should parse variable reference', function() {
            expect(getParsedCommand('$ololo')).to.deep.equal(getExpectedValueResult('$ololo', 'variable'));
            expect(getParsedCommand('$_')).to.deep.equal(getExpectedValueResult('$_', 'variable'));
            expect(function() { getParsedCommand('$var1 $var2'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input '$var2'");
            expect(function() { getParsedCommand('$var1 hello'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'hello'");
        });

        it('should parse JSPath expressions', function() {
            expect(getParsedCommand('< .books..name >')).to.deep.equal(getExpectedValueResult(' .books..name ', 'jspath'));
            expect(getParsedCommand('<^.automobiles{.maker === "Honda" && .year > 2009}.model>')).to.deep.equal(getExpectedValueResult('^.automobiles{.maker === "Honda" && .year > 2009}.model', 'jspath'));
            expect(getParsedCommand('<(.property1 | ."pro-per-ty2" | .*)>')).to.deep.equal(getExpectedValueResult('(.property1 | ."pro-per-ty2" | .*)', 'jspath'));
            expect(getParsedCommand('<.property1 | .property2.property2_1.property2_1_1>')).to.deep.equal(getExpectedValueResult('.property1 | .property2.property2_1.property2_1_1', 'jspath'));

            expect(getParsedCommand('<.books{.author.name === "Robert C. Martin"}.title>')).to.deep.equal(getExpectedValueResult('.books{.author.name === "Robert C. Martin"}.title', 'jspath'));
            expect(getParsedCommand('<.books{.price < 17}.title>')).to.deep.equal(getExpectedValueResult('.books{.price < 17}.title', 'jspath'));

            expect(getParsedCommand('<.books[0].title>')).to.deep.equal(getExpectedValueResult('.books[0].title', 'jspath'));
            expect(getParsedCommand('<.books.title[0]>')).to.deep.equal(getExpectedValueResult('.books.title[0]', 'jspath'));
            expect(getParsedCommand('< .books [ -1 ] .title>')).to.deep.equal(getExpectedValueResult(' .books [ -1 ] .title', 'jspath'));
            expect(getParsedCommand('<.books[:2].title>')).to.deep.equal(getExpectedValueResult('.books[:2].title', 'jspath'));
            expect(getParsedCommand('<.books[-2:].title>')).to.deep.equal(getExpectedValueResult('.books[-2:].title', 'jspath'));
            expect(getParsedCommand('<.books[ 1 : 3 ].title>')).to.deep.equal(getExpectedValueResult('.books[ 1 : 3 ].title', 'jspath'));
            expect(getParsedCommand('<.books{.price < 15} {.price > 5} [0].title>')).to.deep.equal(getExpectedValueResult('.books{.price < 15} {.price > 5} [0].title', 'jspath'));
            expect(getParsedCommand('<.books{.author.name === $author}.title>')).to.deep.equal(getExpectedValueResult('.books{.author.name === $author}.title', 'jspath'));

            expect(getParsedCommand('<.books{.id == "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id == "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id === "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id === "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id != "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id != "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id !== "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id !== "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id > "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id > "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id >= "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id >= "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id < "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id < "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id <= "1"}>')).to.deep.equal(getExpectedValueResult('.books{.id <= "1"}', 'jspath'));

            expect(getParsedCommand('<.books{.title == "clean code"}>')).to.deep.equal(getExpectedValueResult('.books{.title == "clean code"}', 'jspath'));
            expect(getParsedCommand('<.books{.title ^== "Javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title ^== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title ^= "javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title ^= "javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title $== "Javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title $== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title $= "javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title $= "javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title *== "Javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title *== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title *= "javascript"}>')).to.deep.equal(getExpectedValueResult('.books{.title *= "javascript"}', 'jspath'));

            expect(getParsedCommand('<.books{.price > 19 && .author.name === "Robert C. Martin"}>')).to.deep.equal(getExpectedValueResult('.books{.price > 19 && .author.name === "Robert C. Martin"}', 'jspath'));
            expect(getParsedCommand('<.books{.title === "Maintainable JavaScript" || .title === "Clean Code"}>')).to.deep.equal(getExpectedValueResult('.books{.title === "Maintainable JavaScript" || .title === "Clean Code"}', 'jspath'));
            expect(getParsedCommand('<.books{!.title}>')).to.deep.equal(getExpectedValueResult('.books{!.title}', 'jspath'));

            expect(function() { getParsedCommand('<.books{'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{'");
            expect(function() { getParsedCommand('<'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('<.books{}>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{}>'");
        });

        it('should parse TEST command', function() {
            expect(getParsedCommand('TEST $ololo')).to.deep.equal(getExpectedTestResult('$ololo', 'variable'));
            expect(getParsedCommand('TEST <.a.b.c>\n TEST (false || true)')).to.deep.equal(getExpectedTestResult('.a.b.c', 'jspath', [getExpectedTestResult('(false || true)')]));
            expect(getParsedCommand('TEST <.a.b.c> /* Comment */ // Comment \n // Lalala\n  TEST /*Ololo*/ (false || true) // Haha')).to.deep.equal(getExpectedTestResult('.a.b.c', 'jspath', [getExpectedTestResult('(false || true)')]));
        });

        it('should parse СHOOSE command', function() {
            expect(getParsedCommand('CHOOSE')).to.deep.equal(getExpectedChooseResult());
            expect(getParsedCommand('CHOOSE\n  WHEN true\n    123\n  WHEN <.a{.b == .c}>\n    <.a>\n  OTHERWISE\n    "aaa"')).to.deep.equal(getExpectedChooseResult([
                getChooseConditionResult('true', 'expression', [getExpectedValueResult('123')]),
                getChooseConditionResult('.a{.b == .c}', 'jspath', [getExpectedValueResult('.a', 'jspath')]),
                getChooseConditionResult(null, null, [getExpectedValueResult('"aaa"')])
            ]));
            expect(getParsedCommand('CHOOSE\n  OTHERWISE')).to.deep.equal(getExpectedChooseResult([
                getChooseConditionResult()
            ]));
            expect(getParsedCommand('CHOOSE\n  WHEN (1 + 2)')).to.deep.equal(getExpectedChooseResult([
                getChooseConditionResult('(1 + 2)')
            ]));
        });

        it('should parse SET command', function() {
            expect(getParsedCommand('SET $tmp')).to.deep.equal(getExpectedSetResult('$tmp'));
            expect(getParsedCommand('SET $tmp 123')).to.deep.equal(getExpectedSetResult('$tmp', getExpectedValueResult('123').command));
            expect(getParsedCommand('SET $tmp\n  123')).to.deep.equal(getExpectedSetResult('$tmp', undefined, [getExpectedValueResult('123')]));
        });

        it('should parse CALL command', function() {
            expect(getParsedCommand('CALL a-b-c')).to.deep.equal(getExpectedCallResult('a-b-c'));
            expect(getParsedCommand('CALL a-b-c AS $tmp')).to.deep.equal(getExpectedCallResult('a-b-c', [], [], '$tmp'));
            expect(getParsedCommand('CALL a-b-c 1 true null $v (1 + 2)')).to.deep.equal(getExpectedCallResult(
                'a-b-c',
                [
                    getExpectedValueResult('1').command,
                    getExpectedValueResult('true').command,
                    getExpectedValueResult('null').command,
                    getExpectedValueResult('$v', 'variable').command,
                    getExpectedValueResult('(1 + 2)').command
                ]
            ));
            expect(getParsedCommand('CALL a-b-c arg1=1 arg2=true arg3=$v')).to.deep.equal(getExpectedCallResult(
                'a-b-c',
                [],
                [
                    {name: 'arg1', value: getExpectedValueResult('1').command},
                    {name: 'arg2', value: getExpectedValueResult('true').command},
                    {name: 'arg3', value: getExpectedValueResult('$v', 'variable').command}
                ]
            ));
            expect(getParsedCommand('CALL (1 + 2) 1 $v arg1=11 arg2=true AS $tmp')).to.deep.equal(getExpectedCallResult(
                getExpectedValueResult('(1 + 2)').command,
                [
                    getExpectedValueResult('1').command,
                    getExpectedValueResult('$v', 'variable').command
                ],
                [
                    {name: 'arg1', value: getExpectedValueResult('11').command},
                    {name: 'arg2', value: getExpectedValueResult('true').command}
                ],
                '$tmp'
            ));
        });

        it('should parse EACH command', function() {
            expect(getParsedCommand('EACH $key $value [1, 2]')).to.deep.equal(getExpectedEachResult('$key', '$value', getExpectedValueResult('[1, 2]', 'array').command));
            expect(getParsedCommand('EACH $val ([])\n  $val')).to.deep.equal(getExpectedEachResult(undefined, '$val', getExpectedValueResult('([])', 'array').command, [getExpectedValueResult('$val', 'variable')]));
            expect(getParsedCommand('EACH $src')).to.deep.equal(getExpectedEachResult(undefined, undefined, getExpectedValueResult('$src', 'variable').command));
            expect(function() { getParsedCommand('EACH'); }).to.throw(dryad.SyntaxError, 'SyntaxError: Incomplete command');
            expect(function() { getParsedCommand('EACH abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'abc'");
            expect(function() { getParsedCommand('EACH $a $b $c cde'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'cde'");
            expect(function() { getParsedCommand('EACH $a cde $b'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected input 'cde $b'");
        });


        function getExpectedValueResult(expr, type) {
            return {
                command: {
                    type: 'value',
                    value: {type: type || 'expression', value: expr}
                },
                children: []
            };
        }

        function getExpectedTestResult(conditionExpr, conditionType, children) {
            return {
                command: {
                    type: 'test',
                    condition: getExpectedValueResult(conditionExpr, conditionType).command
                },
                children: children || []
            }
        }

        function getExpectedChooseResult(children) {
            return {
                command: {
                    type: 'choose'
                },
                children: children || []
            }
        }

        function getChooseConditionResult(conditionExpr, conditionType, children) {
            var ret = {children: children || []};

            ret.command = conditionExpr ?
                {type: 'when', condition: getExpectedValueResult(conditionExpr, conditionType).command}
                :
                {type: 'otherwise'};

            return ret;
        }

        function getExpectedSetResult(name, value, children) {
            var ret = {
                command: {
                    type: 'set',
                    name: name
                },
                children: children || []
            };
            if (value) {
                ret.command.value = value;
            }
            return ret;
        }

        function getExpectedCallResult(name, args, kwargs, asvar, children) {
            var ret = {
                command: {
                    type: 'call',
                    name: name,
                    args: args || [],
                    kwargs: kwargs || []
                },
                children: children || []
            };
            if (asvar) {
                ret.command.asvar = asvar;
            }
            return ret;
        }

        function getExpectedEachResult(key, value, source, children) {
            var ret = {
                command: {
                    type: 'each',
                    source: source
                },
                children: children || []
            };
            if (key) { ret.command.key = key; }
            if (value) { ret.command.value = value; }
            return ret;
        }
    });
});


function getTestFileContents(filename) {
    return fs.readFileSync(path.join(ROOT_DIR, 'test', 'parser', filename), {encoding: 'utf8'});
}

function stripLocations(parsed) {
    if (typeof parsed === 'object') {
        Object.keys(parsed).forEach(function(key) {
            if (key === 'location') {
                delete parsed[key];
            } else {
                stripLocations(parsed[key]);
            }
        });
    }
}

function getParsedCommand(code) {
    code = code.split('\n').map(function(line) { return '    ' + line; }).join('\n');
    var ret = dryad.parser.parse('func\n' + code);
    stripLocations(ret);
    return ret[0].body[0];
}