# dryad

A DSL to build JSON trees.


## Example

```
make-object
    {}
        KEYVAL ("key" + 2) "value"
        CALL keyvals prefix="test" items={key3: "val3", key4: "val4"}

keyvals $prefix $items
    EACH $key $val $items
        KEYVAL ($prefix + $key) ($val + Math.random())
    SET $tmp
        CALL array
    KEYVAL $tmp[1] $tmp

array
    []
        ITEM 111
        ITEM 222
        ITEM 333
```

Calling `make-object` function will produce the following JSON:

```json
{
    "key2": "value",
    "testkey3": "val3|0.0637551280669868",
    "testkey4": "val4|0.2189847561530769",
    "222": [111, 222, 333]
}
```

## Syntax

Pending.
