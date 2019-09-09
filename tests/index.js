const expect = require('chai').expect;
const { createBuilder, createTempDir } = require('broccoli-test-helper');
const TreeWalker = require('../src/index');
const { stripIndent } = require('common-tags');
const os = require('os');
const sinon = require('sinon');

describe("tree walker", function() {
  beforeEach(async function() {
    this.input = await createTempDir();
    this.subject = new TreeWalker(this.input.path(), {
      directories: true,
    });
    this.output = createBuilder(this.subject);
  });

  afterEach(async function() {
    await this.input.dispose();
    await this.output.dispose();
  });

  it("should call create and mkdir when creating files and directories", async function() {
    const fakes = {
      create: sinon.fake(),
      mkdir: sinon.fake(),
    };
    this.subject.create = fakes.create;
    this.subject.mkdir = fakes.mkdir;
 
    this.input.write({
      "src": {
        "ui": {
          "components": {
            "todo-item": {
              "style.scss": '/* todo item styles */'
            },
            "other-thing": {
              "style.scss": '/* other thing styles */'
            }
          }
        }
      }
    });

    await this.output.build();
    expect(fakes.create.callCount).to.equal(2);
    expect(fakes.mkdir.callCount).to.equal(5);
  });

  it("should call unlink and rmdir when deleting files and directories", async function() {
    const fakes = {
      rmdir: sinon.fake(),
      unlink: sinon.fake(),
    };
    this.subject.rmdir = fakes.rmdir;
    this.subject.unlink = fakes.unlink;
 
    this.input.write({
      "src": {
        "ui": {
          "components": {
            "todo-item": {
              "style.scss": '/* todo item styles */'
            },
            "other-thing": {
              "style.scss": '/* other thing styles */'
            }
          }
        }
      }
    });

    await this.output.build();

    this.input.write({
      "src": null
    });

    await this.output.build();
    expect(fakes.unlink.callCount).to.equal(2);
    expect(fakes.rmdir.callCount).to.equal(5);
  });

  it("should call change when changing files", async function() {
    const fakes = {
      change: sinon.fake(),
    };
    this.subject.change = fakes.change;
 
    this.input.write({
      "src": {
        "ui": {
          "components": {
            "todo-item": {
              "style.scss": '/* todo item styles */'
            },
            "other-thing": {
              "style.scss": '/* other thing styles */'
            }
          }
        }
      }
    });

    await this.output.build();

    this.input.write({
      "src": {
        "ui": {
          "components": {
            "todo-item": {
              "style.scss": '/* new content */'
            },
            "other-thing": {
              "style.scss": '/* aint that fun */'
            }
          }
        }
      }
    });

    await this.output.build();
    expect(fakes.change.callCount).to.equal(2);
  });
  
  it("should call nodesChanged only when something has changed", async function() {
    const fakes = {
      nodesChanged: sinon.fake(),
    };
    this.subject.nodesChanged = fakes.nodesChanged;
 
    this.input.write({
      "src": {
        "ui": {
          "components": {
            "todo-item": {
              "style.scss": '/* todo item styles */'
            },
            "other-thing": {
              "style.scss": '/* other thing styles */'
            }
          }
        }
      }
    });

    await this.output.build();
    expect(fakes.nodesChanged.callCount).to.equal(1);

    await this.output.build();
    expect(fakes.nodesChanged.callCount).to.equal(1);

    this.input.write({
      "src": {
        "ui": {
          "components": {
            "other-file.scss": '/* some reandom comment */'
          }
        }
      }
    });

    await this.output.build();
    expect(fakes.nodesChanged.callCount).to.equal(2);
  });
});
