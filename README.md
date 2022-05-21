# backend-developer-assessment

ACME company is running a bunch of research **projects**. Each project has
a number of people who **participate** in the research for some period time,
after which the corresponding participation `state` transitions
from `ACTIVE` to `INACTIVE`.
ACME would like us to implement a web service that will allow them to manage
the projects and corresponding participations and at any point in time fetch
an up-to-date summary of each project with the information about
number of participations per each state.

## Overview

The monorepo consists of a PoC implementation of a simple `project-api`
service which allows you to create a project:
```
POST /projects/
BODY { name: 'string' }
```
and create or modify participations:
```
POST /participations/
BODY { projectId: 'string', state: 'ACTIVE' | 'INACTIVE' }

PATCH /participations/:participationId
BODY { projectId: 'string', state: 'ACTIVE' | 'INACTIVE' }
```
In addition to that, there's another endpoint for fetching project summary:
```
GET /summary/:projectId
```
We are expecting that the `/summary` endpoint will be used very often,
so instead of running the aggregation on each request, we've decided
to re-compute it every time when there's a change in `participations`
collection - this is what `project-summary` worker is responsible.

## Requirements

The current implementation has many flaws which makes it a no-go for production usage.
Your task will be to review the code, identify and resolve as many problems as you can.

1. Try to make the fixes atomic and split them into separate commits.
2. Do not bypass pre-commit hooks. Instead, make sure that the code is 100%
compliant before each commit.
3. Implement relevant unit tests for `apps/project-api` and `apps/project-summary`
and make sure that `rush build` completes without errors. Some sort of load testing
test suite would be a big plus.

Code formatting is handled automatically, but you may need to ensure that liter
validation is passing. On top of that, typechecking is performed during `rush build`.
Type annotations are provided via JS Docs.

## Prerequisites

On top of the regular dependencies that you would expect in any `nodejs` project, you
may need to have the following installed locally:

- rush, https://rushjs.io/pages/intro/get_started/
- tmux@2.1, https://tmux.github.io/
- mongodb@4.x or newer
- kafka@2.8.x, https://kafka.apache.org/downloads
- download https://repo1.maven.org/maven2/org/apache/avro/avro/1.10.0/avro-1.10.0.jar to your `kafka\libs` folder; this will be required for mongo connector
- download https://www.confluent.io/hub/mongodb/kafka-connect-mongodb
- copy `mongo-kafka-connect-1.7.0-confluent` to `./develop/kafka/plugin` folder

At this stage you should be able to run `./start.sh` script
(I recommend using `--iterm2` option if you are `iTerm2` user),
which will spin up the dev stack that you can use for experimenting.

## Style guidelines

Please use the following rules when formatting commit messages:

1. Start every commit message with capital letter
2. Limit message length to 50 characters
3. Only explain what has changed, not why
4. If necessary, put additional explanation in "commit description", i.e. the text after two line breaks
5. Wrap commit description at 72 characters, there can be multiple lines
6. Grammatically, commit message should be completing the following sentence:

> When merged, this commit will [...]
