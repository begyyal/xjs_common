#!/bin/sh

module_name=xjs-common
rootdir=$(dirname $0)
mkdir -p ${rootdir}/dist
npx tsc -p ${rootdir}/tsconfig-types.json
[ $? != 0 ] && exit 1 || :
cat ${rootdir}/compiled/types.d.ts |
sed -E "s/^declare module \"index\" \{$/declare module \"${module_name}\" {/" > ${rootdir}/dist/types.d.ts
[ $? != 0 ] && exit 1 || :
