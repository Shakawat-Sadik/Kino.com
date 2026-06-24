export default function toPascalCase(str) {
  return str
    .split('-')
    .map(word => 
      word.charAt(0).toUpperCase() + 
      word.slice(1).toLowerCase()
    )
    .join('');
}

 /*
  1. Split the string by the hyphen -> ["shopping", "cart"]
  2. Capitalize the first letter
  3. Make sure the rest is lowercase
  4. Join them back together with no spaces
 */