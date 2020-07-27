Feature: entities

Scenario: boxes
  Given a box B1 with { "color": "red" }
  And a box B2 with { "color": "green" }
  And box B2 also has { "color": "blue", "size": "big" }
  Then the document for box B1 at color is "red"
  And that document at id is 1
  And the document for the box with { "color": "blue" } at size is "big"
  And the box B3 was deleted

Scenario: previous boxes should not exist
  And the document for the box with { "color": "red" } does not exist in context
  And the document for the box with { "color": "green" } does not exist in context
  And the document for the box with { "color": "blue" } does not exist in context
