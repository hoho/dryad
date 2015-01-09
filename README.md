# dryad

A DSL to build JSON trees.


## Example

```
tree1
    [] // Start an array.
        "value" // String value (first item of the array).
        [] // Array value (second item of the array).
            (1 + 2)  // JS expression in ().
            33 // Can skip () for the following JS expressions:
               //     - Single valid JS number
               //     - Single line JS path starting with variable name: $param.prop['key 9']
               //     - null
               //     - true
               //     - false
               //     - JS strings in double or single quotes.

        // Call tree2 function and pass two arguments and a context object (the
        // result is the third item of the array).
        CALL tree2 arg1=(Math.random()) arg2=({a: 9, b: 8})
            {}  // Start an object.
                "books"  // Key.
                    []  // Array value.
                        {}  // Object item.
                            "id"  // Key.
                                1  // Value.
                            "title"
                                "Hello"
                            "author"
                                "HelloHello"
                        {}
                            // A short way for (key, value) pairs.
                            "id": 2
                            "title": "World"
                            "author": "WorldWorld"

        CALL tree3 arg=true
        CALL tree3 arg=false


tree2 $arg1 $arg2
    {}
        "key1"
            "value1"
        EACH $key $val ({aa: 111, bb: 222})
            $key
                ($val + $val)
        "key 2"
            <.books.title> // JSPath expression over the context object.
        .books[1].author[0] // Can skip <> when JSPath expression starts with .
                            // and has no spaces on top level.
            $arg2
        "key3"
            WITH $arg2
                .* // JSPath expression over the $arg2 variable value.
        $arg1
            (1 + 2 + 3)
        EACH .books.id // Iterate over the context object properties.
            .[0]
                (Math.random())


tree3 $arg
    // Conditionals and automatic string concatenation.
    TEST $arg
        "Ololo"
    CHOOSE
        WHEN $arg
            "Alala"
        OTHERWISE
            "Ululu"
```

Compiling this template gives three JavaScript functions: `tree1`, `tree2` and
`tree3`.
Calling `tree1` function will produce the following JSON:

```json
[
    "value",
    [
        3,
        33
    ],
    {
        "key1": "value1",
        "aa": 222,
        "bb": 444,
        "key 2": [
            "Hello",
            "World"
        ],
        "WorldWorld": {
            "a": 9,
            "b": 8
        },
        "key3": [
            9,
            8
        ],
        "0.12117888359352946": 6,
        "1": 0.0637551280669868,
        "2": 0.2189847561530769
    },
    "OloloAlala",
    "Ululu"
]
```
