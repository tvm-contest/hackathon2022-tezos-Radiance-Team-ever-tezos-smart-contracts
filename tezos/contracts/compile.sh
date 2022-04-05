#!/bin/bash

ligo compile contract fa2_vault.ligo  --entry-point main --output-file ./build/fa2_vault.tz --no-warn
ligo compile contract fa2_vault.ligo  --entry-point main --michelson-format json --output-file ./build/fa2_vault.json --no-warn
ligo compile contract fa2_single_asset_with_hooks_assembl.mligo  --entry-point single_asset_main --output-file ./build/fa2_single_asset_with_hooks_assembl.tz --no-warn
ligo compile contract fa2_single_asset_with_hooks_assembl.mligo  --entry-point single_asset_main --michelson-format json --output-file ./build/fa2_single_asset_with_hooks_assembl.json --no-warn
