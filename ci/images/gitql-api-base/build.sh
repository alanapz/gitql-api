#!/bin/bash

set -euo pipefail

NAME="$(basename $(dirname $(realpath "$0")))"
TAG="alanmpinder/${NAME}:$(date +'%Y%m%d')"

echo "Name: ${NAME}, Tag: ${TAG}"

cat Dockerfile | docker image build --tag "${TAG}" -

docker image push "${TAG}"

echo "Remember to update version in gitql-api !"
