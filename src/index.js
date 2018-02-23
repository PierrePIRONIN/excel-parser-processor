import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import isUrl from 'is-url';
import fetch from 'node-fetch';
import { URL } from 'url';

const workSheetsFromFile = xlsx.parse(`${path.join(__dirname, '../')}resimlinkleri.xlsx`);

const pagesWithData = workSheetsFromFile.filter(page => page.data.length);

const rowItems = pagesWithData.reduce((prev, curr) => prev.concat(...curr.data), []).filter(text => isUrl(text));
const initialItemsLength = rowItems.length;
let processedItemsCount = 0;

const processItem = () => {

  const imageNameRegex = /[A-z0-9\-]*.(jpg|png)$/g;
  const imageUrl = new URL(rowItems.pop());

  console.log(imageUrl,imageUrl.pathname);

  const imageName = imageUrl.pathname.match(imageNameRegex)[0];

  processedItemsCount++;

  fetch(imageUrl)
    .then(res => {
      const dest = fs.createWriteStream(`${path.join(__dirname, '../images/')}${imageName}`);
      res.body.pipe(dest);

      console.log(`% ${ Math.floor(processedItemsCount / initialItemsLength) * 100 }`);

      if (rowItems.length) {
        processItem();
      }

    }).catch(err => console.log(err));

};

processItem();
