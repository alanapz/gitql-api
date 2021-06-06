#!/bin/bash

set -euo pipefail

NAME="$(basename $(dirname $(realpath "$0")))"
TAG="alanmpinder/${NAME}:$(date +'%Y%m%d')"

echo "Name: ${NAME}, Tag: ${TAG}"

docker image build --tag "${TAG}" build

docker image push "${TAG}"
