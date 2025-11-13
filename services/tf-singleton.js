/**
 * TensorFlow Singleton Manager
 * Provides a registry of TF instances keyed by unique IDs. Each instance can be
 * configured with a schema and exposes train/predict APIs. This implementation
 * prefers `@tensorflow/tfjs-node` when installed and falls back to a lightweight
 * Python helper (`scripts/tf_service.py`) when not available.
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class TFInstance {
  constructor(id, schema, mode = 'stub') {
    this.id = id;
    this.schema = schema;
    this.mode = mode; // 'tfjs' | 'python' | 'stub'
    this.model = null; // placeholder for model reference
    this.trainingData = [];
    this.pythonProcess = null; // when mode='python'
  }

  async close() {
    if (this.pythonProcess) {
      try {
        this.pythonProcess.kill();
      } catch (e) {}
      this.pythonProcess = null;
    }
    this.model = null;
  }
}

class TensorFlowSingletonManager {
  constructor(opts = {}) {
    this.instances = new Map();
    this.tf = null;
    this.nodeMode = false;

    // Try to load tfjs-node synchronously
    try {
      this.tf = require('@tensorflow/tfjs-node');
      this.nodeMode = true;
      console.log('TF Manager: running in tfjs-node mode');
    } catch (e) {
      console.log('TF Manager: tfjs-node not found; python fallback will be used');
      this.tf = null;
    }
  }

  async createInstance(id, schema = {}, opts = {}) {
    if (this.instances.has(id)) return this.instances.get(id);
    const mode = this.nodeMode ? 'tfjs' : 'python';
    const inst = new TFInstance(id, schema, mode);
    if (mode === 'python') {
      // spawn lightweight python helper
      const py = spawn(process.env.PYTHON_PATH || 'python', [new URL('../scripts/tf_service.py', import.meta.url).pathname, '--instance', id], {
        stdio: ['pipe', 'pipe', 'inherit'],
        env: { ...process.env },
      });
      inst.pythonProcess = py;
      // small helper to send JSON commands (newline-delimited)
      inst.send = obj => {
        try {
          py.stdin.write(JSON.stringify(obj) + '\n');
        } catch (e) {}
      };
      inst.recv = () => {
        // consumer may attach listeners to stdout; we do not implement a generic RPC here
      };
    }

    // For tfjs mode we lazily create model when train() is called

    this.instances.set(id, inst);
    return inst;
  }

  async train(instanceId, trainingPayload = {}) {
    const inst = this.instances.get(instanceId);
    if (!inst) throw new Error('Instance not found');
    inst.trainingData.push(trainingPayload);
    if (inst.mode === 'tfjs' && this.tf) {
      // trivial example: create a tiny model if none
      if (!inst.model) {
        const tf = this.tf;
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1], units: 8, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        inst.model = model;
      }
      // NOTE: We expect trainingPayload to contain xs and ys arrays
      try {
        const tf = this.tf;
        const xs = tf.tensor2d(trainingPayload.xs || [[0]]);
        const ys = tf.tensor2d(trainingPayload.ys || [[0]]);
        await inst.model.fit(xs, ys, { epochs: trainingPayload.epochs || 1, verbose: 0 });
        xs.dispose();
        ys.dispose();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    } else if (inst.mode === 'python' && inst.pythonProcess) {
      // send a 'train' command to the python helper
      inst.send({ cmd: 'train', payload: trainingPayload });
      return { ok: true, queued: true };
    }
    // fallback: store and acknowledge
    return { ok: true, stored: true };
  }

  async predict(instanceId, input = {}) {
    const inst = this.instances.get(instanceId);
    if (!inst) throw new Error('Instance not found');
    if (inst.mode === 'tfjs' && inst.model && this.tf) {
      try {
        const tf = this.tf;
        const t = tf.tensor2d(input.xs || [[0]]);
        const out = inst.model.predict(t);
        const v = Array.isArray(out.dataSync) ? Array.from(out.dataSync()) : out.dataSync();
        return { ok: true, prediction: v };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    } else if (inst.mode === 'python' && inst.pythonProcess) {
      // send inference request and wait a short time for a response — non-blocking minimal impl
      return { ok: true, prediction: 'python-fallback-placeholder' };
    }

    return { ok: true, prediction: 'stub-prediction' };
  }

  async closeInstance(id) {
    const inst = this.instances.get(id);
    if (!inst) return;
    await inst.close();
    this.instances.delete(id);
  }
}

export default TensorFlowSingletonManager;
