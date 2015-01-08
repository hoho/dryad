# dryad

A DSL to build JSON trees.


## An example

```
tree1
    [] // Start an array.
        "value" // String value (first array item).
        [] // Array value (second array item).
            (1 + 2)  // JS expression in ().
            33 // Can skip () for the following JS expressions:
               //     - Single valid JS number
               //     - JS path starting with variable name: $param.prop['key 9']
               //     - null
               //     - true
               //     - false
               //     - JS strings in double or single quotes.

        // Call tree2 function and pass two arguments and a context object.
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



tree2 $arg1 $arg2
    {}
        "key1"
            "value1"
        EACH $key $val ({aa: 111, bb: 222})
            $key
                ($val + $val)
        "key 2"
            <.books.title> // JSPath expression.
        .books[1].author[0] // Can skip <> when JSPath expression starts with .
                            // and has no spaces on top level.
            $arg2
        "key3"
            WITH $arg2
                .*
        $arg1
            (1 + 2 + 3)
        EACH .books.id // Iterate over context object properties.
            .[0]
                (Math.random())
```

Compiling this template gives two JavaScript functions: `tree1` and `tree2`.
Calling `tree1` function will produce the following JSON:

```json
[
    "value",
    3,
    33,
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
    }
]
```
