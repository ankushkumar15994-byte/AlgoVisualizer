# Algorithm Visualizer

An interactive, web-based platform for visualizing and understanding Data Structures & Algorithms (DAA).

## Features

### 🔀 Sorting Algorithms
- **Bubble Sort** - O(n²) time complexity
- **Selection Sort** - O(n²) time complexity  
- **Merge Sort** - O(n log n) time complexity
- **Quick Sort** - O(n log n) average time complexity

### 📊 Graph Algorithms
- **BFS (Breadth-First Search)** - Level-wise graph traversal
- **DFS (Depth-First Search)** - Recursive graph traversal
- **Dijkstra's Algorithm** - Shortest path in weighted graphs
- **A* Search** - Heuristic-based pathfinding

### 🚗 TSP Solver
- **Brute Force** - Exhaustive search through all permutations
- **Dynamic Programming** - Optimized subproblem approach
- **Greedy Heuristic** - Fast approximation algorithm

### 🎯 Additional Problems
- **N-Queens Problem** - Backtracking visualization
- **0/1 Knapsack Problem** - Dynamic programming
- **Graph Coloring** - Constraint satisfaction
- **Coin Change** - Optimal coin selection

## Project Structure

```
algo-visualizer/
├── index.html                # Landing page
├── sorting.html              # Sorting visualizer
├── graph.html                # Graph algorithms
├── tsp.html                  # TSP solver
├── problems.html             # Other problems
├── assets/
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript files
│   ├── images/               # Static images
│   └── fonts/                # Custom fonts
├── components/               # Reusable UI components
├── data/                     # Sample test data
├── README.md                 # This file
└── package.json              # Project metadata
```

## Installation & Usage

### Option 1: Using Python HTTP Server
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Direct File Access
Simply open `index.html` in a modern web browser.

## Features & Controls

### Sorting Page
- **Array Size Slider**: Adjust number of elements (10-100)
- **Speed Control**: Control animation speed
- **Generate Array**: Create random array
- **Start Sort**: Begin visualization
- **Pause/Resume**: Control execution
- **Statistics**: View comparisons, swaps, and time

### Graph Page
- **Node Count**: Configurable graph size
- **Algorithm Selection**: Choose BFS, DFS, Dijkstra, or A*
- **Select Start/End**: Interactive node selection
- **Speed Control**: Animation speed adjustment
- **Live Statistics**: Nodes visited, path length, execution time

### TSP Page
- **City Count**: Adjust number of cities
- **Algorithm Selection**: Brute Force, DP, or Greedy
- **Visualization**: See cities and best route found
- **Statistics**: Best distance and routes checked

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Algorithm implementations
- **Canvas API** - Graphics rendering

## Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers with HTML5 support

## Educational Value

This visualizer is designed to help learners understand:
1. How algorithms work step-by-step
2. Time and space complexity differences
3. Trade-offs between approaches
4. Real-world algorithm behavior

## Light/Dark Mode

Toggle between light and dark mode using the theme button in the navbar. Your preference is saved locally.

## Performance Tips

1. Use smaller array sizes for slower algorithms
2. Adjust speed for better visualization comprehension
3. Use browser console (F12) to inspect algorithm details

## Future Enhancements

- [ ] More sorting algorithms (Heap, Radix, Counting)
- [ ] Advanced graph algorithms (Floyd-Warshall, Bellman-Ford)
- [ ] 3D visualizations
- [ ] Algorithm code step-through
- [ ] Mobile-optimized interface

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest improvements
- Add new algorithms
- Enhance visualizations

## License

MIT License - Feel free to use this project for educational purposes.

## Author

Built for Computer Science enthusiasts and students learning DAA concepts.

---

**Happy Learning!** 🎓
