const faiss = require('faiss-node');

class FaissRetriever {
  constructor() {
    this.index = null;
  }

  async initialize(dimensions) {
    this.index = new faiss.IndexFlatL2(dimensions);
  }

  async addData(vectors) {
    if (!this.index) {
      throw new Error('FAISS index not initialized. Call initialize() first.');
    }
    this.index.add(vectors);
  }

  async search(queryVector, topK) {
    if (!this.index) {
      throw new Error('FAISS index not initialized. Call initialize() first.');
    }
    return this.index.search(queryVector, topK);
  }
}

module.exports = FaissRetriever;