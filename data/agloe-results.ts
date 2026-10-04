// Generated from the Agloe repository's result files (github.com/premxai/agloe). Do not edit by hand.
export const agloe = {
  "runs": 7265,
  "cells": 231,
  "families": 8,
  "costUsd": 67,
  "incident": {
    "bestTop1": 16.2,
    "noCarrier": 56.0,
    "adopters": 2976,
    "behaviours": 35,
    "naiveCalls": 1001,
    "trustedCalls": 385,
    "crossNaive": 23,
    "crossVerified": 3
  },
  "visibility": [
    {
      "label": "Real incident: reads not logged",
      "value": 16.2,
      "note": "best case for a perfect investigator",
      "ours": false
    },
    {
      "label": "AI Village chat split into rooms",
      "value": 97.0,
      "note": "30 weeks, 16,274 copies",
      "ours": true
    },
    {
      "label": "AI Village one shared chat",
      "value": 100.0,
      "note": "47 weeks, 10,880 copies",
      "ours": true
    }
  ],
  "benchmark": [
    {
      "method": "A random earlier writer",
      "top1": 11.1,
      "top1Ci": [
        9.2,
        13.0
      ],
      "falseAccusation": 82.1,
      "falseAccusationCi": [
        75.3,
        88.5
      ],
      "ours": false
    },
    {
      "method": "The latest writer",
      "top1": 14.6,
      "top1Ci": [
        7.2,
        23.7
      ],
      "falseAccusation": 82.1,
      "falseAccusationCi": [
        75.3,
        88.5
      ],
      "ours": false
    },
    {
      "method": "The earliest writer",
      "top1": 35.3,
      "top1Ci": [
        28.5,
        42.3
      ],
      "falseAccusation": 82.1,
      "falseAccusationCi": [
        75.3,
        88.5
      ],
      "ours": false
    },
    {
      "method": "Trap streets (token, else earliest)",
      "top1": 70.5,
      "top1Ci": [
        62.5,
        77.1
      ],
      "falseAccusation": 6.7,
      "falseAccusationCi": [
        4.3,
        10.0
      ],
      "ours": true
    }
  ],
  "benchmarkRuns": 150,
  "models": [
    {
      "name": "Qwen3.5-397B",
      "rule": 32.0,
      "tokens": 100.0,
      "lift": 68,
      "tokenKept": 82.0,
      "copies": 50
    },
    {
      "name": "Qwen3-235B",
      "rule": 42.0,
      "tokens": 99.0,
      "lift": 58,
      "tokenKept": 100.0,
      "copies": 1110
    },
    {
      "name": "Hermes-4-405B",
      "rule": 43.0,
      "tokens": 100.0,
      "lift": 57,
      "tokenKept": 100.0,
      "copies": 35
    },
    {
      "name": "MiniMax-M3",
      "rule": 71.0,
      "tokens": 88.0,
      "lift": 18,
      "tokenKept": 29.0,
      "copies": 147
    },
    {
      "name": "DeepSeek-V4-Pro",
      "rule": 72.0,
      "tokens": 88.0,
      "lift": 16,
      "tokenKept": 36.0,
      "copies": 148
    },
    {
      "name": "Kimi-K3",
      "rule": 75.0,
      "tokens": 83.0,
      "lift": 8,
      "tokenKept": 18.0,
      "copies": 159
    },
    {
      "name": "GLM-5.2",
      "rule": 80.0,
      "tokens": 79.0,
      "lift": -1,
      "tokenKept": 9.0,
      "copies": 156
    }
  ],
  "gated": [
    {
      "name": "GLM-5.2",
      "open": 25.0,
      "gated": 100.0,
      "doneOpen": 97.0,
      "doneGated": 100.0
    },
    {
      "name": "DeepSeek-V4-Pro",
      "open": 30.0,
      "gated": 100.0,
      "doneOpen": 87.0,
      "doneGated": 100.0
    },
    {
      "name": "MiniMax-M3",
      "open": 33.0,
      "gated": 100.0,
      "doneOpen": 95.0,
      "doneGated": 100.0
    },
    {
      "name": "Kimi-K3",
      "open": 50.0,
      "gated": 100.0,
      "doneOpen": 100.0,
      "doneGated": 100.0
    },
    {
      "name": "Qwen3-235B",
      "open": 100.0,
      "gated": 100.0,
      "doneOpen": 100.0,
      "doneGated": 100.0
    }
  ],
  "recheckMid": {
    "runs": 50,
    "outputs": 1454,
    "reached": 127,
    "rows": [
      {
        "label": "Re-run everything",
        "share": 100.0,
        "found": 100.0,
        "precision": 9.0
      },
      {
        "label": "Everything submitted after the tip",
        "share": 83.0,
        "found": 100.0,
        "precision": 10.0
      },
      {
        "label": "Follow the earliest writer",
        "share": 9.0,
        "found": 92.0,
        "precision": 85.0
      },
      {
        "label": "Follow the trace (token, else earliest)",
        "share": 8.0,
        "found": 88.0,
        "precision": 100.0
      },
      {
        "label": "Follow the token only",
        "share": 7.0,
        "found": 76.0,
        "precision": 100.0
      }
    ]
  },
  "recheckEarly": {
    "runs": 34,
    "outputs": 984,
    "reached": 792,
    "rows": [
      {
        "label": "Re-run everything",
        "share": 100.0,
        "found": 100.0,
        "precision": 80.0
      },
      {
        "label": "Everything submitted after the tip",
        "share": 100.0,
        "found": 100.0,
        "precision": 80.0
      },
      {
        "label": "Follow the earliest writer",
        "share": 80.0,
        "found": 100.0,
        "precision": 100.0
      },
      {
        "label": "Follow the trace (token, else earliest)",
        "share": 80.0,
        "found": 100.0,
        "precision": 100.0
      },
      {
        "label": "Follow the token only",
        "share": 59.0,
        "found": 74.0,
        "precision": 100.0
      }
    ]
  }
} as const;
