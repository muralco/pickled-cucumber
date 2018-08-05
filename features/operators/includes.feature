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
  And the sub error is 1 at "a"

Scenario: [1, 2] includes 1
  Given A is [1, 2]
  When asserting that A includes 1
  Then the assertion passes

Scenario: [{ "a": 1 }] includes { "a": 2 }
  Given A is [{ "a": 1 }]
  When asserting that A includes { "a": 2 }
  Then the assertion fails with [{"a":1}] does not include {"a":2}
  And the sub error is null at "0.a"

Scenario: [{ "a": 1 }, { "a": 2 }] includes { "a": 2 }
  Given A is [{ "a": 1 }, { "a": 2 }]
  When asserting that A includes { "a": 2 }
  Then the assertion passes
