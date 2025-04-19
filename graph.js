const container = document.getElementById("graph");
const width = container.offsetWidth * 1.2;
const height = window.innerHeight * 0.6;

const svg = d3.select("#graph")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  // .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "75vh")
  .style("height", "75vh");

// Graph data with hierarchy levels
const allNodes = [
  { id: 'Vinaigrette', group: 'style', level: 0 },
  { id: 'Creamy', group: 'style', level: 0 },
  { id: 'Oil', group: 'component', level: 1 },
  { id: 'Acid', group: 'component', level: 1 },
  { id: 'Flavor', group: 'component', level: 1 },
  { id: 'Liquid', group: 'component', level: 1 },
  { id: 'Creamy Ingredient', group: 'component', level: 1 },
  { id: 'Olive Oil', group: 'ingredient', level: 2 },
  { id: 'Sesame Oil', group: 'ingredient', level: 2 },
  { id: 'Vinegar', group: 'ingredient', level: 2 },
  { id: 'Lemon Juice', group: 'ingredient', level: 2 },
  { id: 'Garlic', group: 'ingredient', level: 2 },
  { id: 'Mustard', group: 'ingredient', level: 2 },
  { id: 'Yogurt', group: 'ingredient', level: 2 },
  { id: 'Mayo', group: 'ingredient', level: 2 },
  { id: 'Buttermilk', group: 'ingredient', level: 2 },
  { id: 'Water', group: 'ingredient', level: 2 },
  { id: 'Whole Milk', group: 'ingredient', level: 2 },
];

const allLinks = [
  { source: 'Vinaigrette', target: 'Oil' },
  { source: 'Vinaigrette', target: 'Acid' },
  { source: 'Vinaigrette', target: 'Flavor' },
  { source: 'Creamy', target: 'Creamy Ingredient' },
  { source: 'Creamy', target: 'Liquid' },
  { source: 'Creamy', target: 'Flavor' },
  { source: 'Oil', target: 'Olive Oil' },
  { source: 'Oil', target: 'Sesame Oil' },
  { source: 'Acid', target: 'Vinegar' },
  { source: 'Acid', target: 'Lemon Juice' },
  { source: 'Liquid', target: 'Buttermilk' },
  { source: 'Liquid', target: 'Lemon Juice' },
  { source: 'Liquid', target: 'Water' },
  { source: 'Liquid', target: 'Whole Milk' },
  { source: 'Flavor', target: 'Garlic' },
  { source: 'Flavor', target: 'Mustard' },
  { source: 'Creamy Ingredient', target: 'Yogurt' },
  { source: 'Creamy Ingredient', target: 'Mayo' },
];

let activeNodes = allNodes.filter(n => n.level === 0);
let activeLinks = [];
let selectedIngredients = [];
let selectedBase = '';
let selectedAcid = '';
let selectedLiquid = '';
let selectedFlavors = [];

const colorMap = {
  style: '#e76f51',
  component: '#f4a261',
  ingredient: '#2a9d8f',
  inactive: '#cccccc'
};

const sizeMap = {
  style: 40,
  component: 25,
  ingredient: 12
};

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-500))
  .force("center", d3.forceCenter(width / 2, height / 2));

let link = svg.append("g").selectAll("line");
let node = svg.append("g").selectAll("circle");
let label = svg.append("g").selectAll("text");

updateGraph();

function updateGraph() {
  simulation.nodes(activeNodes);
  simulation.force("link").links(activeLinks);

  link = link.data(activeLinks, d => `${d.source.id}-${d.target.id}`);
  link.exit().remove();
  link = link.enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .merge(link);

  node = node.data(activeNodes, d => d.id);
  node.exit().remove();
  const entered = node.enter().append("circle")
    .attr("r", d => sizeMap[d.group])
    .attr("fill", d => selectedIngredients.includes(d.id) || d.group !== 'ingredient' ? colorMap[d.group] : colorMap.inactive)
    .style("cursor", "pointer")
    .on("click", handleClick);
  node = entered.merge(node);

  label = label.data(activeNodes, d => d.id);
  label.exit().remove();
  label = label.enter()
    .append("text")
    .attr("dy", -sizeMap.style)
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .text(d => d.id)
    .merge(label);

  simulation.alpha(1).restart();
  simulation.on("tick", () => {
    activeNodes.forEach(d => {
      d.x = Math.max(sizeMap[d.group], Math.min(width - sizeMap[d.group], d.x));
      d.y = Math.max(sizeMap[d.group], Math.min(height - sizeMap[d.group], d.y));
    });
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });
}

function handleClick(event, d) {
  const info = document.getElementById("info-box");

  if (d.group === 'ingredient') {
    const index = selectedIngredients.indexOf(d.id);
    if (index > -1) {
      // Deselect
      selectedIngredients.splice(index, 1);
      if (d.id === selectedBase) selectedBase = '';
      if (d.id === selectedAcid) selectedAcid = '';
      if (d.id === selectedLiquid) selectedLiquid = '';
      selectedFlavors = selectedFlavors.filter(f => f !== d.id);
    } else {
      // Select
      selectedIngredients.push(d.id);
      if (["Olive Oil", "Sesame Oil", "Yogurt", "Mayo"].includes(d.id)) selectedBase = d.id;
      else if (["Vinegar", "Lemon Juice"].includes(d.id)) selectedAcid = d.id;
      else if (["Buttermilk", "Water", "Whole Milk", "Lemon Juice"].includes(d.id)) selectedLiquid = d.id;
      else selectedFlavors.push(d.id);
    }

    d3.selectAll("circle")
      .attr("fill", d => selectedIngredients.includes(d.id) || d.group !== 'ingredient' ? colorMap[d.group] : colorMap.inactive);

    if (selectedBase && (selectedAcid || selectedLiquid) && selectedFlavors.length) {
      let recipe = '';
      if (["Olive Oil", "Sesame Oil"].includes(selectedBase)) {
        recipe = `3 ${selectedBase} + 1 ${selectedAcid} + 1 ${selectedFlavors.join(', ')}`;
      } else {
        recipe = `3 ${selectedBase} + 1 ${selectedLiquid} + 1 ${selectedFlavors.join(', ')}`;
      }
      info.innerText = `Your perfect dressing recipe is: ${recipe}`;
    } else {
      info.innerText = '';
    }
    return;
  }

  const newLinks = allLinks.filter(l => l.source === d.id);
  const newNodes = newLinks.map(l => allNodes.find(n => n.id === l.target));

  activeLinks = activeLinks.concat(newLinks.map(l => ({
    source: allNodes.find(n => n.id === l.source),
    target: allNodes.find(n => n.id === l.target)
  })));

  activeNodes = [...new Set(activeNodes.concat(newNodes))];
  updateGraph();
}

// Add a restart button
const restartBtn = document.createElement("button");
restartBtn.innerText = "Start Over";
restartBtn.style.position = "absolute";
restartBtn.style.top = "20px";
restartBtn.style.right = "20px";
restartBtn.onclick = () => {
  activeNodes = allNodes.filter(n => n.level === 0);
  activeLinks = [];
  selectedIngredients = [];
  selectedBase = '';
  selectedAcid = '';
  selectedLiquid = '';
  selectedFlavors = [];
  document.getElementById("info-box").innerText = "Explore ingredients for dressing";
  updateGraph();
};
document.body.appendChild(restartBtn);
