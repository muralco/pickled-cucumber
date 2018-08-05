Feature: entities

Scenario: boxes
  Given a box B1 with { "color": "red" }
  And a box B2 with { "color": "green" }
  And box B2 also has { "color": "blue" }
  Then the document for box B1 at color is "red"
  And that document at id is 0
  And the document for box B2 at color is "blue"
  And the box B3 was deleted
