#!/bin/bash
# Push script — reads token from env file
set -e
cd /home/hermeswebui/projects/opays/opays-hq
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/Lamsasiri/Opays-HQ.git"
git push -u origin main
