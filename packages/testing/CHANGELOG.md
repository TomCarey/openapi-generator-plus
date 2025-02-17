# @openapi-generator-plus/testing

## 2.3.1

### Patch Changes

- Updated dependencies [81da24d]
  - @openapi-generator-plus/core@2.3.1

## 2.3.0

### Patch Changes

- Updated dependencies [64cf2e6]
  - @openapi-generator-plus/core@2.3.0
  - @openapi-generator-plus/types@2.3.0

## 2.2.0

### Patch Changes

- Updated dependencies [616b459]
  - @openapi-generator-plus/core@2.2.0
  - @openapi-generator-plus/types@2.2.0

## 2.1.0

### Minor Changes

- 30cefed: Testing module dependencies need to sync with the release version

## 2.0.0

### Patch Changes

- Updated dependencies [fb1ae88]
  - @openapi-generator-plus/core@2.0.0
  - @openapi-generator-plus/types@2.0.0

## 1.6.1

### Patch Changes

- ed650b9: Add @openapi-generator-plus/indexed-type as an export so dependents don't need to import both

## 1.6.0

### Patch Changes

- c88af7b: Upgrade dependencies
- Updated dependencies [43092cb]
- Updated dependencies [c88af7b]
  - @openapi-generator-plus/core@1.6.0
  - @openapi-generator-plus/types@1.4.1

## 1.3.0

### Patch Changes

- a8eb5af: Upgrade dependencies
- Updated dependencies [095d4b6]
- Updated dependencies [d248bef]
- Updated dependencies [e189df5]
- Updated dependencies [a8eb5af]
  - @openapi-generator-plus/types@1.3.0
  - @openapi-generator-plus/core@1.3.0

## 1.0.0

### Major Changes

- First major release

### Patch Changes

- Updated dependencies [d7f6d83]
- Updated dependencies
  - @openapi-generator-plus/core@1.0.0
  - @openapi-generator-plus/types@1.0.0

## 0.42.0

### Patch Changes

- Updated dependencies [1ca4910]
- Updated dependencies [5e15b3a]
- Updated dependencies [4f00292]
- Updated dependencies [5f754a2]
- Updated dependencies [3b72edb]
- Updated dependencies [f2fbd04]
- Updated dependencies [6872a0c]
- Updated dependencies [65accd3]
  - @openapi-generator-plus/core@0.42.0
  - @openapi-generator-plus/types@0.42.0

## 0.41.5

### Patch Changes

- 951d0af: Update dependencies
- Updated dependencies [951d0af]
  - @openapi-generator-plus/core@0.41.5
  - @openapi-generator-plus/types@0.41.5

## 0.41.0

### Patch Changes

- Updated dependencies [f1ca172]
- Updated dependencies [d4a0d98]
- Updated dependencies [25a26cd]
- Updated dependencies [14c54ae]
- Updated dependencies [5c9b32d]
- Updated dependencies [51b10a5]
- Updated dependencies [eeb0f80]
- Updated dependencies [1f5efef]
- Updated dependencies [68b1c65]
- Updated dependencies [1969730]
- Updated dependencies [8ce82be]
- Updated dependencies [a9101dc]
- Updated dependencies [8e27626]
  - @openapi-generator-plus/core@0.41.0
  - @openapi-generator-plus/types@0.41.0

## 0.40.0

### Patch Changes

- Updated dependencies [a85452c]
- Updated dependencies [1155800]
- Updated dependencies [79f4729]
- Updated dependencies [58cb081]
- Updated dependencies [4ba6fdd]
  - @openapi-generator-plus/types@0.40.0
  - @openapi-generator-plus/core@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies [2c4c175]
- Updated dependencies [0b04c82]
- Updated dependencies [e1af31e]
- Updated dependencies [32bde64]
- Updated dependencies [4499766]
- Updated dependencies [f5c140e]
- Updated dependencies [5ccf71c]
  - @openapi-generator-plus/core@0.39.0
  - @openapi-generator-plus/types@0.39.0

## 0.31.8

### Patch Changes

- Updated dependencies [280aa4e]
- Updated dependencies [f04e527]
- Updated dependencies [6bfe5cd]
- Updated dependencies [5d07122]
- Updated dependencies [170bbea]
- Updated dependencies [60df9fd]
  - @openapi-generator-plus/core@0.38.0
  - @openapi-generator-plus/types@0.38.0

## 0.31.7

### Patch Changes

- Updated dependencies [8d801d7]
- Updated dependencies [8cb54fc]
- Updated dependencies [e4b2f87]
  - @openapi-generator-plus/core@0.37.0
  - @openapi-generator-plus/types@0.36.0

## 0.31.6

### Patch Changes

- Updated dependencies [1e6716d]
- Updated dependencies [80f85ae]
  - @openapi-generator-plus/core@0.36.0
  - @openapi-generator-plus/types@0.35.0

## 0.31.5

### Patch Changes

- Updated dependencies [a44b8d4]
  - @openapi-generator-plus/core@0.35.0
  - @openapi-generator-plus/types@0.34.0

## 0.31.4

### Patch Changes

- Updated dependencies [7c0d70c]
- Updated dependencies [7a7b42c]
- Updated dependencies [b465b1c]
  - @openapi-generator-plus/core@0.34.0

## 0.31.3

### Patch Changes

- Updated dependencies [880828f]
  - @openapi-generator-plus/core@0.33.0
  - @openapi-generator-plus/types@0.33.0

## 0.31.2

### Patch Changes

- Updated dependencies [9873f9b]
- Updated dependencies [f164605]
- Updated dependencies [609f283]
- Updated dependencies [d821e84]
- Updated dependencies [8d91265]
- Updated dependencies [e48312f]
- Updated dependencies [d8e932d]
- Updated dependencies [c7462dd]
  - @openapi-generator-plus/core@0.32.0
  - @openapi-generator-plus/types@0.32.0

## 0.31.1

### Patch Changes

- Fix broken build process that included incorrect relative dependencies
- Updated dependencies [undefined]
  - @openapi-generator-plus/core@0.31.1
  - @openapi-generator-plus/types@0.31.1

## 0.31.0

### Minor Changes

- 5f7c37f: Refactor support for allOf, anyOf and oneOf so we can accurately represent these concepts in different languages with different capabilities.

  Previously we attempted to model these three concepts using objects, inheritance and interface conformance. This sort of worked for Java,
  for which these concepts are native. But it didn't work perfectly as Java doesn't support multiple-inheritance so an `allOf` with multiple
  refs caused problems, and we lost the idea of compatibility with the refs, as the generator didn't create interfaces.

  The previous approach didn't really work for TypeScript, which natively supports types like `A | B | C`, which is pretty good for `anyOf`
  and `oneOf`. There's some more commentary about this on https://stackoverflow.com/questions/52836812/how-do-json-schemas-anyof-type-translate-to-typescript
  I worked around the TypeScript issues with some gnarly (but less gnarly than this piece of work) post-processing on the `CodegenDocument`
  to take advantage of disjunctions for `oneOf`.

  Now the generator can indicate what form it supports for each of the composition types, and whether it supports inheritance—single or double.
  The core then does the work of creating the right schemas to accurately represent the structure, including creating extra interfaces to ensure
  that we accurately represent compatibility between types.

  This is all in aid of the first issue:

  https://github.com/karlvr/openapi-generator-plus/issues/1

### Patch Changes

- Updated dependencies [5f7c37f]
  - @openapi-generator-plus/core@0.31.0
  - @openapi-generator-plus/types@0.31.0
