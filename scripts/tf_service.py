#!/usr/bin/env python3
"""
Minimal TF helper for fallback mode.
Accepts newline-delimited JSON commands on stdin and writes JSON responses to stdout.
Commands:
  {"cmd":"train","payload":{...}}
  {"cmd":"infer","payload":{...}}

This script intentionally provides a very small interface so the Node.js manager
can spawn it as a helper. It does not require TensorFlow to be installed; if TF is
present it can be used to do real work.
"""
import sys
import json
import time

instances = {}

def send(resp):
    sys.stdout.write(json.dumps(resp) + "\n")
    sys.stdout.flush()

def handle(line):
    try:
        obj = json.loads(line)
    except Exception as e:
        send({"ok": False, "error": "invalid_json", "message": str(e)})
        return

    cmd = obj.get('cmd')
    inst = obj.get('instance') or 'default'

    if cmd == 'train':
        payload = obj.get('payload', {})
        # naive: store payload as training data
        instances.setdefault(inst, {}).setdefault('training', []).append(payload)
        send({"ok": True, "instance": inst, "queued": True})
        return

    if cmd == 'infer' or cmd == 'predict':
        payload = obj.get('payload', {})
        # very small heuristic: echo back keys and mark missing fields
        required = payload.get('required', [])
        result = {k: payload.get(k, None) for k in payload.get('input', {})}
        missing = [r for r in required if result.get(r) in (None, '')]
        send({"ok": True, "instance": inst, "prediction": {"missing_fields": missing, "example_fill": {}}})
        return

    if cmd == 'status':
        send({"ok": True, "instances": list(instances.keys())})
        return

    send({"ok": False, "error": "unknown_cmd", "cmd": cmd})

def main():
    send({"ok": True, "message": "tf_service ready"})
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        handle(line)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        send({"ok": False, "error": "fatal", "message": str(e)})
        sys.exit(1)
