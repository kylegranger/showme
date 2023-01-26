# showme : a p2p network visualizer


## Build and run the app

```
npm i
npm run build
npm run start
```
Open a browser at http://127.0.0.1:3000.

## Keyboard Interface

At the moment, this application displays a textured square with a cube reflection map applied.

- the arrow keys move the camera
- the I and O keys do zoom **in** and **out**


## State Data

The app serves up the file `state.json`, located in `dist/client/data`.  This file gets generated by the crawler data cruncher application (https://github.com/kylegranger/crunchy)

The rust app serializes and writes out this structure:

```
pub struct Crunched {
    agraphlen: u32,
    elapsed: f64,
    node_ids: Vec<String>,
    betweenness: Vec<f64>,
    closeness: Vec<f64>,
    num_connections: Vec<usize>,
    min_betweenness: f64,
    max_betweenness: f64,
    min_closeness: f64,
    max_closeness: f64,
}
```

`showme` loads the file, and parses the content to an IState interface:
```
interface IState {
    agraphlen: number
    elapsed: number
    node_ids: string []
    betweenness: number []
    closeness: number []
    num_connections: number []
    min_betweenness: number
    max_betweenness: number
    min_closeness: number
    max_closeness: number
}
```