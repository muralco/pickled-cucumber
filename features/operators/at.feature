Feature: compare JSON at X is Y

Scenario: { "a": 1 } at a is 1
  Given A is { "a": 1 }
  When asserting that A at a is 1
  Then the assertion passes

Scenario: { "a": 1 } at a is 2
  Given A is { "a": 1 }
  When asserting that A at a is 2
  Then the assertion fails with 1 is not 2
  And the full actual value is { "a": 1}
  And the error path is "a"

Scenario: { "a": [1] } at a.0 is 1
  Given A is { "a": [1] }
  When asserting that A at a.0 is 1
  Then the assertion passes

Scenario: { "a": [1] } at a.0 is 1
  Given A is { "a": [1] }
  When asserting that A at a[0] is 1
  Then the assertion passes
