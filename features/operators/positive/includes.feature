Feature: compare JSON includes X

Scenario: { "a": 1 } includes {}
  Given A is { "a": 1 }
  When asserting that A includes {}
  Then the assertion passes

Scenario: { "a": 1 } includes { "a": 1 }
  Given A is { "a": 1 }
  When asserting that A includes { "a": 1 }
  Then the assertion passes

Scenario: { "a": 1, "b": 1 } includes { "a": 1 }
  Given A is { "a": 1, "b": 1 }
  When asserting that A includes { "a": 1 }
  Then the assertion passes

Scenario: { "a": 1 } includes { "a": 2 }
  Given A is { "a": 1 }
  When asserting that A includes { "a": 2 }
  Then the assertion fails with {"a":1} does not include {"a":2}
  And the sub error is: got 1 instead of 2 at "a"

Scenario: [1, 2] includes 1
  Given A is [1, 2]
  When asserting that A includes 1
  Then the assertion passes

Scenario: [{ "a": 1 }] includes { "a": 2 }
  Given A is [{ "a": 1 }]
  When asserting that A includes { "a": 2 }
  Then the assertion fails with [{"a":1}] does not include {"a":2}

Scenario: [{ "a": 1 }, { "a": 2 }] includes { "a": 2 }
  Given A is [{ "a": 1 }, { "a": 2 }]
  When asserting that A includes { "a": 2 }
  Then the assertion passes

Scenario: { "members": [] } includes { "members": ["a"] }
  Given A is { "members": [] }
  When asserting that A includes { "members": ["a"] }
  Then the assertion fails with {"members":[]} does not include {"members":["a"]}
  And the sub error is: got [] instead of ["a"] at "members"

Scenario: { "a": { "b": 1, "c": 1 } } includes { "a": { "b": 1 } }
  Given A is { "a": { "b": 1, "c": 1 } }
  When asserting that A includes { "a": { "b": 1 } }
  Then the assertion passes

Scenario: {} includes { "a": null }
  Given A is {}
  When asserting that A includes { "a": null }
  Then the assertion passes

Scenario: [] includes { "a": 1 }
  Given A is []
  When asserting that A includes { "a": 1 }
  Then the assertion fails with [] does not include {"a":1}
