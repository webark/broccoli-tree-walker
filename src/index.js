const Plugin = require('broccoli-plugin');
const walkSync = require('walk-sync');
const FSTree = require('fs-tree-diff');

module.exports = class TreeWalker extends Plugin {
  constructor(inputNodes, options = {}) {
    const inputNodesAlwaysArray = [].concat(inputNodes).filter(Boolean);
    super(inputNodesAlwaysArray, {
      ...options,
      persistentOutput: true,
    });

    this.include = options.include;
    this.exclude = options.exclude;
    this.directories = options.directories || false;

    this.activeTrees = {};
  }

  build() {
    return Promise.all(this._handleEntries())
      .then(this._postBuild.bind(this));
  }

  _handleEntries() {
    return this.inputPaths.map(rootPath => {
      const entries = walkSync.entries(rootPath, {
        globs: this.include,
        ignore: this.exclude,
        directories: this.directories,
      });
      const nextTree = FSTree.fromEntries(entries, { sortAndExpand: true });
      const currentTree = this.activeTrees[rootPath] || new FSTree();
      const patches = currentTree.calculatePatch(nextTree);

      this.activeTrees[rootPath] = nextTree;
      return Promise.resolve(patches, rootPath).then(this._walker.bind(this));
    })
  }

  _walker(patches, rootPath) {
    return patches.map(([action, filePath]) => {
      if (typeof this[action] === 'function') {
        return this[action](filePath, rootPath);
      }
    });
  }

  _postBuild(patchResults) {
    const changed = patchResults.some(result => result.length);

    if (typeof this.nodesChanged === 'function' && changed) {
      this.nodesChanged(patchResults);
    }
  }
}
