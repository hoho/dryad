# dryad

A DSL to build JSON trees.


## An example

```json
tree1
    []
        "value"
        []
            (1 + 2)
            33
        CALL tree2 arg1=(Math.random()) arg2=({a: 9, b: 8})
            {}
                "books"
                    []
                        {}
                            "id"
                                1
                            "title"
                                "Hello"
                            "author"
                                "HelloHello"
                        {}
                            "id"
                                2
                            "title"
                                "World"
                            "author"
                                "WorldWorld"



tree2 $arg1 $arg2
    {}
        "key1"
            "value1"
        EACH $key $val ({aa: 111, bb: 222})
            $key
                ($val + $val)
        "key 2"
            .books.title
        .books[1].author[0]
            $arg2
        "key3"
            $arg2 .*
        $arg1
            (1 + 2 + 3)
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
            "a",
            "b"
        ],
        "0.12117888359352946": 6
    }
]
```
