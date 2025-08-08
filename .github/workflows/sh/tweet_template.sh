#!/bin/bash

tag_name=$1
repo_url=$2
name="xjs-common"
ext="#javascript #typescript #utility #npm"
LF=$'\\n'
text="${name}@${tag_name} was published.${LF}${repo_url}"
[ -n "$ext" ] && text=${text}${LF}${ext} || :
echo -n "{\"text\":\"${text}\"}"
