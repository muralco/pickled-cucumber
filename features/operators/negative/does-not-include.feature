Feature: compare JSON does not include X

Scenario: { "a": 1 } does not include {}
  Given A is { "a": 1 }
  When asserting that A does not include {}
  Then the assertion fails with {"a":1} does include {}

Scenario: { "a": 1 } does not include { "a": 1 }
  Given A is { "a": 1 }
  When asserting that A does not include { "a": 1 }
  Then the assertion fails with {"a":1} does include {"a":1}

Scenario: { "a": 1, "b": 1 } does not include { "a": 1 }
  Given A is { "a": 1, "b": 1 }
  When asserting that A does not include { "a": 1 }
  Then the assertion fails with {"a":1,"b":1} does include {"a":1}

Scenario: { "a": 1 } does not include { "a": 2 }
  Given A is { "a": 1 }
  When asserting that A does not include { "a": 2 }
  Then the assertion passes

Scenario: [1, 2] does not include 1
  Given A is [1, 2]
  When asserting that A does not include 1
  Then the assertion fails with [1,2] does include 1
  And the error path is "0"

Scenario: [{ "a": 1 }] does not include { "a": 2 }
  Given A is [{ "a": 1 }]
  When asserting that A does not include { "a": 2 }
  Then the assertion passes

Scenario: [{ "a": 1 }, { "a": 2 }] includes { "a": 2 }
  Given A is [{ "a": 1 }, { "a": 2 }]
  When asserting that A does not include { "a": 2 }
  Then the assertion fails with [{"a":1},{"a":2}] does include {"a":2}
  And the error path is "1"

Scenario: { "members": [] } does not include { "members": ["a"] }
  Given A is { "members": [] }
  When asserting that A does not include { "members": ["a"] }
  Then the assertion passes

Scenario: { "a": { "b": 1, "c": 1 } } does not include { "a": { "b": 1 } }
  Given A is { "a": { "b": 1, "c": 1 } }
  When asserting that A does not include { "a": { "b": 1 } }
  Then the assertion fails with {"a":{"b":1,"c":1}} does include {"a":{"b":1}}

Scenario: {} does not include { "a": null }
  Given A is {}
  When asserting that A does not include { "a": null}
  Then the assertion fails with {} does include {"a":null}

Scenario: [] does not include { "a": 1 }
  Given A is []
  When asserting that A does not include { "a": 1 }
  Then the assertion passes
