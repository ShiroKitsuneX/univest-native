#!/bin/bash
cd /Users/App/repos/univest-native
git add .gitignore
git add -A
git commit -m "$(date '+%Y-%m-%d %H:%M') Latest changes"
git push
