![Tests](https://github.com/jf-conversion/jf-lib/actions/workflows/tests.yml/badge.svg)
![Build](https://github.com/jf-conversion/jf-lib/actions/workflows/build.yml/badge.svg)

# Journey Further Helper Library

A simple library consisting of regularly used functions across the Journey Further DX dev team.

## How to use

This repo can be added to any node based JS/TS project by adding a git ssh dependency to your `package.json` as follows:

`"jf-lib": "git+ssh://git@github.com:jf-conversion/jf-lib.git"`

After you have added the repo to your project you can use it as you would any other `ESM` library: `import { someFunc } from "jf-lib";`.

For a full list of available functions and documentation please visit: [https://jf-conversion.github.io/jf-lib/](https://jf-conversion.github.io/jf-lib/)

## Contribution Guidelines

If you would like to contribute to the `jf-lib` library please use the following guidelines.

We are operating with a 1 file = 1 function rule throughout this repository and all contributions will be required to follow this.

The naming convention used in filenames is camelCase and the filename of the module you add to match exactly the name of your added function.

All additions should be accompanied by a spec file in the `__tests__` folder and the filename of your spec should, again, match exactly the name of your function followed by `.spec`.

For example, if I added a function called `addFive` I would add `addFive.ts` and `addFive.spec.ts`

### How to start

Before starting to edit files within the library make sure you are on the `main` branch and that you create yourself a new branch off of it.

The name of the new branch should be that of the function you wish to add. Using the example above my branch would be called `addFive`

By doing this we can ensure we do not create any merge conflicts.

### Where to store your function/test

All functions within this library are housed within `src/modules` and are exported via `src/modules/index.ts`.

Using the example from above, you would create `src/modules/addFive.ts` and add `export * from "./addFive";` to the module exported in `src/modules/index.ts`.

All tests are stored in the mirrored `__tests__` folder. Using the same example, I would add `__tests__/modules/addFive.spec.ts`.

### Coverage

After adding your function and its accompanying `spec` file you should run a `coverage` report and ensure that your test is covering at least 90% of your function's statements and branches.

To run a coverage report you can simple call `yarn test --coverage` and you will see a large table in the terminal which highlights any issues.

### Defining types

If your function requires any specific type definitions you should define them within the module which you are adding to library and export it from there.

### Creating a pull request

After you have written your function and unit tests you will be required to make a PR in order to merge to the main branch.

To do this, first push your branch to the remote repo. Using the same example as above we would run: `git push -u origin addFive`

This will create our branch in the remote repo.

After you have done this you can proceed to create your pull request :)
