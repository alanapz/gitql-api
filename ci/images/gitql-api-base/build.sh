#!/bin/bash

set -euo pipefail

NAME="$(basename $(dirname $(realpath "$0")))"
TAG="alanmpinder/${NAME}:$(date +'%Y%m%d')"

echo "Name: ${NAME}, Tag: ${TAG}"

# Rebuild docker (- as no build context)
cat Dockerfile | docker image build --tag "${TAG}" -

# Push new version
docker image push "${TAG}"

echo "Remember to update version in gitql-api !"