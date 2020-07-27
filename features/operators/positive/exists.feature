Feature: existance

Scenario: A exists
  Given A is { "a": 1 }
  When asserting that A exists in context
  Then the assertion passes

Scenario: B does not exist
  Given A is { "a": 1 }
  When asserting that B exists in context
  Then the assertion fails with undefined is not truthy
