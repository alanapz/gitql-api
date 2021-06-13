#!/bin/bash

set -euo pipefail

GQL_ROOT="/repos"
export GQL_ROOT

if [[ ! -d "${GQL_ROOT}" ]]
then
    echo "${GQL_ROOT} not mapped"
    exit 1
fi

if [[ -z "${GIT_URL}" ]]
then
    echo "GIT_URL required"
    exit 1
fi

if [[ -z "${GIT_BRANCH}" ]]
then
    echo "GIT_BRANCH required"
    exit 1
fi

if [[ ! -d "/gitql-api/.git" ]]
then
    git clone --branch "${GIT_BRANCH}" "${GIT_URL}" "/gitql-api"
fi

cd "/gitql-api"

git remote set-url origin "${GIT_URL}"
git fetch --prune --quiet
git reset --hard "origin/${GIT_BRANCH}" --quiet
git clean -ffddx -e "node_modules/"
git log HEAD -n1

if [[ ! -d "./node_modules" ]]
then
    echo "Installing dependencies, this may take a while"
    yarn install
fi

yarn install --prefer-offline --silent
ts-node src/generate-typings
yarn run start
