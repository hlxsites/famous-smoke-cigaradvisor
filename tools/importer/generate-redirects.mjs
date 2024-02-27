import * as fs from 'node:fs';
import { metadata } from './metadata.mjs';

const file = 'tools/importer/redirects.csv'

try {
  fs.writeFileSync(file, 'Source,Destination\n');
} catch (err) {
  console.log(err);
}

Object.keys(metadata).forEach((k) => {
  try {
    fs.appendFileSync(file, `/cigaradvisor/${k},/cigaradvisor/${metadata[k].category}/${k}\n`);
  } catch (err) {
    console.log(err);
  }
})
