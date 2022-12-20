use std::{collections::{BTreeMap, HashSet}, hash::Hash};
use spectre::{edge::Edge};
use std::time::Instant;
use std::fs::File;

//#[derive(Deserialize)]
pub type Vertex = Vec<usize>;

//#[derive(Deserialize)]
pub type AGraph = Vec<Vertex>;

pub const MAX_NODES: usize = 10000;

pub struct NGraph<T> {
    pub edges: HashSet<Edge<T>>,
    index: Option<BTreeMap<T, usize>>,
}

impl<T> Default for NGraph<T>
where
    Edge<T>: Eq + Hash,
    T: Copy + Eq + Hash + Ord,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<T> NGraph<T>
where
    Edge<T>: Eq + Hash,
    T: Copy + Eq + Hash + Ord,
{
    pub fn new() -> Self {
        Self {
            edges: Default::default(),
            index: None,
        }
    }

    /// Inserts an edge into the graph.
    pub fn insert(&mut self, edge: Edge<T>) -> bool {
        let is_inserted = self.edges.insert(edge);

        // Delete the cached objects if the edge was successfully inserted because we can't
        // reliably update them from the new connection alone.
        if is_inserted && self.index.is_some() {
            self.clear_cache()
        }

        is_inserted
    }

    pub fn remove(&mut self, edge: &Edge<T>) -> bool {
        let is_removed = self.edges.remove(edge);

        // Delete the cached objects if the edge was successfully removed because we can't reliably
        // update them from the new connection alone.
        if is_removed && self.index.is_some() {
            self.clear_cache()
        }

        is_removed
    }

    fn vertices_from_edges(&self) -> HashSet<T> {
        let mut vertices: HashSet<T> = HashSet::new();
        for edge in self.edges.iter() {
            // Using a hashset guarantees uniqueness.
            vertices.insert(*edge.source());
            vertices.insert(*edge.target());
        }

        vertices
    }

    pub fn create_agraph(&self, addresses: &Vec<T>) -> AGraph {
        let num_nodes = addresses.len();
        let mut agraph: AGraph = AGraph::new();
        for _ in 0..num_nodes {
            agraph.push(Vertex::new());
        }

        // For all our edges, check if the nodes are in our address list
        // We use the value of the addresses to find the index
        // From then on, it's all integer indices for us
        for edge in self.edges.iter() {
            let source = *edge.source();
            let target = *edge.target();

            let src_result = addresses.iter().position(|&r| r == source);
            if src_result == None {
                continue;
            }

            let tgt_result = addresses.iter().position(|&r| r == target);
            if tgt_result == None {
                continue;
            }

            let src_index = src_result.unwrap();
            let tgt_index = tgt_result.unwrap();
            agraph[src_index].push(tgt_index);
            agraph[tgt_index].push(src_index);
        }
        agraph

    }

    pub fn compute_betweenness_and_closeness (&self, agraph: AGraph) ->  (Vec<u32>, Vec<f64>) {
        let num_nodes = agraph.len();

        let mut betweenness: Vec<u32> = vec!(0; num_nodes);
        let mut closeness: Vec<f64> = vec!(0.0; num_nodes);
        let mut total_path_length: Vec<u32> = vec!(0; num_nodes);
        let mut num_paths: Vec<u32> = vec!(0; num_nodes);

        for i in 0..num_nodes-1 {
            let mut visited: Vec<bool> = vec!(false; num_nodes);
            let mut found: Vec<bool> = vec!(false; num_nodes);
            let mut search_list: Vec<usize> = Vec::new();

            // mark node i and all those before i as visited
            for j in 0..i+1 {
                found[j] = true;
            }
            for j in i+1..num_nodes {
                search_list.push(j);
                found[j] = false;
            }

            while search_list.len() > 0 {
                // 0. OUR MAIN SEARCH LOOP:  I and J
                // 1. we search for path between i and j.  We're done when we find j
                // 2. any short paths we find along the way, get handled, and removed from search list
                // 3. along the way, we appropriately mark any between nodes
                let mut done = false;
                let j = search_list[0];
                for x in 0..num_nodes {
                    visited[x] = x == i;
                }
                let mut pathlen: u32 = 1;

                let mut queue_list = Vec::new();
                queue_list.push(i);

                while !done {
                    let mut this_round_found: Vec<usize> = Vec::new();
                    let mut topush = Vec::new();
                    let mut tovisit = Vec::new();
                    for q in queue_list.as_slice() {
                        let v = &agraph[*q];
                        for x in v {
                            // We collect all shortest paths for this length, as there may be multiple paths
                            if !visited[*x] {
                                topush.push(*x);
                                tovisit.push(*x);
                                if !found[*x] {
                                    // println!("    push this round found: {}", *x);
                                    this_round_found.push(*x);
                                    if pathlen > 1 {
                                        betweenness[*q] = betweenness[*q] + 1;
                                    }
                                }
                            }
                        }
                    }

                    queue_list.clear();
                    for x in topush {
                        queue_list.push(x);
                    }
                    for x in tovisit {
                        visited[x] = true;
                     }

                    for f in this_round_found {
                        num_paths[f] = num_paths[f] + 1;
                        total_path_length[f] = total_path_length[f] + pathlen;
                        num_paths[i] = num_paths[i] + 1;
                        total_path_length[i] = total_path_length[i] + pathlen;
                        search_list.retain(|&x| x != f);
                        found[f] = true;
                        if f == j {
                            done = true;
                        }
                    }
                    pathlen = pathlen + 1;
                }
            }
        }

        for i in 0..num_nodes {
            closeness[i] = total_path_length[i] as f64 / num_paths[i] as f64;
        }

        (betweenness, closeness)

    }

    pub fn vertex_count(&self) -> usize {
        self.vertices_from_edges().len()
    }

    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }
    fn clear_cache(&mut self) {
        self.index = None;
    }

}



#[cfg(test)]
mod tests {
    //use serde::de::IntoDeserializer;

    use super::*;

    #[test]
    fn new() {
        let _: NGraph<()> = NGraph::new();
    }

    #[test]
    fn doit() {
        let (s0, s1, s2, s3, s4, s5, s6) = ("0", "1", "2", "3", "4", "5", "6");
        let addresses = vec!["0", "1", "2", "3", "4", "5", "6"];
        let mut ngraph: NGraph<&str> = NGraph::new();
        // this graph reproduces the image at:
        // https://www.sotr.blog/articles/breadth-first-search
        ngraph.insert(Edge::new(s0, s3));
        ngraph.insert(Edge::new(s0, s5));
        ngraph.insert(Edge::new(s5, s1));
        ngraph.insert(Edge::new(s1, s2));
        ngraph.insert(Edge::new(s2, s4));
        ngraph.insert(Edge::new(s2, s6));
        ngraph.insert(Edge::new(s1, s3));
        let agraph = ngraph.create_agraph(&addresses);
        let (betweenness, closeness) = ngraph.compute_betweenness_and_closeness(agraph);
        println!("1: betweenness: {:?}", betweenness);
        println!("1: closeness: {:?}", closeness);
    }

    #[test]
    fn star_graph_a() {
        // 7-pointed star, 8 nodes
        // center is 0
        let (s0, s1, s2, s3, s4, s5, s6, s7) = ("0", "1", "2", "3", "4", "5", "6", "7");
        let addresses = vec!["0", "1", "2", "3", "4", "5", "6", "7"];
        let mut ngraph: NGraph<&str> = NGraph::new();
        ngraph.insert(Edge::new(s0, s1));
        ngraph.insert(Edge::new(s0, s2));
        ngraph.insert(Edge::new(s0, s3));
        ngraph.insert(Edge::new(s0, s4));
        ngraph.insert(Edge::new(s0, s5));
        ngraph.insert(Edge::new(s0, s6));
        ngraph.insert(Edge::new(s0, s7));
        let agraph = ngraph.create_agraph(&addresses);
        let (betweenness, closeness) = ngraph.compute_betweenness_and_closeness(agraph);
        println!("2: betweenness: {:?}", betweenness);
        println!("2: closeness: {:?}", closeness);
    }

    #[test]
    fn star_graph_b() {
        // 7-pointed star, 8 nodes
        // center is 7
        let (s0, s1, s2, s3, s4, s5, s6, s7) = ("0", "1", "2", "3", "4", "5", "6", "7");
        let addresses = vec!["0", "1", "2", "3", "4", "5", "6", "7"];
        let mut ngraph: NGraph<&str> = NGraph::new();
        ngraph.insert(Edge::new(s0, s7));
        ngraph.insert(Edge::new(s1, s7));
        ngraph.insert(Edge::new(s2, s7));
        ngraph.insert(Edge::new(s3, s7));
        ngraph.insert(Edge::new(s4, s7));
        ngraph.insert(Edge::new(s5, s7));
        ngraph.insert(Edge::new(s6, s7));

        let agraph = ngraph.create_agraph(&addresses);
        let (betweenness, closeness) = ngraph.compute_betweenness_and_closeness(agraph);
        println!("3: betweenness: {:?}", betweenness);
        println!("3: closeness: {:?}", closeness);
    }

    #[test]
    fn disconnected_graph() {
        // TODO
        // center is 7
        // let (s0, s1, s2, s3, s4, s5, s6, s7) = ("0", "1", "2", "3", "4", "5", "6", "7");
        // let addresses = vec!["0", "1", "2", "3", "4", "5", "6", "7"];
        // let mut ngraph: NGraph<&str> = NGraph::new();
        // ngraph.insert(Edge::new(s0, s7));
        // ngraph.insert(Edge::new(s1, s7));
        // ngraph.insert(Edge::new(s2, s7));
        // ngraph.insert(Edge::new(s3, s7));
        // ngraph.insert(Edge::new(s4, s7));
        // ngraph.insert(Edge::new(s5, s7));
        // ngraph.insert(Edge::new(s6, s7));

        // let (betweenness, closeness) = ngraph.compute_betweenness_and_closeness(&addresses);
        // println!("3: betweenness: {:?}", betweenness);
        // println!("3: closeness: {:?}", closeness);
    }

    #[test]
    fn import_agraph() {
        // TODO
        println!("start parsing agraph.json");
        let file = File::open("data/agraph.json")
            .expect("file should open read only");
        let json: serde_json::Value = serde_json::from_reader(file)
            .expect("file should be proper JSON");
        let jresult = json.get("result")
            .expect("file should have result key");
        let jgraph = jresult.get("agraph")
            .expect("file should have agraph key");

        let vertices = jgraph.as_array().unwrap();
        let mut agraph: AGraph = AGraph::new();
        for v in vertices {
            let jvertex = v.as_array().unwrap();
            let mut vertex: Vertex = Vertex::new();
            // parse the connections
            for conn in jvertex {
                vertex.push(conn.as_u64().unwrap() as usize);
            }
            agraph.push(vertex);
        }
        println!("done parsing agraph.json");
        let ngraph: NGraph<usize> = NGraph::new();

        let start = Instant::now();

        let (betweenness, closeness) = ngraph.compute_betweenness_and_closeness(agraph);
        let elapsed = start.elapsed();
        println!("test elapsed {:?}", elapsed);
        println!("2: betweenness: {:?}", betweenness);
        println!("2: closeness: {:?}", closeness);
    }
    
}