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
            expect(getParsedCommand('null')).to.deep.equal(getExpectedResult('null'));
            expect(getParsedCommand('true')).to.deep.equal(getExpectedResult('true'));
            expect(getParsedCommand('false')).to.deep.equal(getExpectedResult('false'));
            expect(getParsedCommand('123')).to.deep.equal(getExpectedResult('123'));
            expect(getParsedCommand('.123')).to.deep.equal(getExpectedResult('.123'));
            expect(getParsedCommand('12e3')).to.deep.equal(getExpectedResult('12e3'));
            expect(getParsedCommand('0x123')).to.deep.equal(getExpectedResult('0x123'));
            expect(getParsedCommand('/\\(/gi')).to.deep.equal(getExpectedResult('/\\(/gi'));
        });

        it('should parse array literals', function() {
            expect(getParsedCommand('[]')).to.deep.equal(getExpectedResult('[]', 'array'));
            expect(getParsedCommand('[1, "2", [3]]')).to.deep.equal(getExpectedResult('[1, "2", [3]]', 'array'));
            expect(getParsedCommand("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]")).to.deep.equal(getExpectedResult("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]", 'array'));
        });

        it('should parse object literals', function() {
            expect(getParsedCommand('{}')).to.deep.equal(getExpectedResult('{}', 'object'));
            expect(getParsedCommand('{a: 1, b: "2", c: [3]}')).to.deep.equal(getExpectedResult('{a: 1, b: "2", c: [3]}', 'object'));
            expect(getParsedCommand("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}")).to.deep.equal(getExpectedResult("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}", 'object'));
        });

        it('should parse expressions in parenthesis', function() {
            expect(getParsedCommand('(1 + "2" + 3)')).to.deep.equal(getExpectedResult('(1 + "2" + 3)'));
            expect(getParsedCommand("(function() { return /\\(/.exec('(')[0]; })")).to.deep.equal(getExpectedResult("(function() { return /\\(/.exec('(')[0]; })"));
        });

        it('should parse variable reference', function() {
            expect(getParsedCommand('$ololo')).to.deep.equal(getExpectedResult('$ololo', 'variable'));
            expect(getParsedCommand('$_')).to.deep.equal(getExpectedResult('$_', 'variable'));
        });

        function getExpectedResult(expr, type) {
            return {
                command: {
                    type: 'value',
                    value: {type: type || 'expression', value: expr}
                },
                children: []
            };
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

function getParsedCommand(line) {
    var ret = dryad.parser.parse('func\n    ' + line);
    stripLocations(ret);
    return ret[0].body[0];
}