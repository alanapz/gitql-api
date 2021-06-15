#!/bin/bash

set -euo pipefail

NAME="$(basename $(dirname $(realpath "$0")))"
TAG="alanmpinder/${NAME}:$(date +'%Y%m%d')"
LTAG="alanmpinder/${NAME}:latest"

echo "Name: ${NAME}, Tag: ${TAG}"

cat Dockerfile | docker image build --tag "${TAG}" -
docker image push "${TAG}"

docker tag "${TAG}" "${LTAG}"
docker image push "${LTAG}"

echo "Remember to update version in gitql-api !"
