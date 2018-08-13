Feature: aliases

Scenario: proper name
  Then A proper name can be Alice
  And A proper name can be Bob

Scenario: regex alias
  Then the /api/something alias matches /api/something
