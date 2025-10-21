/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var crypto = require('node:crypto');
var node_events = require('node:events');

class TranslationVersionControl extends node_events.EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this.commits = /* @__PURE__ */ new Map();
    this.branches = /* @__PURE__ */ new Map();
    this.tags = /* @__PURE__ */ new Map();
    this.currentBranch = "main";
    this.head = null;
    this.workingTree = /* @__PURE__ */ new Map();
    this.stagingArea = [];
    this.stashes = [];
    this.remotes = /* @__PURE__ */ new Map();
    this.mergeConflicts = [];
    this.maxCommits = 1e3;
    this.maxStashes = 20;
    this.maxStagingSize = 100;
    this.cleanupTimer = void 0;
    this.config = {
      author: "User",
      email: "user@example.com",
      autoStash: true,
      autoMerge: false
    };
    this.initRepository();
    this.cleanupTimer = setInterval(() => {
      this.pruneOldCommits();
      this.limitStashes();
    }, 6e4);
  }
  initRepository() {
    const initialCommit = {
      hash: this.generateHash("initial"),
      parent: null,
      author: "System",
      email: "system@i18n",
      timestamp: Date.now(),
      message: "Initial commit",
      changes: [],
      tree: this.generateTreeHash()
    };
    this.commits.set(initialCommit.hash, initialCommit);
    const mainBranch = {
      name: "main",
      head: initialCommit.hash,
      created: Date.now(),
      author: "System",
      description: "Main branch"
    };
    this.branches.set("main", mainBranch);
    this.head = initialCommit.hash;
    this.emit("init", {
      branch: "main",
      commit: initialCommit.hash
    });
  }
  // Configuration
  setConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
    this.emit("config:update", this.config);
  }
  // Working tree operations
  getTranslation(locale, key) {
    return this.workingTree.get(locale)?.get(key);
  }
  setTranslation(locale, key, value) {
    if (!this.workingTree.has(locale)) {
      this.workingTree.set(locale, /* @__PURE__ */ new Map());
    }
    const oldValue = this.workingTree.get(locale).get(key);
    this.workingTree.get(locale).set(key, value);
    const change = {
      type: oldValue === void 0 ? "add" : "modify",
      locale,
      key,
      oldValue,
      newValue: value,
      diff: this.calculateDiff(oldValue, value)
    };
    this.trackChange(change);
    this.emit("translation:change", change);
  }
  deleteTranslation(locale, key) {
    const oldValue = this.workingTree.get(locale)?.get(key);
    if (oldValue !== void 0) {
      this.workingTree.get(locale).delete(key);
      const change = {
        type: "delete",
        locale,
        key,
        oldValue,
        newValue: void 0
      };
      this.trackChange(change);
      this.emit("translation:delete", change);
    }
  }
  // Staging operations
  add(pattern) {
    this.emit("stage:add", {
      pattern,
      count: this.stagingArea.length
    });
  }
  reset(pattern) {
    if (pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      this.stagingArea = this.stagingArea.filter((change) => !regex.test(`${change.locale}:${change.key}`));
    } else {
      this.stagingArea = [];
    }
    this.emit("stage:reset", {
      pattern
    });
  }
  // Commit operations
  commit(message, options) {
    if (this.stagingArea.length === 0 && !options?.amend) {
      throw new Error("Nothing to commit");
    }
    const parent = options?.amend ? this.getCommit(this.head)?.parent : this.head;
    const changes = options?.amend ? [...this.getCommit(this.head)?.changes || [], ...this.stagingArea] : this.stagingArea;
    const commit = {
      hash: this.generateHash(message + Date.now()),
      parent,
      author: options?.author || this.config?.author,
      email: options?.email || this.config?.email,
      timestamp: Date.now(),
      message,
      changes,
      tree: this.generateTreeHash()
    };
    if (this.commits.size >= this.maxCommits) {
      this.pruneOldCommits();
    }
    this.commits.set(commit.hash, commit);
    this.head = commit.hash;
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.head = commit.hash;
    }
    this.stagingArea = [];
    this.emit("commit", commit);
    return commit.hash;
  }
  // Branch operations
  branch(name, options) {
    if (this.branches.has(name)) {
      throw new Error(`Branch '${name}' already exists`);
    }
    const startPoint = options?.from || this.head;
    const branch = {
      name,
      head: startPoint,
      created: Date.now(),
      author: this.config?.author
    };
    this.branches.set(name, branch);
    if (options?.checkout) {
      this.checkout(name);
    }
    this.emit("branch:create", branch);
  }
  checkout(target, options) {
    if (this.stagingArea.length > 0 && !options?.force) {
      if (this.config?.autoStash) {
        this.stash("Auto-stash before checkout");
      } else {
        throw new Error("Uncommitted changes. Use force or stash changes.");
      }
    }
    if (options?.createNew) {
      this.branch(target, {
        checkout: true
      });
      return;
    }
    const branch = this.branches.get(target);
    const commit = this.commits.get(target);
    if (branch) {
      this.currentBranch = target;
      this.head = branch.head;
      this.loadTreeFromCommit(branch.head);
    } else if (commit) {
      this.currentBranch = "HEAD";
      this.head = target;
      this.loadTreeFromCommit(target);
    } else {
      throw new Error(`Invalid target: ${target}`);
    }
    this.emit("checkout", {
      target,
      branch: this.currentBranch,
      head: this.head
    });
  }
  merge(branch, options) {
    const sourceBranch = this.branches.get(branch);
    if (!sourceBranch) {
      throw new Error(`Branch '${branch}' not found`);
    }
    const sourceCommit = this.commits.get(sourceBranch.head);
    const targetCommit = this.commits.get(this.head);
    if (!sourceCommit || !targetCommit) {
      throw new Error("Invalid commits");
    }
    const commonAncestor = this.findCommonAncestor(sourceCommit.hash, targetCommit.hash);
    if (commonAncestor === targetCommit.hash) {
      this.head = sourceCommit.hash;
      this.branches.get(this.currentBranch).head = sourceCommit.hash;
      this.loadTreeFromCommit(sourceCommit.hash);
      this.emit("merge:fast-forward", {
        from: branch,
        to: this.currentBranch
      });
      return;
    }
    const conflicts = this.performThreeWayMerge(commonAncestor, targetCommit.hash, sourceCommit.hash, options?.strategy || "recursive");
    if (conflicts.length > 0) {
      this.mergeConflicts = conflicts;
      this.emit("merge:conflict", {
        conflicts,
        from: branch,
        to: this.currentBranch
      });
      if (!this.config?.autoMerge) {
        throw new Error(`Merge conflicts detected: ${conflicts.length} conflicts`);
      }
    }
    if (!options?.noCommit) {
      this.commit(`Merge branch '${branch}' into ${this.currentBranch}`);
    }
    this.emit("merge:complete", {
      from: branch,
      to: this.currentBranch,
      conflicts: conflicts.length
    });
  }
  resolveConflict(locale, key, resolution) {
    const conflict = this.mergeConflicts.find((c) => c.locale === locale && c.key === key);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      this.setTranslation(locale, key, resolution);
      const unresolvedCount = this.mergeConflicts.filter((c) => !c.resolved).length;
      this.emit("conflict:resolve", {
        locale,
        key,
        resolution,
        remaining: unresolvedCount
      });
      if (unresolvedCount === 0) {
        this.mergeConflicts = [];
        this.emit("conflict:all-resolved");
      }
    }
  }
  // History operations
  log(options) {
    const commits = [];
    let current = options?.branch ? this.branches.get(options.branch)?.head : this.head;
    while (current && commits.length < (options?.limit || 100)) {
      const commit = this.commits.get(current);
      if (!commit) break;
      if (options?.since && commit.timestamp < options.since) break;
      if (options?.author && commit.author !== options.author) {
        current = commit.parent;
        continue;
      }
      commits.push(commit);
      current = commit.parent;
    }
    return commits;
  }
  diff(from, to) {
    const fromCommit = from ? this.commits.get(from) : null;
    const toCommit = to ? this.commits.get(to) : this.commits.get(this.head);
    if (!toCommit) return [];
    const fromTree = fromCommit ? this.getTreeFromCommit(fromCommit.hash) : /* @__PURE__ */ new Map();
    const toTree = this.getTreeFromCommit(toCommit.hash);
    return this.calculateTreeDiff(fromTree, toTree);
  }
  blame(locale, key) {
    const blameInfo = [];
    let current = this.head;
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      const change = commit.changes.find((c) => c.locale === locale && c.key === key);
      if (change) {
        blameInfo.push({
          commit,
          line: change.newValue || ""
        });
      }
      current = commit.parent;
    }
    return blameInfo;
  }
  // Stash operations
  stash(message) {
    if (this.stagingArea.length === 0) {
      throw new Error("No changes to stash");
    }
    const stash = {
      id: this.generateHash(`stash${Date.now()}`),
      message: message || `WIP on ${this.currentBranch}`,
      timestamp: Date.now(),
      author: this.config?.author,
      changes: [...this.stagingArea],
      branch: this.currentBranch
    };
    this.stashes.push(stash);
    this.stagingArea = [];
    this.emit("stash:save", stash);
    return stash.id;
  }
  stashPop(index = 0) {
    if (index >= this.stashes.length) {
      throw new Error("Invalid stash index");
    }
    const stash = this.stashes[index];
    this.stagingArea = [...this.stagingArea, ...stash.changes];
    this.stashes.splice(index, 1);
    for (const change of stash.changes) {
      if (change.type === "delete") {
        this.deleteTranslation(change.locale, change.key);
      } else if (change.newValue) {
        this.setTranslation(change.locale, change.key, change.newValue);
      }
    }
    this.emit("stash:pop", stash);
  }
  stashList() {
    return [...this.stashes];
  }
  // Tag operations
  tag(name, options) {
    if (this.tags.has(name)) {
      throw new Error(`Tag '${name}' already exists`);
    }
    const tag = {
      name,
      commit: options?.commit || this.head,
      author: this.config?.author,
      timestamp: Date.now(),
      message: options?.message,
      signed: options?.signed
    };
    this.tags.set(name, tag);
    this.emit("tag:create", tag);
  }
  // Remote operations
  addRemote(name, url) {
    if (this.remotes.has(name)) {
      throw new Error(`Remote '${name}' already exists`);
    }
    const remote = {
      name,
      url,
      branches: /* @__PURE__ */ new Map(),
      lastFetch: 0
    };
    this.remotes.set(name, remote);
    this.emit("remote:add", remote);
  }
  fetch(remoteName = "origin") {
    return new Promise((resolve, reject) => {
      const remote = this.remotes.get(remoteName);
      if (!remote) {
        reject(new Error(`Remote '${remoteName}' not found`));
        return;
      }
      setTimeout(() => {
        remote.lastFetch = Date.now();
        this.emit("fetch:complete", {
          remote: remoteName
        });
        resolve();
      }, 1e3);
    });
  }
  push(remoteName = "origin", branch) {
    return new Promise((resolve, reject) => {
      const remote = this.remotes.get(remoteName);
      if (!remote) {
        reject(new Error(`Remote '${remoteName}' not found`));
        return;
      }
      const branchToPush = branch || this.currentBranch;
      const branchObj = this.branches.get(branchToPush);
      if (!branchObj) {
        reject(new Error(`Branch '${branchToPush}' not found`));
        return;
      }
      setTimeout(() => {
        remote.branches.set(branchToPush, branchObj.head);
        this.emit("push:complete", {
          remote: remoteName,
          branch: branchToPush
        });
        resolve();
      }, 1e3);
    });
  }
  pull(remoteName = "origin", branch) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          await this.fetch(remoteName);
          const remote = this.remotes.get(remoteName);
          const branchToPull = branch || this.currentBranch;
          const remoteHead = remote?.branches.get(branchToPull);
          if (remoteHead) {
            this.merge(`${remoteName}/${branchToPull}`);
          }
          this.emit("pull:complete", {
            remote: remoteName,
            branch: branchToPull
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
  // Cherry-pick
  cherryPick(commitHash) {
    const commit = this.commits.get(commitHash);
    if (!commit) {
      throw new Error(`Commit '${commitHash}' not found`);
    }
    for (const change of commit.changes) {
      if (change.type === "delete") {
        this.deleteTranslation(change.locale, change.key);
      } else if (change.newValue) {
        this.setTranslation(change.locale, change.key, change.newValue);
      }
    }
    this.commit(`Cherry-pick: ${commit.message}`, {
      author: commit.author,
      email: commit.email
    });
    this.emit("cherry-pick", {
      commit: commitHash
    });
  }
  // Rebase
  rebase(onto, options) {
    const targetBranch = this.branches.get(onto);
    if (!targetBranch) {
      throw new Error(`Branch '${onto}' not found`);
    }
    const commits = this.log({
      branch: this.currentBranch
    });
    const commonAncestor = this.findCommonAncestor(this.head, targetBranch.head);
    const commitsToRebase = commits.filter((c) => {
      let current = c.hash;
      while (current && current !== commonAncestor) {
        const commit = this.commits.get(current);
        current = commit?.parent || null;
      }
      return current !== commonAncestor;
    });
    this.checkout(onto);
    for (const commit of commitsToRebase.reverse()) {
      for (const change of commit.changes) {
        if (change.type === "delete") {
          this.deleteTranslation(change.locale, change.key);
        } else if (change.newValue) {
          this.setTranslation(change.locale, change.key, change.newValue);
        }
      }
      this.commit(commit.message, {
        author: commit.author,
        email: commit.email
      });
    }
    this.emit("rebase:complete", {
      onto,
      commits: commitsToRebase.length
    });
  }
  // Helper methods
  trackChange(change) {
    this.stagingArea = this.stagingArea.filter((c) => !(c.locale === change.locale && c.key === change.key));
    if (this.stagingArea.length >= this.maxStagingSize) {
      this.stagingArea.shift();
    }
    this.stagingArea.push(change);
  }
  generateHash(input) {
    return crypto.createHash("sha256").update(input).digest("hex").substring(0, 7);
  }
  generateTreeHash() {
    const treeContent = JSON.stringify(Array.from(this.workingTree.entries()));
    return this.generateHash(treeContent);
  }
  getCommit(hash) {
    return this.commits.get(hash);
  }
  loadTreeFromCommit(commitHash) {
    this.workingTree.clear();
    let current = commitHash;
    const changes = [];
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      changes.unshift(...commit.changes);
      current = commit.parent;
    }
    for (const change of changes) {
      if (!this.workingTree.has(change.locale)) {
        this.workingTree.set(change.locale, /* @__PURE__ */ new Map());
      }
      if (change.type === "delete") {
        this.workingTree.get(change.locale).delete(change.key);
      } else if (change.newValue) {
        this.workingTree.get(change.locale).set(change.key, change.newValue);
      }
    }
  }
  getTreeFromCommit(commitHash) {
    const tree = /* @__PURE__ */ new Map();
    let current = commitHash;
    const changes = [];
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      changes.unshift(...commit.changes);
      current = commit.parent;
    }
    for (const change of changes) {
      if (!tree.has(change.locale)) {
        tree.set(change.locale, /* @__PURE__ */ new Map());
      }
      if (change.type === "delete") {
        tree.get(change.locale).delete(change.key);
      } else if (change.newValue) {
        tree.get(change.locale).set(change.key, change.newValue);
      }
    }
    return tree;
  }
  calculateTreeDiff(fromTree, toTree) {
    const changes = [];
    for (const [locale, toKeys] of toTree) {
      const fromKeys = fromTree.get(locale);
      for (const [key, toValue] of toKeys) {
        const fromValue = fromKeys?.get(key);
        if (fromValue === void 0) {
          changes.push({
            type: "add",
            locale,
            key,
            newValue: toValue
          });
        } else if (fromValue !== toValue) {
          changes.push({
            type: "modify",
            locale,
            key,
            oldValue: fromValue,
            newValue: toValue,
            diff: this.calculateDiff(fromValue, toValue)
          });
        }
      }
    }
    for (const [locale, fromKeys] of fromTree) {
      const toKeys = toTree.get(locale);
      for (const [key, fromValue] of fromKeys) {
        if (!toKeys?.has(key)) {
          changes.push({
            type: "delete",
            locale,
            key,
            oldValue: fromValue
          });
        }
      }
    }
    return changes;
  }
  calculateDiff(oldValue, newValue) {
    const diff = {
      added: [],
      removed: [],
      context: []
    };
    if (!oldValue) {
      diff.added = newValue ? [newValue] : [];
    } else if (!newValue) {
      diff.removed = [oldValue];
    } else {
      const oldLines = oldValue.split("\n");
      const newLines = newValue.split("\n");
      diff.removed = oldLines.filter((l) => !newLines.includes(l));
      diff.added = newLines.filter((l) => !oldLines.includes(l));
      diff.context = newLines.filter((l) => oldLines.includes(l));
    }
    return diff;
  }
  findCommonAncestor(hash1, hash2) {
    const ancestors1 = /* @__PURE__ */ new Set();
    let current = hash1;
    while (current) {
      ancestors1.add(current);
      const commit = this.commits.get(current);
      current = commit?.parent || null;
    }
    current = hash2;
    while (current) {
      if (ancestors1.has(current)) {
        return current;
      }
      const commit = this.commits.get(current);
      current = commit?.parent || null;
    }
    return null;
  }
  performThreeWayMerge(base, ours, theirs, strategy) {
    const conflicts = [];
    const baseTree = base ? this.getTreeFromCommit(base) : /* @__PURE__ */ new Map();
    const ourTree = this.getTreeFromCommit(ours);
    const theirTree = this.getTreeFromCommit(theirs);
    const allKeys = /* @__PURE__ */ new Set();
    for (const [locale, keys] of [...ourTree, ...theirTree, ...baseTree]) {
      for (const key of keys.keys()) {
        allKeys.add(`${locale}:${key}`);
      }
    }
    for (const fullKey of allKeys) {
      const [locale, key] = fullKey.split(":");
      const baseValue = baseTree.get(locale)?.get(key);
      const ourValue = ourTree.get(locale)?.get(key);
      const theirValue = theirTree.get(locale)?.get(key);
      if (ourValue !== theirValue) {
        if (strategy === "ours") {
          if (ourValue) {
            this.setTranslation(locale, key, ourValue);
          }
        } else if (strategy === "theirs") {
          if (theirValue) {
            this.setTranslation(locale, key, theirValue);
          }
        } else {
          if (baseValue === ourValue) {
            if (theirValue) {
              this.setTranslation(locale, key, theirValue);
            }
          } else if (baseValue === theirValue) {
            if (ourValue) {
              this.setTranslation(locale, key, ourValue);
            }
          } else {
            conflicts.push({
              locale,
              key,
              ours: ourValue || "",
              theirs: theirValue || "",
              base: baseValue
            });
          }
        }
      }
    }
    return conflicts;
  }
  pruneOldCommits() {
    if (this.commits.size <= this.maxCommits) return;
    const sortedCommits = Array.from(this.commits.values()).sort((a, b) => a.timestamp - b.timestamp);
    const referencedCommits = /* @__PURE__ */ new Set();
    this.branches.forEach((branch) => {
      if (branch.head) referencedCommits.add(branch.head);
    });
    this.tags.forEach((tag) => {
      referencedCommits.add(tag.commit);
    });
    if (this.head) referencedCommits.add(this.head);
    const toRemove = sortedCommits.filter((c) => !referencedCommits.has(c.hash)).slice(0, Math.max(0, this.commits.size - this.maxCommits));
    toRemove.forEach((commit) => {
      this.commits.delete(commit.hash);
    });
  }
  limitStashes() {
    if (this.stashes.length > this.maxStashes) {
      this.stashes = this.stashes.slice(-this.maxStashes);
    }
  }
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.removeAllListeners();
    this.commits.clear();
    this.branches.clear();
    this.tags.clear();
    this.workingTree.clear();
    this.remotes.clear();
    this.stagingArea = [];
    this.stashes = [];
    this.mergeConflicts = [];
    this.head = null;
  }
  // Status and info
  status() {
    let ahead = 0;
    let behind = 0;
    const branch = this.branches.get(this.currentBranch);
    if (branch?.upstream) {
      const upstream = this.branches.get(branch.upstream);
      if (upstream) {
        let current = branch.head;
        while (current && current !== upstream.head) {
          ahead++;
          const commit = this.commits.get(current);
          current = commit?.parent || null;
        }
        current = upstream.head;
        while (current && current !== branch.head) {
          behind++;
          const commit = this.commits.get(current);
          current = commit?.parent || null;
        }
      }
    }
    return {
      branch: this.currentBranch,
      head: this.head,
      staged: this.stagingArea.length,
      conflicts: this.mergeConflicts.length,
      stashes: this.stashes.length,
      ahead,
      behind
    };
  }
  // Export/Import
  export() {
    const data = {
      commits: Array.from(this.commits.entries()),
      branches: Array.from(this.branches.entries()),
      tags: Array.from(this.tags.entries()),
      config: this.config,
      version: "1.0.0"
    };
    return JSON.stringify(data, null, 2);
  }
  import(data) {
    const parsed = JSON.parse(data);
    this.commits = new Map(parsed.commits);
    this.branches = new Map(parsed.branches);
    this.tags = new Map(parsed.tags);
    this.config = parsed.config;
    this.checkout("main");
    this.emit("import:complete");
  }
}
module.exports = {
  TranslationVersionControl
};
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=version-control.cjs.map
