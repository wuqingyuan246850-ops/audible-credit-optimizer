#!/usr/bin/env python3
"""
Audible Credit Optimizer — Master Build Script

Orchestrates: fetch data from API -> generate static site -> ready for deploy.
"""

import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent


def main():
    sys.path.insert(0, str(SCRIPTS_DIR))

    from importlib import import_module

    steps = [
        ("Fetch Data", "fetch_books"),
        ("Generate Site", "generate_site"),
    ]

    for name, module_name in steps:
        print(f"\n{'='*60}")
        print(f"  Step: {name}")
        print(f"{'='*60}")
        try:
            mod = import_module(module_name)
            mod.main() if hasattr(mod, "main") else mod.build_site()
        except Exception as e:
            print(f"  [ERROR] {name} failed: {e}")
            return False

    print(f"\n{'='*60}")
    print(f"  Build complete! Site is in the 'output/' directory.")
    print(f"{'='*60}")
    return True


if __name__ == "__main__":
    main()
