#!/bin/bash
mkdir -p src/proto
protoc -I=../backend/services/proto-common/src/main/proto \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-js=./node_modules/.bin/protoc-gen-js \
  --plugin=protoc-gen-grpc-web=./protoc-gen-grpc-web \
  --js_out=import_style=commonjs,binary:src/proto \
  --ts_out=service=grpc-web:src/proto \
  ../backend/services/proto-common/src/main/proto/*.proto
