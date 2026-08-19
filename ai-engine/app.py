"""
ProvAI Network — Academic AI Engine
=====================================
Enhancement: Weighted Truth-Discovery Consensus Engine

Replaces the baseline single-model IsolationForest with a 3-model ensemble:
  1. Isolation Forest  — statistical anomaly detection
  2. Local Outlier Factor (LOF) — density-based, catches Sybil clusters
  3. Z-Score baseline — pure mathematical sanity check

A Bayesian weight vector updates after every round: models that agree with
the final consensus gain weight, those that don't lose weight. This means
the engine dynamically learns which model is most accurate for the current
data distribution over time.

New endpoints:
  POST /verify          — weighted 3-model consensus with full reasoning trace
  POST /simulate-attack — adversarial Sybil / random / coordinated attack sim
  POST /zk-verify       — ZK-Light source authenticity proof (simulated Groth16)
  GET  /health          — health check
  GET  /weights         — inspect current Bayesian model weights
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
import hashlib
import time

app = Flask(__name__)
CORS(app)

# ─── Bayesian Model Weight State ──────────────────────────────────────────────
# Weights update after every /verify call based on agreement with consensus.
# Starts uniform; converges toward the most accurate model per data distribution.
model_weights = {
    "isolation_forest": 0.40,
    "lof":              0.35,
    "zscore":           0.25,
}

# ─── Trusted ZK-Light Sources ─────────────────────────────────────────────────
TRUSTED_SOURCES = {
    "weather_api_v2":  {"name": "OpenWeather API v2",       "trust_level": "HIGH"},
    "chainlink_btc":   {"name": "Chainlink BTC/USD Feed",   "trust_level": "HIGH"},
    "coinbase_eth":    {"name": "Coinbase ETH/USD Feed",    "trust_level": "HIGH"},
    "custom_sensor":   {"name": "Custom IoT Sensor",        "trust_level": "MEDIUM"},
    "coingecko_sol":   {"name": "CoinGecko SOL/USD Feed",   "trust_level": "HIGH"},
}


# ─── Model Helpers ────────────────────────────────────────────────────────────

def zscore_detect(values):
    """
    Robust MAD-based z-score detection (Iglewicz & Hoaglin 1993).

    Standard z-score is non-robust: a large outlier inflates mean AND std,
    so its own z-score ends up small and it hides itself (masking effect).

    MAD-based z-score uses the median and median absolute deviation — both
    are completely unaffected by outliers — so a value like 500 in
    [99, 100, 101, 102, 500] scores ~67σ instead of ~2σ.

    Threshold: 3.5 (Iglewicz & Hoaglin standard for MAD-based scores).
    """
    arr = np.array(values, dtype=float)
    median = np.median(arr)
    mad = np.median(np.abs(arr - median))

    if mad < 1e-9:
        # All values identical or near-identical — fall back to std z-score
        std = np.std(arr)
        if std < 1e-9:
            return [1] * len(values), [0.0] * len(values)
        zs = np.abs((arr - median) / std)
    else:
        # 0.6745 = 1 / Φ⁻¹(3/4), scales MAD to be consistent with std
        zs = 0.6745 * np.abs(arr - median) / mad

    labels = [1 if z <= 3.5 else -1 for z in zs]
    return labels, zs.tolist()


def normalize(scores):
    """Min-max normalize a list to [0, 1]; higher = more normal."""
    arr = np.array(scores, dtype=float)
    lo, hi = arr.min(), arr.max()
    if hi - lo < 1e-9:
        return [1.0] * len(scores)
    return ((arr - lo) / (hi - lo)).tolist()


# ─── Weighted Consensus ───────────────────────────────────────────────────────

def weighted_vote(if_labels, lof_labels, z_labels, weights):
    """Combine three binary vote arrays using current model weights."""
    labels = []
    for i in range(len(if_labels)):
        score = (
            weights["isolation_forest"] * (1 if if_labels[i] == 1 else 0)
            + weights["lof"]            * (1 if lof_labels[i] == 1 else 0)
            + weights["zscore"]         * (1 if z_labels[i]  == 1 else 0)
        )
        labels.append(1 if score >= 0.5 else -1)
    return labels


def update_weights(model_votes_map, final_labels):
    """Bayesian weight update: reward accuracy, penalise disagreement."""
    global model_weights
    lr = 0.06
    for name, votes in model_votes_map.items():
        agreement = sum(1 for mv, fl in zip(votes, final_labels) if mv == fl)
        rate = agreement / max(len(final_labels), 1)
        delta = lr * (rate - 0.5) * 2          # [-0.12, +0.12]
        model_weights[name] = max(0.10, min(0.70, model_weights[name] + delta))
    # Re-normalise
    total = sum(model_weights.values())
    for k in model_weights:
        model_weights[k] = round(model_weights[k] / total, 4)


# ─── Deviation Severity (for smart-contract slashing) ─────────────────────────

def calc_deviation_severity_bps(values, final_labels):
    """
    Compute the worst-outlier deviation relative to the consensus median,
    expressed in basis points (0–10000) for the slashNode() contract call.
      > 50% deviation from median → 10000 bps (100% slash)
    """
    valid_vals = [v for v, fl in zip(values, final_labels) if fl == 1]
    if not valid_vals:
        return 10000
    median = float(np.median(valid_vals))
    if abs(median) < 1e-9:
        return 0
    max_dev = max(
        (abs(v - median) / abs(median) for v, fl in zip(values, final_labels) if fl == -1),
        default=0.0,
    )
    return min(10000, int(max_dev * 20000))


# ─── Core Consensus Engine ────────────────────────────────────────────────────

def run_consensus(data_points):
    """
    Run the 3-model weighted truth-discovery pipeline and return a full
    reasoning trace with per-node scores, model votes, and Bayesian weights.
    """
    values = [float(v) for v in data_points]
    n = len(values)
    X = np.array(values).reshape(-1, 1)

    # Model 1 — Isolation Forest
    if_model = IsolationForest(contamination=0.2, random_state=42)
    if_labels = if_model.fit_predict(X).tolist()
    if_scores_norm = normalize(if_model.score_samples(X).tolist())

    # Model 2 — Local Outlier Factor
    k = min(5, n - 1)
    lof_model = LocalOutlierFactor(n_neighbors=k, contamination=0.2)
    lof_labels = lof_model.fit_predict(X).tolist()
    lof_scores_norm = normalize(lof_model.negative_outlier_factor_.tolist())

    # Model 3 — Z-Score
    z_labels, z_scores = zscore_detect(values)

    # Weighted consensus vote
    final_labels = weighted_vote(if_labels, lof_labels, z_labels, model_weights)

    # Update Bayesian weights for next round
    votes_map = {
        "isolation_forest": if_labels,
        "lof":              lof_labels,
        "zscore":           z_labels,
    }
    update_weights(votes_map, final_labels)

    # Build per-node reasoning trace
    reasoning_trace = []
    for i in range(n):
        status = "valid" if final_labels[i] == 1 else "outlier"
        reasons = []
        if z_scores[i] > 2.5:
            reasons.append(f"Z-score {z_scores[i]:.2f} exceeds 2.5σ threshold")
        if if_labels[i] == -1:
            reasons.append(f"Isolation Forest: anomaly (normalised score {if_scores_norm[i]:.2f})")
        if lof_labels[i] == -1:
            reasons.append(f"LOF: density deviation detected (normalised score {lof_scores_norm[i]:.2f})")

        reasoning_trace.append({
            "node":      i + 1,
            "value":     values[i],
            "status":    status,
            "z_score":   round(z_scores[i], 3),
            "if_score":  round(if_scores_norm[i], 3),
            "lof_score": round(lof_scores_norm[i], 3),
            "reason":    "; ".join(reasons) if reasons else "All models: within normal bounds",
        })

    # Final consensus value
    valid_vals = [v for v, fl in zip(values, final_labels) if fl == 1]
    if not valid_vals:
        return {
            "consensus_reached":      False,
            "final_value":            None,
            "confidence":             0,
            "node_count":             n,
            "valid_count":            0,
            "outlier_count":          n,
            "model_votes":            {k: False for k in model_weights},
            "model_weights":          dict(model_weights),
            "reasoning_trace":        reasoning_trace,
            "deviation_severity_bps": 10000,
        }

    final_value = float(np.median(valid_vals))

    # ── Multi-factor confidence score ──────────────────────────────────────
    # Confidence measures how certain we are that final_value is correct,
    # NOT simply what fraction of nodes were valid.  If the system correctly
    # detects and removes outliers, the remaining cluster can still yield
    # high confidence.
    valid_arr    = np.array(valid_vals, dtype=float)
    valid_median = float(np.median(valid_arr))

    # Factor 1 — Cluster tightness (50% weight)
    # Uses MAD (median absolute deviation) — robust to single stragglers.
    # A MAD/median ratio < 0.01 means near-perfect agreement → tightness ≈ 1.0
    if abs(valid_median) > 1e-9 and len(valid_arr) > 1:
        mad       = float(np.median(np.abs(valid_arr - valid_median)))
        mad_ratio = mad / abs(valid_median)
        tightness = float(np.clip(1.0 - (mad_ratio / 0.10), 0.0, 1.0))
    else:
        tightness = 1.0

    # Factor 2 — Sample sufficiency (25% weight)
    # Need at least 3 valid nodes for statistical robustness
    sample_score = min(1.0, len(valid_arr) / max(3, n * 0.5))

    # Factor 3 — Model agreement (25% weight)
    # How many of the 3 models voted majority-valid?
    model_agree_count = sum(
        1 for labels in [if_labels, lof_labels, z_labels]
        if sum(1 for l in labels if l == 1) > n / 2
    )
    model_agreement = model_agree_count / 3

    confidence = (0.50 * tightness + 0.25 * sample_score + 0.25 * model_agreement) * 100

    dev_bps     = calc_deviation_severity_bps(values, final_labels)

    return {
        "consensus_reached": True,
        "final_value":       round(final_value, 4),
        "confidence":        round(confidence, 2),
        "node_count":        n,
        "valid_count":       len(valid_vals),
        "outlier_count":     n - len(valid_vals),
        "model_votes": {
            "isolation_forest": sum(1 for l in if_labels  if l == 1) > n / 2,
            "lof":              sum(1 for l in lof_labels if l == 1) > n / 2,
            "zscore":           sum(1 for l in z_labels   if l == 1) > n / 2,
        },
        "model_weights":          {k: round(v, 4) for k, v in model_weights.items()},
        "reasoning_trace":        reasoning_trace,
        "deviation_severity_bps": dev_bps,
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_weights": model_weights})


@app.route('/weights', methods=['GET'])
def get_weights():
    """Inspect current Bayesian model weights."""
    return jsonify({"model_weights": model_weights})


@app.route('/verify', methods=['POST'])
def verify_endpoint():
    """3-model weighted truth-discovery consensus."""
    body = request.json or {}
    submissions = body.get('node_data', [])

    if not submissions:
        return jsonify({"error": "No data provided"}), 400
    if len(submissions) < 2:
        return jsonify({"error": "At least 2 data points required for consensus"}), 400

    return jsonify(run_consensus(submissions))


@app.route('/simulate-attack', methods=['POST'])
def simulate_attack():
    """
    Adversarial Network Simulation.

    Injects synthetic malicious nodes according to the chosen attack strategy,
    then measures how well the 3-model ensemble detects them. This generates
    the empirical data needed for the research paper's evaluation section.

    attack_type:
      "sybil"       — many nodes report the same manipulated value
      "random"      — random noise injection
      "coordinated" — gradual drift to push consensus without triggering outlier filters
    """
    body = request.json or {}
    honest_data = body.get('node_data', [])
    attack_type = body.get('attack_type', 'sybil')
    intensity   = int(body.get('intensity', 5))   # 1–10

    if len(honest_data) < 2:
        return jsonify({"error": "Need at least 2 honest data points"}), 400

    honest_arr  = np.array(honest_data, dtype=float)
    honest_mean = float(np.mean(honest_arr))
    honest_std  = float(np.std(honest_arr)) or 1.0
    num_attackers = max(1, intensity // 2)

    rng = np.random.default_rng(seed=42)

    if attack_type == 'sybil':
        # Sybil: many clones reporting a wrong but internally consistent value
        fake = honest_mean * (1 + intensity * 0.4)
        malicious = (fake + rng.normal(0, 0.5, num_attackers)).tolist()

    elif attack_type == 'random':
        # Random noise: unpredictable garbage submissions
        malicious = rng.uniform(honest_mean * 0.1, honest_mean * 4, num_attackers).tolist()

    elif attack_type == 'coordinated':
        # Coordinated: subtle drift designed to evade naive outlier detection
        target = honest_mean * (1 + intensity * 0.15)
        malicious = (target + rng.normal(0, honest_std * 0.3, num_attackers)).tolist()

    else:
        malicious = []

    malicious = [round(v, 2) for v in malicious]
    all_data   = [float(v) for v in honest_data] + malicious

    result = run_consensus(all_data)
    trace  = result.get('reasoning_trace', [])

    n_honest    = len(honest_data)
    n_malicious = len(malicious)

    outlier_idxs   = {t['node'] - 1 for t in trace if t['status'] == 'outlier'}
    malicious_idxs = set(range(n_honest, n_honest + n_malicious))

    true_positives  = len(outlier_idxs & malicious_idxs)
    false_positives = len(outlier_idxs - malicious_idxs)
    false_negatives = len(malicious_idxs - outlier_idxs)

    detection_rate   = round(true_positives  / max(n_malicious, 1) * 100, 1)
    false_pos_rate   = round(false_positives / max(n_honest,    1) * 100, 1)

    consensus_corrupted = (
        result.get('final_value') is not None
        and abs(result['final_value'] - honest_mean) / (abs(honest_mean) + 1e-9) > 0.10
    )

    return jsonify({
        "attack_type":          attack_type,
        "intensity":            intensity,
        "honest_count":         n_honest,
        "malicious_count":      n_malicious,
        "malicious_values":     malicious,
        "detection_rate":       detection_rate,
        "false_positive_rate":  false_pos_rate,
        "true_positives":       true_positives,
        "false_negatives":      false_negatives,
        "consensus_corrupted":  consensus_corrupted,
        "consensus_value":      result.get('final_value'),
        "honest_mean":          round(honest_mean, 2),
        "reasoning_trace":      trace,
        "model_weights":        result.get('model_weights', {}),
        "deviation_severity_bps": result.get('deviation_severity_bps', 0),
    })


@app.route('/zk-verify', methods=['POST'])
def zk_verify():
    """
    ZK-Light Source Authentication.

    Proves that a node actually queried a trusted data source and obtained
    a specific value — WITHOUT revealing the node's API key.

    In production this would use a real zk-SNARK circuit (Groth16 / PLONK).
    Here we simulate the commitment scheme and proof structure so the UI can
    demonstrate the concept end-to-end.
    """
    body       = request.json or {}
    source_tag = body.get('source_tag', '')
    value      = body.get('value', 0)

    if source_tag not in TRUSTED_SOURCES:
        return jsonify({
            "verified":        False,
            "error":           f"Unknown source tag: '{source_tag}'",
            "trusted_sources": list(TRUSTED_SOURCES.keys()),
        }), 400

    info = TRUSTED_SOURCES[source_tag]

    # ── Simulated ZK commitment ────────────────────────────────────────────────
    # commitment = H(source_tag || value || time_window)
    # The time_window (60-s buckets) prevents replay attacks without revealing
    # the exact query timestamp.
    time_window      = int(time.time() // 60)
    preimage         = f"{source_tag}:{value}:{time_window}"
    commitment       = hashlib.sha256(preimage.encode()).hexdigest()

    # Simulated Groth16 proof components (π_a, π_b, π_c)
    proof = {
        "\u03c0_a": hashlib.sha256(f"a:{commitment}".encode()).hexdigest()[:32],
        "\u03c0_b": hashlib.sha256(f"b:{commitment}".encode()).hexdigest()[:32],
        "\u03c0_c": hashlib.sha256(f"c:{commitment}".encode()).hexdigest()[:32],
    }

    public_inputs = {
        "source_hash":       hashlib.sha256(source_tag.encode()).hexdigest()[:16],
        "value_commitment":  hashlib.sha256(str(value).encode()).hexdigest()[:16],
        "time_window":       time_window,
    }

    return jsonify({
        "verified":       True,
        "source_name":    info["name"],
        "trust_level":    info["trust_level"],
        "proof":          proof,
        "public_inputs":  public_inputs,
        "api_key_revealed": False,
        "commitment":     commitment[:24] + "…",
        "proof_type":     "ZK-Light (SHA-256 commitment + simulated Groth16)",
        "note":           "Production: zk-SNARK circuit proves source authenticity without revealing credentials.",
    })


if __name__ == '__main__':
    app.run(port=5001, debug=True)
