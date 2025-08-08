#!/bin/bash

tag_name=$1
repo_url=$2
repos_name=${repo_url##*/}
ext="#javascript #typescript #utility #npm"
LF=$'\\n'
text="${repos_name}@${tag_name} was published.${LF}${repo_url}"
[ -n "$ext" ] && text=${text}${LF}${ext} || :
echo -n "{\"text\":\"${text}\"}"
