const container = document.getElementById("graph");
const width = container.offsetWidth;
const height = window.innerHeight * 0.5;

const svg = d3.select("#graph")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100vh");

const allNodes = [
  { id: 'Vinaigrette', group: 'style', level: 0 },
  { id: 'Creamy', group: 'style', level: 0 },
  { id: 'Oil', group: 'component', level: 1 },
  { id: 'Acid', group: 'component', level: 1 },
  { id: 'Flavor', group: 'component', level: 1 },
  { id: 'Liquid', group: 'component', level: 1 },
  { id: 'Creamy Ingredient', group: 'component', level: 1 },
  { id: 'olive oil', group: 'ingredient', level: 2 },
  { id: 'sesame oil', group: 'ingredient', level: 2 },
  { id: 'avocado oil', group: 'ingredient', level: 2 },
  { id: 'grapeseed oil', group: 'ingredient', level: 2 },
  { id: 'vinegar', group: 'ingredient', level: 2 },
  { id: 'lemon juice', group: 'ingredient', level: 2 },
  { id: 'lime juice', group: 'ingredient', level: 2 },
  { id: 'buttermilk', group: 'ingredient', level: 2 },
  { id: 'water', group: 'ingredient', level: 2 },
  { id: 'herbs', group: 'ingredient', level: 2 },
  { id: 'shallots', group: 'ingredient', level: 2 },
  { id: 'mustard', group: 'ingredient', level: 2 },
  { id: 'garlic', group: 'ingredient', level: 2 },
  { id: 'soy sauce', group: 'ingredient', level: 2 },
  { id: 'blue cheese', group: 'ingredient', level: 2 },
  { id: 'anchovies', group: 'ingredient', level: 2 },
  { id: 'yogurt', group: 'ingredient', level: 2 },
  { id: 'mayo', group: 'ingredient', level: 2 },
  { id: 'avocado', group: 'ingredient', level: 2 },
  { id: 'creme fraiche', group: 'ingredient', level: 2 },
  { id: 'sour cream', group: 'ingredient', level: 2 },
];

const allLinks = [
  { source: 'Vinaigrette', target: 'Oil' },
  { source: 'Vinaigrette', target: 'Acid' },
  { source: 'Vinaigrette', target: 'Flavor' },
  { source: 'Creamy', target: 'Creamy Ingredient' },
  { source: 'Creamy', target: 'Liquid' },
  { source: 'Creamy', target: 'Flavor' },
  { source: 'Oil', target: 'olive oil' },
  { source: 'Oil', target: 'sesame oil' },
  { source: 'Oil', target: 'avocado oil' },
  { source: 'Oil', target: 'grapeseed oil' },
  { source: 'Acid', target: 'vinegar' },
  { source: 'Acid', target: 'lemon juice' },
  { source: 'Acid', target: 'lime juice' },
  { source: 'Liquid', target: 'lemon juice' },
  { source: 'Liquid', target: 'lime juice' },
  { source: 'Liquid', target: 'buttermilk' },
  { source: 'Liquid', target: 'water' },
  { source: 'Flavor', target: 'herbs' },
  { source: 'Flavor', target: 'shallots' },
  { source: 'Flavor', target: 'mustard' },
  { source: 'Flavor', target: 'garlic' },
  { source: 'Flavor', target: 'soy sauce' },
  { source: 'Flavor', target: 'blue cheese' },
  { source: 'Flavor', target: 'anchovies' },
  { source: 'Creamy Ingredient', target: 'yogurt' },
  { source: 'Creamy Ingredient', target: 'mayo' },
  { source: 'Creamy Ingredient', target: 'avocado' },
  { source: 'Creamy Ingredient', target: 'creme fraiche' },
  { source: 'Creamy Ingredient', target: 'sour cream' },
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
    .on("click", handleClick)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

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
      selectedIngredients.splice(index, 1);
      if (d.id === selectedBase) selectedBase = '';
      if (d.id === selectedAcid) selectedAcid = '';
      if (d.id === selectedLiquid) selectedLiquid = '';
      selectedFlavors = selectedFlavors.filter(f => f !== d.id);
    } else {
      selectedIngredients.push(d.id);
      const baseOptions = ["olive oil", "sesame oil", "avocado oil", "grapeseed oil", "yogurt", "mayo", "avocado", "creme fraiche", "sour cream"];
      const acidOptions = ["vinegar", "lemon juice", "lime juice"];
      const liquidOptions = ["buttermilk", "water", "lemon juice", "lime juice"];
      const flavorOptions = ["herbs", "shallots", "mustard", "garlic", "soy sauce", "blue cheese", "anchovies"];

      if (baseOptions.includes(d.id)) selectedBase = d.id;
      else if (acidOptions.includes(d.id)) selectedAcid = d.id;
      else if (liquidOptions.includes(d.id)) selectedLiquid = d.id;
      else selectedFlavors.push(d.id);
    }

    d3.selectAll("circle")
      .attr("fill", d => selectedIngredients.includes(d.id) || d.group !== 'ingredient' ? colorMap[d.group] : colorMap.inactive);

    if (selectedBase && (selectedAcid || selectedLiquid) && selectedFlavors.length) {
      let recipe = '';
      if (["olive oil", "sesame oil", "avocado oil", "grapeseed oil"].includes(selectedBase)) {
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

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

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
  document.getElementById("info-box").innerText = "Explore ingredients for dressing!";
  updateGraph();
};
document.body.appendChild(restartBtn);
