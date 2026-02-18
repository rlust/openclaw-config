#!/usr/bin/env python3
"""
PGN Discovery Monitor — Log Unknown/Undecoded PGNs

Watches the rvc_decoder output for:
1. Messages from unknown PGNs (not in the decoder map)
2. Decoding errors or null returns
3. New instance numbers for known PGNs

Outputs to: pgn-discovery.jsonl (append mode)
Format: {"pgn": "0x1FXXX", "source": X, "data": "...", "timestamp": ..., "status": "unknown|error|new_instance"}

Usage:
  python3 pgn-discovery-monitor.py [--log-file /path/to/rvc.jsonl] [--output pgn-discovery.jsonl]
  
  # Tail the live output:
  tail -f pgn-discovery.jsonl | jq .
"""

import json
import logging
import argparse
import sys
from datetime import datetime, timezone
from collections import defaultdict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(
        description="Monitor RV-C Bridge for undecoded PGNs"
    )
    parser.add_argument(
        "--log-file",
        default="/var/log/rvc_decoder.jsonl",
        help="Path to rvc_decoder.jsonl (input)",
    )
    parser.add_argument(
        "--output",
        default="pgn-discovery.jsonl",
        help="Path to write discovery log (output)",
    )
    args = parser.parse_args()

    log.info(f"Reading from: {args.log_file}")
    log.info(f"Writing to: {args.output}")

    known_pgns = set()
    known_instances = defaultdict(set)  # pgn -> set of seen instance numbers

    try:
        with open(args.log_file, "r") as infile:
            for line in infile:
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue

                pgn = record.get("pgn")
                source = record.get("source")
                data = record.get("data")
                decoded = record.get("decoded")
                timestamp = record.get("timestamp", datetime.now(timezone.utc).timestamp())

                if not pgn or not data:
                    continue

                # Track which PGNs we've seen
                known_pgns.add(pgn)

                # Check if decoding failed (decoded is None or error flag)
                if decoded is None or decoded.get("error"):
                    discovery_record = {
                        "pgn": pgn,
                        "source": source,
                        "data": data,
                        "timestamp": timestamp,
                        "status": "error_or_unknown",
                    }
                    log.warning(f"Unknown/Error PGN: {pgn} from source {source}")
                    with open(args.output, "a") as outfile:
                        outfile.write(json.dumps(discovery_record) + "\n")
                else:
                    # Track instance numbers to detect new ones
                    if isinstance(decoded, dict):
                        instance = decoded.get("instance")
                        if instance is not None:
                            if (
                                instance
                                not in known_instances[pgn]
                            ):
                                known_instances[pgn].add(instance)
                                discovery_record = {
                                    "pgn": pgn,
                                    "source": source,
                                    "instance": instance,
                                    "data": data,
                                    "decoded": decoded,
                                    "timestamp": timestamp,
                                    "status": "new_instance",
                                }
                                log.info(
                                    f"New instance: {pgn} instance={instance}"
                                )
                                with open(args.output, "a") as outfile:
                                    outfile.write(
                                        json.dumps(discovery_record) + "\n"
                                    )

    except FileNotFoundError:
        log.error(f"Log file not found: {args.log_file}")
        sys.exit(1)
    except KeyboardInterrupt:
        log.info("Interrupted")
        sys.exit(0)

    log.info(
        f"Discovered {len(known_pgns)} PGNs, {sum(len(v) for v in known_instances.values())} instances"
    )


if __name__ == "__main__":
    main()
