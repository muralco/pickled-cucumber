Feature: Elasticsearch entities

Scenario: create and assert
  Given a search S with { "color": "red" }
  Then the document for search S at color is "red"
  And that document at id matches /^\d+$/
  And that document at created matches /^\d+$/

Scenario: update (also has)
  Given a search S with { "color": "red" }
  And search S also has { "color": "blue" }
  Then the document for search S at color is "blue"
  And that document at updated matches /^\d+$/

Scenario: assert by property
  Given a search S with { "color": "red", "action": "${random}" }
  Then the document for the search with { "query": { "term": { "action": "${random}" } } } at color is "red"

Scenario: store document variable
  Given a search S with { "color": "red", "action": "${random}" }
  And store the document for search S in U2
  Then the document for the search with { "query": { "term": { "action": "${U2.action}" } } } at color is "red"

Scenario: store document by property
  Given a search S with { "color": "red", "action": "${random}" }
  And store the document for the search with { "query": { "term": { "action": "${random}" } } } in U2
  Then the document for the search with { "query": { "term": { "action": "${U2.action}" } } } at color is "red"

Scenario: search
  Given a search S with { "color": "red", "action": "${random}" }
  When searching for { "query": { "term": { "action": "${random}" } } }
  Then the search results at hits.hits.0._source.color is "red"
