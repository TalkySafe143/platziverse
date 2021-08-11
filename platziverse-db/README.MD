# platziverse-db

## Usage

```js

const setupDataBase = require('platziverse-db');

setupDataBase(config).then(db => {
    const { Agent, Metric } = db;
}).catch(e => console.log(e))

```