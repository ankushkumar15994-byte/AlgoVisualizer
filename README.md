# Algorithm Visualizer 🚀

An interactive web-based algorithm visualizer with **real-time complexity analysis** that detects and displays the actual time complexity case (Best/Average/Worst) after each algorithm execution.

![Algorithm Visualizer](https://img.shields.io/badge/algorithms-visualizer-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Enhanced Time Complexity Detection
- **Real-time case detection**: Automatically identifies whether your algorithm ran in Best, Average, or Worst case
- **Visual feedback**: Color-coded badges and animations highlight the detected complexity
- **Detailed analysis**: Shows why a particular case was detected with condition explanations
- **Comparison view**: Side-by-side comparison of all complexity cases with the active one highlighted

### 📊 Algorithm Categories

#### Sorting Algorithms
- **Bubble Sort** - O(n²) average, O(n) best case
- **Selection Sort** - O(n²) all cases
- **Merge Sort** - O(n log n) all cases
- **Quick Sort** - O(n log n) average, O(n²) worst case

#### Graph Algorithms
- **BFS** (Breadth-First Search)
- **DFS** (Depth-First Search)
- **Dijkstra's Algorithm**
- **Kruskal's Algorithm** (MST)
- **Prim's Algorithm** (MST)
- **A* Search**

#### TSP Algorithms
- **Brute Force** - O(n!)
- **Greedy (Nearest Neighbor)** - O(n²)
- **Dynamic Programming** - O(n² 2ⁿ)

## 🚀 Getting Started

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/algo-visualizer.git
cd algo-visualizer
```

2. Start the local server:
```bash
python server.py
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 📖 Usage

### Running Algorithms

1. **Select an algorithm** from the sidebar
2. **Configure parameters**:
   - Array size (for sorting)
   - Animation speed
   - Custom input (optional)
3. **Click "Start"** to run the visualization
4. **Watch the complexity panel** update with the detected case

### Understanding Complexity Detection

After running an algorithm, the **Complexity panel** shows:

- **Time Complexity**: Updates to show the actual detected case
- **Case Badge**: Visual indicator (✓ Best / ⚡ Average / ⚠ Worst)
- **Condition**: Explanation of why this case occurred
- **All Cases**: Comparison table with detected case highlighted
- **Statistics**: Operations count, execution time, and metrics

### Example: Quick Sort

- **Already sorted array** → Detects **Worst Case O(n²)**
- **Random array** → Detects **Average Case O(n log n)**
- **Balanced partitions** → Detects **Best Case O(n log n)**

## 🎨 Features Showcase

### Real-Time Visualization
- Step-by-step animation of algorithm execution
- Color-coded elements (comparing, swapping, sorted, pivot)
- Pointer indicators showing current positions

### Interactive Controls
- Adjustable animation speed
- Pause/Resume functionality
- Custom array input
- Random array generation

### Detailed Analytics
- Operation counters (comparisons, swaps)
- Execution time tracking
- Theoretical vs actual operations comparison
- Percentage of theoretical complexity

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: Canvas API
- **Server**: Python HTTP Server
- **Styling**: Custom CSS with CSS Variables for theming

## 📁 Project Structure

```
algo-visualizer/
├── assets/
│   ├── css/           # Stylesheets
│   └── js/
│       ├── graph/     # Graph algorithm implementations
│       ├── sorting/   # Sorting algorithm implementations
│       ├── tsp/       # TSP algorithm implementations
│       └── utils/     # Helper functions and complexity analyzer
├── components/        # Reusable HTML components
├── data/             # JSON data files
├── *.html            # Main pages
└── server.py         # Development server
```

## 🎯 Key Enhancements

### Complexity Detection Algorithm
The system analyzes actual operations vs theoretical complexity:

```javascript
detectCase: ({ comparisons, n }) => {
    const ratio = comparisons / (n * n);
    if (ratio < 0.15) return 'best';
    if (ratio < 0.65) return 'average';
    return 'worst';
}
```

### Visual Feedback
- Animated highlighting of detected case
- Color-coded badges (green/yellow/red)
- Progressive bar showing percentage of theoretical operations
- Smooth transitions and animations

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by various algorithm visualization tools
- Built with modern web technologies
- Enhanced with real-time complexity analysis

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for algorithm enthusiasts and students**
