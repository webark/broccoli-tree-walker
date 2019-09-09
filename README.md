# broccoli-tree-walker

Helper base class for Broccoli plugins wraps [fs-tree-diff](https://github.com/stefanpenner/fs-tree-diff) and 
[node-walk-sync](https://github.com/joliss/node-walk-sync#readme) providing different methods based off of different 
file operations.

## API

```js
class TreeWalker {
  /**
   * Virtual method `unlink`: Called when you remove the specified file
   */
  virtual unlink(filePath: string, rootPath: string): any

  /**
   * Virtual method `rmdir`: Called when you remove the specified folder
   */
  virtual rmdir(filePath: string, rootPath: string): any

  /**
   * Virtual method `mkdir`: Called when you create the specified folder
   */
  virtual mkdir(filePath: string, rootPath: string): any

  /**
   * Virtual method `create`: Called when you create the specified file
   */
  virtual create(filePath: string, rootPath: string): any

  /**
   * Virtual method `change`: Called when you update the specified file to reflect changes
   */
  virtual change(filePath: string, rootPath: string): any

  /**
   * Virtal method `nodesChanged` Called when a change has been made to one of the input nodes
   */
  virtual nodesChanged(patchResults: Array<FSTree.Patch>): any
}
```

### Options

* `include`: Entry option `globs` from [node-walk-sync](https://github.com/joliss/node-walk-sync#options)
* `exclude`: Entry option `ignore` from [node-walk-sync](https://github.com/joliss/node-walk-sync#options)
* `directory`: Entry option `directories` from [node-walk-sync](https://github.com/joliss/node-walk-sync#options)
* `name`, `annotation`: Same as
  [broccoli-plugin](https://github.com/broccolijs/broccoli-plugin#new-plugininputnodes-options);
  see there.

All options except `name` and `annotation` can also be set on the prototype
instead of being passed into the constructor.

### Example Usage

```js
const TreeWalker = require('broccoli-tree-walker');

class FileWriter extends Walker {
  _fileContents() {
    return `/* some file contents */`;
  }

  create(filePath) {
    const fullFilePath = path.join(this.outputPath, filePath);
    return fs.outputFileSync(fullFilePath, this._someFileContents(filePath));
  }

  unlink(filePath) {
    const fullFilePath = path.join(this.outputPath, filePath);
    return fs.removeSync(fullFilePath);
  }
}
```

