#!/bin/bash

version=$(./tool/shjp ./package.json -t version)
ghtoken=$(cat ./.ghtoken)
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $ghtoken" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/begyyal/xjs_common/actions/workflows/publish.yml/dispatches \
  -d '{"ref":"main", "inputs":{"version":"'$version'"}}'
