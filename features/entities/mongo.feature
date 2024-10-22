@mongodb
Feature: MongoDB entities

Scenario: create and assert
  Given a user U with { "color": "red" }
  Then the document for user U at color is "red"
  And that document at id matches /^\d+$/
  And that document at created matches /^\d+$/

Scenario: update (also has)
  Given a user U with { "color": "red" }
  And user U also has { "color": "blue" }
  Then the document for user U at color is "blue"
  And that document at updated matches /^\d+$/

Scenario: assert by property
  Given a user U with { "color": "red", "action": "${random}" }
  Then the document for the user with { "action": "${random}" } at color is "red"

Scenario: assert many by property
  Given a user U with { "color": "red", "action": "${random}" }
  And a user U2 with { "color": "blue", "action": "${random}" }
  Then the documents for the user with { "action": "${random}" } includes { "color": "red" }
  And the documents for the user with { "action": "${random}" } includes { "color": "blue" }

Scenario: store document variable
  Given a user U with { "color": "red", "action": "${random}" }
  And store the document for user U in U2
  Then the document for the user with { "action": "${U2.action}" } at color is "red"

Scenario: store document by property
  Given a user U with { "color": "red", "action": "${random}" }
  And store the document for the user with { "action": "${random}" } in U2
  Then the document for the user with { "action": "${U2.action}" } at color is "red"
