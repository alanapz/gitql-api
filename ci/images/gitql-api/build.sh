#!/bin/bash

set -euo pipefail

NAME="$(basename $(dirname $(realpath "$0")))"
TAG="alanmpinder/${NAME}:$(date +'%Y%m%d')"
LTAG="alanmpinder/${NAME}:latest"

echo "Name: ${NAME}, Tag: ${TAG}"

docker image build --tag "${TAG}" build
docker image push "${TAG}"

docker tag "${TAG}" "${LTAG}"
docker image push "${LTAG}"
