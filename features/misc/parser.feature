Feature: payload parser 

Scenario: happy path
  Then JSON representation of the payload is {"a":1,"b":2}
  """
  { 
    "a": 1, 
    "b": 2 
  }
  """

Scenario: JSON5 support
  Given variable A is 123
  Then JSON representation of the payload is {"a":1,"b":2,"arrays":[123,"123"],"nested":{"a":1}}
  """
  { 
    a: 1, 
    b: 2,
    arrays: [
      ${A},
      "${A}",
    ],
    nested: {
      "a": 1,
    },
  }
  """
