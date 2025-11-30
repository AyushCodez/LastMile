#!/bin/bash
mkdir -p src/proto
protoc -I=../backend/services/proto-common/src/main/proto \
  --plugin=protoc-gen-ts=./node_modules/@protobuf-ts/plugin/bin/protoc-gen-ts \
  --ts_out=src/proto \
  --ts_opt=service_type=grpc-web \
  ../backend/services/proto-common/src/main/proto/*.proto
