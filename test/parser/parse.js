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
