export default {
  // Visibility of clustered particles
  ShowClusters: true,
  
  // Visibility of walkers
  ShowWalkers: true,

  // Maximum number of nodes - lower numbers mean better performance, but fewer hits
  MaxWalkers: 15000,

  // Where new walkers are spawned. Can be Edges, Circle, Center, or Random
  WalkerSource: 'Random',

  // Add new walkers whenever they become stuck to clusters
  ReplenishWalkers: false,

  // Probability that a collision will make a walker stick to cluster
  Stickiness: .9,

  // Direction to move all walkers each iteration. Can be Up, Down, Left, Right, Center, and Edges. All other values, including nothing, disable bias
  BiasTowards: '',

  // Magnitude of walker bias force. Higher values mean faster movement
  BiasForce: 1
};