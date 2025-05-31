#!/bin/bash

cd "$(dirname "$0")/data" || exit 1

mkdir -p images

# Loop over all directories, even with special characters
find . -maxdepth 1 -type d -name "*_files" | while read -r dir; do
  find "$dir" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.webp' \) -exec mv -n {} images/ \;
done

echo "✅ All image files moved to 'scripts/data/images'"