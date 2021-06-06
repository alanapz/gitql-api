#!/bin/bash

set -euo pipefail

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

if [[ ! -d "/gitql/.git" ]]
then
    git clone --depth 1 --branch "${GIT_BRANCH}" "${GIT_URL}" /gitql
fi

git -C /gitql remote set-url origin "${GIT_URL}"
git -C /gitql fetch --prune --quiet
git -C /gitql reset --hard "origin/${GIT_BRANCH}" --quiet
git -C /gitql log HEAD -n1

cd /gitql/gitql-api

if [[ ! -d "./node_modules" ]]
then
    yarn install
fi

yarn install --prefer-offline --silent
ts-node src/generate-typings
yarn run start
