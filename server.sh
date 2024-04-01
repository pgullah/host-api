DIRECTORY=$(cd `dirname $0` && pwd)
cd $DIRECTORY
nohup npm start &
echo $! > .pid
