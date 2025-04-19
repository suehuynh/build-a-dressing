// graph.js

// Define the graph data
const nodes = [
  { id: 'Vinaigrette', group: 'style' },
  { id: 'Creamy', group: 'style' },
  { id: 'Oil', group: 'component' },
  { id: 'Acid', group: 'component' },
  { id: 'Flavor', group: 'component' },
  { id: 'Liquid', group: 'component' },
  { id: 'Creamy Ingredient', group: 'component' },

  // Ingredients
  { id: 'Olive Oil', group: 'ingredient' },
  { id: 'Sesame Oil', group: 'ingredient' },
  { id: 'Vinegar', group: 'ingredient' },
  { id: 'Lemon Juice', group: 'ingredient' },
  { id: 'Garlic', group: 'ingredient' },
  { id: 'Mustard', group: 'ingredient' },
  { id: 'Yogurt', group: 'ingredient' },
  { id: 'Mayo', group: 'ingredient' },
  { id: 'Buttermilk', group: 'ingredient' },
];

const links = [
  // Styles to Components
  { source: 'Vinaigrette', target: 'Oil' },
  { source: 'Vinaigrette', target: 'Acid' },
  { source: 'Vinaigrette', target: 'Flavor' },
  { source: 'Creamy', target: 'Creamy Ingredient' },
  { source: 'Creamy', target: 'Liquid' },
  { source: 'Creamy', target: 'Flavor' },

  // Components to Ingredients
  { source: 'Oil', target: 'Olive Oil' },
  { source: 'Oil', target: 'Sesame Oil' },
  { source: 'Acid', target: 'Vinegar' },
  { source: 'Acid', target: 'Lemon Juice' },
  { source: 'Liquid', target: 'Buttermilk' },
  { source: 'Liquid', target: 'Lemon Juice' },
  { source: 'Flavor', target: 'Garlic' },
  { source: 'Flavor', target: 'Mustard' },
  { source: 'Creamy Ingredient', target: 'Yogurt' },
  { source: 'Creamy Ingredient', target: 'Mayo' },
];

const width = 900;
const height = 600;

const svg = d3.select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const colorMap = {
  style: '#e76f51',
  component: '#f4a261',
  ingredient: '#2a9d8f'
};

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(120))
  .force("charge", d3.forceManyBody().strength(-500))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
  .attr("stroke", "#aaa")
  .selectAll("line")
  .data(links)
  .enter().append("line")
  .attr("stroke-width", 2);

const node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(nodes)
  .enter().append("circle")
  .attr("r", 15)
  .attr("fill", d => colorMap[d.group])
  .call(drag(simulation))
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut)
  .on("click", handleClick);

const label = svg.append("g")
  .selectAll("text")
  .data(nodes)
  .enter().append("text")
  .attr("dy", -20)
  .attr("text-anchor", "middle")
  .text(d => d.id);

simulation.on("tick", () => {
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

function drag(simulation) {
  return d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}

function handleMouseOver(event, d) {
  const connected = new Set();
  links.forEach(l => {
    if (l.source.id === d.id) connected.add(l.target.id);
    if (l.target.id === d.id) connected.add(l.source.id);
  });

  node.style("opacity", n => (connected.has(n.id) || n.id === d.id) ? 1 : 0.2);
  label.style("opacity", n => (connected.has(n.id) || n.id === d.id) ? 1 : 0.2);
  link.style("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
}

function handleMouseOut() {
  node.style("opacity", 1);
  label.style("opacity", 1);
  link.style("stroke-opacity", 1);
}

function handleClick(event, d) {
  const info = document.getElementById("info-box");
  if (d.group === 'ingredient') {
    info.innerText = `Try a salad dressing with: ${d.id}`;
  } else {
    info.innerText = `${d.id}`;
  }
}
