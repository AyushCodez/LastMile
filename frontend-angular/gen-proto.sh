#!/bin/bash
mkdir -p src/proto
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=src/proto \
  --ts_proto_opt=outputServices=default,env=browser,useObservables=true,esModuleInterop=true \
  -I ../backend/services/proto-common/src/main/proto \
  ../backend/services/proto-common/src/main/proto/*.proto
