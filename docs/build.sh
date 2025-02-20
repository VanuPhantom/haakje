BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

while getopts "hc" flag; do
 case $flag in
   h) # Handle the -h flag
   # Display script help information
   echo "The build script for Haakje's docs"
   echo "Flags:\n\r-h: Show this help page\n\r-c: Perform a clean build"
   exit
   ;;
   c) # Handle the -c flag
   # Clean the old build output before building
   echo "${BLUE}Performing a clean build...${NC}"
   rm -rdf ./dist
   ;;
  esac
done

echo "${BLUE}Creating dist directory...${NC}"
mkdir -p dist
echo "${BLUE}Copying markup...${NC}"
cp -R markup/* dist/
echo "${BLUE}Compiling SASS...${NC}"
npx sass stylesheets/:dist/
echo "${GREEN}Done.${NC}"