[![semantic-release: eslint](https://img.shields.io/badge/semantic--release-eslint-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![Release](https://github.com/journey-further/dx-lib/actions/workflows/release.yml/badge.svg)
![CI](https://github.com/journey-further/dx-lib/actions/workflows/main.yml/badge.svg)
[![Latest Release](https://github.com/journey-further/dx-lib/raw/main/.github/badges/latest-release.svg)](https://github.com/journey-further/dx-lib/releases)

# Journey Further Helper Library

A simple library consisting of regularly used functions across the Journey
Further DX dev team.

## How to use

This repo can be added to any node based JS/TS project by adding a git ssh
dependency to your `package.json` as follows:

`"jf-lib": "github:journey-further/dx-lib.git"`

After you have added the repo to your project you can use it as you would any
other `ESM` library: `import { someFunc } from "jf-lib";`.

For a full list of available functions and documentation please visit:
[https://journey-further.github.io/dx-lib/](https://journey-further.github.io/dx-lib/)

### Reporting bugs

If you notice that something isn't working as expected please report it on the
_jf-lib_ github repo and add the _bug_ label to the issue. If the issue is
one which is stopping you from doing your work please mark it as high priority
and tag either @PaulSinghDev or @SamRenfrew in the comments.

When raising bugs it is important that you include as much information as
possible. When diagnosing and fixing bugs we need to be able to replicate them.
With that in mind it is always a good idea to check if you can personally
replicate a bug before reporting it.

If you can replicate it, please include the exact steps which are required in
order for another dev to do so

To raise a bug ticket please use the following link:
https://github.com/journey-further/dx-lib/issues

### Feature requests

Got a cool idea? Found a pain point which can be solved with some code? Thought
of an addition to an existing script? Raise a feature request!

If you would like to raise a feature request use the link below to do so on the
_dx-lib_ repo. When doing please be sure to add the _enhancement_ label to
the issue and include as much information as possible.

A good starting point/template is to answer the following questions within your
issue:

- 1.  What problem will this request solve?
- 2.  Where will the changes take place?
- 3.  How can you foresee this feature being implemented (it's ok if you are not
      sure, we can have a discussion)?
- 4.  How urgent is the request?

Once the request has been raised it can be discussed and implementation can be
figured out.

To raise a feature request please use the following link:
https://github.com/jf-conversion/jf-lib/issues

## Contribution Guidelines

If you would like to contribute to the `dx-lib` library please use the following
guidelines.

We are operating with a 1 file = 1 function rule throughout this repository and
all contributions will be required to follow this.

The naming convention used in filenames is camelCase and the filename of the
module you add to match exactly the name of your added function.

All additions should be accompanied by a spec file in the `__tests__` folder and
the filename of your spec should, again, match exactly the name of your function
followed by `.spec`.

For example, if I added a function called `addFive` I would add `addFive.ts` and
`addFive.spec.ts`

### How to start

Before starting to edit files within the library make sure you are on the `main`
branch and that you create yourself a new branch off of it.

The name of the new branch should be that of the function you wish to add. Using
the example above my branch would be called `addFive`

By doing this we can ensure we do not create any merge conflicts.

### Where to store your function/test

All functions within this library are housed within `src/modules` and are
exported via `src/modules/index.ts`.

Using the example from above, you would create `src/modules/addFive.ts` and add
`export * from "./addFive";` to the module exported in `src/modules/index.ts`.

All tests are stored in the mirrored `__tests__` folder. Using the same example,
I would add `__tests__/modules/addFive.spec.ts`.

### Coverage

After adding your function and its accompanying `spec` file you should run a
`coverage` report and ensure that your test is covering at least 90% of your
function's statements and branches.

To run a coverage report you can simple call `npm test -- --coverage` and you will
see a large table in the terminal which highlights any issues.

### Defining types

If your function requires any specific type definitions you should define them
within the module which you are adding to library and export it from there.

### Creating a pull request

After you have written your function and unit tests you will be required to make
a PR in order to merge to the main branch.

To do this, first push your branch to the remote repo. Using the same example as
above we would run: `git push -u origin addFive`

This will create our branch in the remote repo.

After you have done this you can proceed to create your pull request :)
