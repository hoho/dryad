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
                        {type: 'DryadArgumentDeclaration', name: '$arg1'}
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
                        {type: 'DryadArgumentDeclaration', name: '$arg1'},
                        {type: 'DryadArgumentDeclaration', name: '$arg2'},
                        {type: 'DryadArgumentDeclaration', name: '$arg3'}
                    ],
                    body: []
                },
                {
                    type: 'DryadFunction',
                    name: 'func4',
                    args: [
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg1',
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
                            name: '$arg1',
                            value: {type: 'expression', value: '111'}
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg2',
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
                            name: '$arg1'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg2',
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
                            name: '$arg1'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg2'
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg3',
                            value: {type: 'expression', value: '"some"'}
                        },
                        {
                            type: 'DryadArgumentDeclaration',
                            name: '$arg4',
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
            expect(getParsedCommand('null')).to.deep.equal(getExpectedValue('null'));
            expect(getParsedCommand('true')).to.deep.equal(getExpectedValue('true'));
            expect(getParsedCommand('false')).to.deep.equal(getExpectedValue('false'));
            expect(getParsedCommand('123')).to.deep.equal(getExpectedValue('123'));
            expect(getParsedCommand('.123')).to.deep.equal(getExpectedValue('.123'));
            expect(getParsedCommand('12e3')).to.deep.equal(getExpectedValue('12e3'));
            expect(getParsedCommand('0x123')).to.deep.equal(getExpectedValue('0x123'));
            expect(getParsedCommand('/\\(/gi')).to.deep.equal(getExpectedValue('/\\(/gi'));

            expect(function() { getParsedCommand('null aaa bbb'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'aaa bbb'");
            expect(function() { getParsedCommand('true false'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'false'");
            expect(function() { getParsedCommand('true\n  false'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('234\n  CALL aaa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse array literals', function() {
            expect(getParsedCommand('[]')).to.deep.equal(getExpectedValue('[]', 'array'));
            expect(getParsedCommand('[1, "2", [3]]')).to.deep.equal(getExpectedValue('[1, "2", [3]]', 'array'));
            expect(getParsedCommand("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]")).to.deep.equal(getExpectedValue("[/\\(/.exec('(')[0], a.b.c, {d: {e: '/*f*///'}}]", 'array'));
            expect(getParsedCommand('[]\n  CALL test')).to.deep.equal(getExpectedValue('[]', 'array', [getExpectedCall('test')]));

            expect(function() { getParsedCommand('[] false'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'false'");
            expect(function() { getParsedCommand('[] []'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '[]'");
            expect(function() { getParsedCommand('[]{}'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '{}'");
            expect(function() { getParsedCommand('[]aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'aa'");
            expect(function() { getParsedCommand('['); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('[]\n  $aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('[]\n  KEYVAL'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse object literals', function() {
            expect(getParsedCommand('{}')).to.deep.equal(getExpectedValue('{}', 'object'));
            expect(getParsedCommand('{a: 1, b: "2", c: [3]}')).to.deep.equal(getExpectedValue('{a: 1, b: "2", c: [3]}', 'object'));
            expect(getParsedCommand("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}")).to.deep.equal(getExpectedValue("{a: /\\(/.exec('(')[0], b: a.b.c, c: {d: {e: '/*f*///'}}}", 'object'));
            expect(getParsedCommand('{}\n  CALL test')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedCall('test')]));

            expect(function() { getParsedCommand('{} null'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'null'");
            expect(function() { getParsedCommand('{} {}'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '{}'");
            expect(function() { getParsedCommand('{}[]'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '[]'");
            expect(function() { getParsedCommand('{}aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'aa'");
            expect(function() { getParsedCommand('{'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('{}\n  $aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  ITEM'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse expressions in parenthesis', function() {
            expect(getParsedCommand('(1 + "2" + 3)')).to.deep.equal(getExpectedValue('(1 + "2" + 3)'));
            expect(getParsedCommand("(function() { return /\\(/.exec('(')[0]; })")).to.deep.equal(getExpectedValue("(function() { return /\\(/.exec('(')[0]; })"));

            expect(function() { getParsedCommand('(1 + "2" + 3) null'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'null'");
            expect(function() { getParsedCommand('(1 + "2" + 3) (4 + "5" + 6)'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '(4 + \"5\" + 6)'");
            expect(function() { getParsedCommand('(1 + "2" + 3)(4 + "5" + 6)'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '(4 + \"5\" + 6)'");
            expect(function() { getParsedCommand('(1 + "2" + 3)aa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'aa'");
            expect(function() { getParsedCommand('('); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('(1 + 2)\n  TEST true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse variable reference', function() {
            expect(getParsedCommand('$ololo')).to.deep.equal(getExpectedValue('$ololo', 'variable'));
            expect(getParsedCommand('$_')).to.deep.equal(getExpectedValue('$_', 'variable'));

            expect(function() { getParsedCommand('$var1 $var2'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '$var2'");
            expect(function() { getParsedCommand('$var1 hello'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'hello'");
            expect(function() { getParsedCommand('$var1\n  "hello"'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('$var\n  CALL aaa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse variable with member expression', function() {
            expect(getParsedCommand('$ololo.a.b["cc"].d[1]')).to.deep.equal(getExpectedVariableMemberValue('$ololo', '$ololo.a.b["cc"].d[1]'));
            expect(getParsedCommand('$ololo   \n    \n .a \n.b[\n"cc"\n  ]\n   .d[  1\n]')).to.deep.equal(getExpectedVariableMemberValue('$ololo', '$ololo   \n        \n     .a \n    .b[\n    "cc"\n      ]\n       .d[  1\n    ]'));
            expect(getParsedCommand('$ololo[12]')).to.deep.equal(getExpectedVariableMemberValue('$ololo', '$ololo[12]'));

            expect(function() { getParsedCommand('$var.'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '.'");
            expect(function() { getParsedCommand('$var['); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '['");
        });

        it('should parse JSPath expressions', function() {
            expect(getParsedCommand('< .books..name >')).to.deep.equal(getExpectedValue(' .books..name ', 'jspath'));
            expect(getParsedCommand('<^.automobiles{.maker === "Honda" && .year > 2009}.model>')).to.deep.equal(getExpectedValue('^.automobiles{.maker === "Honda" && .year > 2009}.model', 'jspath'));
            expect(getParsedCommand('<(.property1 | ."pro-per-ty2" | .*)>')).to.deep.equal(getExpectedValue('(.property1 | ."pro-per-ty2" | .*)', 'jspath'));
            expect(getParsedCommand('<.property1 | .property2.property2_1.property2_1_1>')).to.deep.equal(getExpectedValue('.property1 | .property2.property2_1.property2_1_1', 'jspath'));

            expect(getParsedCommand('<.books{.author.name === "Robert C. Martin"}.title>')).to.deep.equal(getExpectedValue('.books{.author.name === "Robert C. Martin"}.title', 'jspath'));
            expect(getParsedCommand('<.books{.price < 17}.title>')).to.deep.equal(getExpectedValue('.books{.price < 17}.title', 'jspath'));

            expect(getParsedCommand('<.books[0].title>')).to.deep.equal(getExpectedValue('.books[0].title', 'jspath'));
            expect(getParsedCommand('<.books.title[0]>')).to.deep.equal(getExpectedValue('.books.title[0]', 'jspath'));
            expect(getParsedCommand('< .books [ -1 ] .title>')).to.deep.equal(getExpectedValue(' .books [ -1 ] .title', 'jspath'));
            expect(getParsedCommand('<.books[:2].title>')).to.deep.equal(getExpectedValue('.books[:2].title', 'jspath'));
            expect(getParsedCommand('<.books[-2:].title>')).to.deep.equal(getExpectedValue('.books[-2:].title', 'jspath'));
            expect(getParsedCommand('<.books[ 1 : 3 ].title>')).to.deep.equal(getExpectedValue('.books[ 1 : 3 ].title', 'jspath'));
            expect(getParsedCommand('<.books{.price < 15} {.price > 5} [0].title>')).to.deep.equal(getExpectedValue('.books{.price < 15} {.price > 5} [0].title', 'jspath'));
            expect(getParsedCommand('<.books{.author.name === $author}.title>')).to.deep.equal(getExpectedValue('.books{.author.name === $author}.title', 'jspath'));

            expect(getParsedCommand('<.books{.id == "1"}>')).to.deep.equal(getExpectedValue('.books{.id == "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id === "1"}>')).to.deep.equal(getExpectedValue('.books{.id === "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id != "1"}>')).to.deep.equal(getExpectedValue('.books{.id != "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id !== "1"}>')).to.deep.equal(getExpectedValue('.books{.id !== "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id > "1"}>')).to.deep.equal(getExpectedValue('.books{.id > "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id >= "1"}>')).to.deep.equal(getExpectedValue('.books{.id >= "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id < "1"}>')).to.deep.equal(getExpectedValue('.books{.id < "1"}', 'jspath'));
            expect(getParsedCommand('<.books{.id <= "1"}>')).to.deep.equal(getExpectedValue('.books{.id <= "1"}', 'jspath'));

            expect(getParsedCommand('<.books{.title == "clean code"}>')).to.deep.equal(getExpectedValue('.books{.title == "clean code"}', 'jspath'));
            expect(getParsedCommand('<.books{.title ^== "Javascript"}>')).to.deep.equal(getExpectedValue('.books{.title ^== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title ^= "javascript"}>')).to.deep.equal(getExpectedValue('.books{.title ^= "javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title $== "Javascript"}>')).to.deep.equal(getExpectedValue('.books{.title $== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title $= "javascript"}>')).to.deep.equal(getExpectedValue('.books{.title $= "javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title *== "Javascript"}>')).to.deep.equal(getExpectedValue('.books{.title *== "Javascript"}', 'jspath'));
            expect(getParsedCommand('<.books{.title *= "javascript"}>')).to.deep.equal(getExpectedValue('.books{.title *= "javascript"}', 'jspath'));

            expect(getParsedCommand('<.books{.price > 19 && .author.name === "Robert C. Martin"}>')).to.deep.equal(getExpectedValue('.books{.price > 19 && .author.name === "Robert C. Martin"}', 'jspath'));
            expect(getParsedCommand('<.books{.title === "Maintainable JavaScript" || .title === "Clean Code"}>')).to.deep.equal(getExpectedValue('.books{.title === "Maintainable JavaScript" || .title === "Clean Code"}', 'jspath'));
            expect(getParsedCommand('<.books{!.title}>')).to.deep.equal(getExpectedValue('.books{!.title}', 'jspath'));

            expect(function() { getParsedCommand('<.books{'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{'");
            expect(function() { getParsedCommand('<'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('<.books{}>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{}>'");
            expect(function() { getParsedCommand('<.books>\n  "hello"'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('<.books>\n  CALL aaa'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse TEST command', function() {
            expect(getParsedCommand('TEST $ololo')).to.deep.equal(getExpectedTest('$ololo', 'variable'));
            expect(getParsedCommand('TEST <.a.b.c>\n TEST (false || true)')).to.deep.equal(getExpectedTest('.a.b.c', 'jspath', [getExpectedTest('(false || true)')]));
            expect(getParsedCommand('TEST <.a.b.c> /* Comment */ // Comment \n // Lalala\n  TEST /*Ololo*/ (false || true) // Haha')).to.deep.equal(getExpectedTest('.a.b.c', 'jspath', [getExpectedTest('(false || true)')]));

            expect(function() { getParsedCommand('TEST'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('TEST abc true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc true'");
            expect(function() { getParsedCommand('TEST <.books{}>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{}>'");
        });

        it('should parse СHOOSE command', function() {
            expect(getParsedCommand('CHOOSE')).to.deep.equal(getExpectedChoose());
            expect(getParsedCommand('CHOOSE\n  WHEN true\n    123\n  WHEN <.a{.b == .c}>\n    <.a>\n  OTHERWISE\n    "aaa"')).to.deep.equal(getExpectedChoose([
                getChooseCondition('true', 'expression', [getExpectedValue('123')]),
                getChooseCondition('.a{.b == .c}', 'jspath', [getExpectedValue('.a', 'jspath')]),
                getChooseCondition(null, null, [getExpectedValue('"aaa"')])
            ]));
            expect(getParsedCommand('CHOOSE\n  OTHERWISE')).to.deep.equal(getExpectedChoose([
                getChooseCondition()
            ]));
            expect(getParsedCommand('CHOOSE\n  WHEN (1 + 2)')).to.deep.equal(getExpectedChoose([
                getChooseCondition('(1 + 2)')
            ]));

            expect(function() { getParsedCommand('CHOOSE /* Comment */ abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc'");
            expect(function() { getParsedCommand('WHEN'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('WHEN (1 +'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '(1 +'");
            expect(function() { getParsedCommand('WHEN /* Comment */ abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc'");
            expect(function() { getParsedCommand('WHEN true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('OTHERWISE /* Comment */ abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc'");
            expect(function() { getParsedCommand('OTHERWISE'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('CHOOSE\n  CALL test'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('CHOOSE\n  SET $a 1'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('CHOOSE\n  TEST true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('CHOOSE\n  ITEM'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse SET command', function() {
            expect(getParsedCommand('SET $tmp')).to.deep.equal(getExpectedSet('$tmp'));
            expect(getParsedCommand('SET $tmp 123')).to.deep.equal(getExpectedSet('$tmp', getExpectedValue('123').command));
            expect(getParsedCommand('SET $tmp\n  123')).to.deep.equal(getExpectedSet('$tmp', undefined, [getExpectedValue('123')]));

            expect(function() { getParsedCommand('SET'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('SET 234'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '234'");
            expect(function() { getParsedCommand('SET alala'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'alala'");
            expect(function() { getParsedCommand('SET $a <>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<>'");
            expect(function() { getParsedCommand('SET $tmp null 123'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '123'");
        });

        it('should parse CALL command', function() {
            expect(getParsedCommand('CALL a-b-c')).to.deep.equal(getExpectedCall('a-b-c'));
            expect(getParsedCommand('CALL a-b-c AS $tmp')).to.deep.equal(getExpectedCall('a-b-c', [], [], '$tmp'));
            expect(getParsedCommand('CALL a-b-c 1 true null $v (1 + 2)')).to.deep.equal(getExpectedCall(
                'a-b-c',
                [
                    getExpectedValue('1').command,
                    getExpectedValue('true').command,
                    getExpectedValue('null').command,
                    getExpectedValue('$v', 'variable').command,
                    getExpectedValue('(1 + 2)').command
                ]
            ));
            expect(getParsedCommand('CALL a-b-c arg1=1 arg2=true arg3=$v')).to.deep.equal(getExpectedCall(
                'a-b-c',
                [],
                [
                    {name: '$arg1', value: getExpectedValue('1').command},
                    {name: '$arg2', value: getExpectedValue('true').command},
                    {name: '$arg3', value: getExpectedValue('$v', 'variable').command}
                ]
            ));
            expect(getParsedCommand('CALL (1 + 2) 1 $v arg1=11 arg2=true AS $tmp')).to.deep.equal(getExpectedCall(
                getExpectedValue('(1 + 2)').command,
                [
                    getExpectedValue('1').command,
                    getExpectedValue('$v', 'variable').command
                ],
                [
                    {name: '$arg1', value: getExpectedValue('11').command},
                    {name: '$arg2', value: getExpectedValue('true').command}
                ],
                '$tmp'
            ));
            expect(getParsedCommand('CALL AS $p1')).to.deep.equal(getExpectedCall('AS', [getExpectedValue('$p1', 'variable').command]));
            expect(getParsedCommand('CALL AS $p1 AS $p2')).to.deep.equal(getExpectedCall('AS', [getExpectedValue('$p1', 'variable').command], [], '$p2'));

            expect(function() { getParsedCommand('CALL <>') }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<>'");
            expect(function() { getParsedCommand('CALL $a=1 $b=2 $c') }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '=1 $b=2 $c'");
            expect(function() { getParsedCommand('CALL $a $b=2 $c') }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '=2 $c'");
            expect(function() { getParsedCommand('CALL $a $b $c=<') }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '=<'");
            expect(function() { getParsedCommand('CALL $a $b c=(1') }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '(1'");
            expect(function() { getParsedCommand('CALL aa AS $p1 $p2') }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '$p2'");
            expect(function() { getParsedCommand('CALL aa AS') }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
        });

        it('should parse EACH command', function() {
            expect(getParsedCommand('EACH $key $value [1, 2]')).to.deep.equal(getExpectedEach('$key', '$value', getExpectedValue('[1, 2]', 'array').command));
            expect(getParsedCommand('EACH $val ([])\n  $val')).to.deep.equal(getExpectedEach(undefined, '$val', getExpectedValue('([])', 'array').command, [getExpectedValue('$val', 'variable')]));
            expect(getParsedCommand('EACH $src')).to.deep.equal(getExpectedEach(undefined, undefined, getExpectedValue('$src', 'variable').command));

            expect(function() { getParsedCommand('EACH'); }).to.throw(dryad.SyntaxError, 'SyntaxError: Incomplete command');
            expect(function() { getParsedCommand('EACH abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc'");
            expect(function() { getParsedCommand('EACH $a $b $c cde'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'cde'");
            expect(function() { getParsedCommand('EACH $a cde $b'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'cde $b'");
        });

        it('should parse WITH command', function() {
            expect(getParsedCommand('WITH $ololo')).to.deep.equal(getExpectedWith('$ololo', 'variable'));
            expect(getParsedCommand('WITH <.a.b.c>\n WITH (false || true)')).to.deep.equal(getExpectedWith('.a.b.c', 'jspath', [getExpectedWith('(false || true)')]));
            expect(getParsedCommand('WITH <.a.b.c> /* Comment */ // Comment \n // Lalala\n  WITH /*Ololo*/ (false || true) // Haha')).to.deep.equal(getExpectedWith('.a.b.c', 'jspath', [getExpectedWith('(false || true)')]));

            expect(function() { getParsedCommand('WITH'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incomplete command");
            expect(function() { getParsedCommand('WITH abc true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc true'");
            expect(function() { getParsedCommand('WITH <.books{}>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<.books{}>'");
        });

        it('should parse ITEM command', function() {
            expect(getParsedCommand('[]\n  ITEM 123')).to.deep.equal(getExpectedValue('[]', 'array', [getExpectedItem(getExpectedValue('123').command)]));
            expect(getParsedCommand('[]\n  ITEM\n    234\n    345')).to.deep.equal(getExpectedValue('[]', 'array', [getExpectedItem([getExpectedValue('234'), getExpectedValue('345')])]));
            expect(getParsedCommand('[]\n  TEST true\n    ITEM 456')).to.deep.equal(getExpectedValue('[]', 'array', [getExpectedTest('true', undefined, [getExpectedItem(getExpectedValue('456').command)])]));
            expect(getParsedCommand('ITEM 456')).to.deep.equal(getExpectedItem(getExpectedValue('456').command));
            expect(getParsedCommand('CALL test\n  ITEM 789')).to.deep.equal(getExpectedCall('test', [], [], undefined, [getExpectedItem(getExpectedValue('789').command)]));

            expect(function() { getParsedCommand('[]\n  ITEM <>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<>'");
            expect(function() { getParsedCommand('[]\n  ITEM 567 678'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '678'");
            expect(function() { getParsedCommand('ITEM 456\n  ITEM true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  ITEM true'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });

        it('should parse KEYVAL command', function() {
            expect(getParsedCommand('{}\n  KEYVAL "key" "val"')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedPair({key: getExpectedValue('"key"').command, value: getExpectedValue('"val"').command})]));
            expect(getParsedCommand('{}\n  KEYVAL\n    KEY "key"\n    VAL "val"')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedPair(null, [getExpectedPairKey(getExpectedValue('"key"').command), getExpectedPairValue(getExpectedValue('"val"').command)])]));
            expect(getParsedCommand('{}\n  KEYVAL "key"\n    VAL "val"')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedPair({key:  getExpectedValue('"key"').command}, [getExpectedPairValue(getExpectedValue('"val"').command)])]));
            expect(getParsedCommand('{}\n  KEYVAL\n    KEY\n      "key"\n    VAL\n      "val"')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedPair(null, [getExpectedPairKey([getExpectedValue('"key"')]), getExpectedPairValue([getExpectedValue('"val"')])])]));
            expect(getParsedCommand('{}\n  TEST true\n    KEYVAL "key" "val"')).to.deep.equal(getExpectedValue('{}', 'object', [getExpectedTest('true', undefined, [getExpectedPair({key: getExpectedValue('"key"').command, value: getExpectedValue('"val"').command})])]));
            expect(getParsedCommand('KEYVAL "key" "val"')).to.deep.equal(getExpectedPair({key: getExpectedValue('"key"').command, value: getExpectedValue('"val"').command}));
            expect(getParsedCommand('CALL test\n  KEYVAL "key" "val"')).to.deep.equal(getExpectedCall('test', [], [], undefined, [getExpectedPair({key: getExpectedValue('"key"').command, value: getExpectedValue('"val"').command})]));

            expect(function() { getParsedCommand('{}\n  KEYVAL <>'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '<>'");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123 ()'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '()'");
            expect(function() { getParsedCommand('{}\n  KEYVAL abc'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input 'abc'");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123 234 345'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '345'");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123 234 345'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '345'");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123 234\n    KEY 345'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123 234\n    VAL 345'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL 123\n    KEY 345'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    KEY ()'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '()'");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    KEY 123 234'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '234'");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    KEY "aa"\n      "bb"'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    VAL ()'); }).to.throw(dryad.SyntaxError, "SyntaxError: Malformed expression '()'");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    VAL 123 234'); }).to.throw(dryad.SyntaxError, "SyntaxError: Incorrect input '234'");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    VAL "aa"\n      "bb"'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    KEY\n    KEY'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('{}\n  KEYVAL\n    VAL\n    VAL'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('KEY'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('VAL'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('KEYVAL\n  KEYVAL'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('KEYVAL\n  KEY\n    KEY'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('KEYVAL\n  VAL\n    VAL'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
            expect(function() { getParsedCommand('KEYVAL\n  TEST true\n'); }).to.throw(dryad.SyntaxError, "SyntaxError: Unexpected command");
        });


        function getExpectedValue(expr, type, children) {
            return {
                command: {
                    type: 'value',
                    value: {type: type || 'expression', value: expr}
                },
                children: children || []
            };
        }

        function getExpectedVariableMemberValue(variable, expr) {
            var ret = getExpectedValue(expr, 'variableMember');
            ret.command.value.variable =  variable;
            return ret;
        }

        function getExpectedTest(conditionExpr, conditionType, children) {
            return {
                command: {
                    type: 'test',
                    condition: getExpectedValue(conditionExpr, conditionType).command
                },
                children: children || []
            }
        }

        function getExpectedChoose(children) {
            return {
                command: {
                    type: 'choose'
                },
                children: children || []
            }
        }

        function getChooseCondition(conditionExpr, conditionType, children) {
            var ret = {children: children || []};

            ret.command = conditionExpr ?
                {type: 'when', condition: getExpectedValue(conditionExpr, conditionType).command}
                :
                {type: 'otherwise'};

            return ret;
        }

        function getExpectedSet(name, value, children) {
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

        function getExpectedCall(name, args, kwargs, asvar, children) {
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

        function getExpectedEach(key, value, source, children) {
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

        function getExpectedWith(conditionExpr, conditionType, children) {
            return {
                command: {
                    type: 'with',
                    context: getExpectedValue(conditionExpr, conditionType).command
                },
                children: children || []
            }
        }

        function getExpectedItem(item) {
            var ret = {
                command: {
                    type: 'item'
                },
                children: []
            };
            if (item instanceof Array) {
                ret.children = item;
            } else {
                ret.command.value = item;
            }
            return ret;
        }

        function getExpectedPair(pair, children) {
            var ret = {
                command: {
                    type: 'kv'
                },
                children: children || []
            };
            if (pair) {
                if (pair.key) {
                    ret.command.key = pair.key;
                }
                if (pair.value) {
                    ret.command.value = pair.value;
                }
            }
            return ret;
        }

        function getExpectedPairKey(key) {
            var ret = {
                command: {
                    type: 'kvkey'
                },
                children: []
            };
            if (key instanceof Array) {
                ret.children = key;
            } else {
                ret.command.key = key;
            }
            return ret;
        }

        function getExpectedPairValue(value) {
            var ret = {
                command: {
                    type: 'kvval'
                },
                children: []
            };
            if (value instanceof Array) {
                ret.children = value;
            } else {
                ret.command.value = value;
            }
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