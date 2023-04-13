window.AttackTreeParser = class Parser {
  
  constructor() {
    this.steps = [];
    this.MAX_WIDTH = 1500;
    this.MAX_HEIGHT = 500; // Dynamic with block depth

    this.X_CORD_OFFSET = 150;
    this.X_CORD = this.X_CORD_OFFSET;
    this.Y_CORD = 0;

    this.RECT_WIDTH = 200;
    this.RECT_HEIGHT = 100;
  }

  setSteps(steps) {
    this.steps = steps;
  }

  computeBlocks() {
    let blocks = [];
    let startBlock = {};
    let endBlock = {};
    
    let depth = 0;
    let yDepth = 0;

    this.steps.forEach(step => {
      if (step['type'] === 'START') {
        startBlock = {
          'name': step['name'],
          'type': 'START',
          'htmlContent': step['htmlContent'],
        };
        yDepth++;
      }

      if (step['type'] === 'END') {
        endBlock = {
          'name': step['name'],
          'type': 'END',
          'htmlContent': step['htmlContent'],
        };
        yDepth++;
      }

      if (step['type'] === 'AND') {
        blocks.push({
          'name': step['name'],
          'type': 'AND',
          'data': step['data'],
          'htmlContent': step['htmlContent'],
          'depth': depth,
          'orSteps': [],
        });
        depth++;
        window.orDepth = 0;
        yDepth++;
      }
      
      let parentDepth = depth - 1;
      if (step['type'] === 'OR') {
        yDepth++;
        blocks.forEach(innerBlock => {
          if (innerBlock['depth'] === parentDepth) {
            innerBlock['orSteps'].push({
              'name': step['name'],
              'type': 'OR',
              'parentDepth': parentDepth,        
              'orDepth': orDepth,      
              'htmlContent': step['htmlContent'],  
            });
            window.orDepth++;
          }
        });
      }
    });

    this.MAX_HEIGHT = (yDepth + 3) * this.RECT_HEIGHT;

    return {startBlock, endBlock, blocks};
  }

  makeReactangle(g, rectProps) {
    let { name, htmlContent } = rectProps;
    if (!name) { return; }

    let startX = 0, startY = 0, endX = 0, endY = 0;
    
    startX = this.X_CORD;
    startY = this.Y_CORD;

    g.append("rect")
      .attr("x", this.X_CORD)
      .attr("y", this.Y_CORD)
      .attr("fill", "#111")
      .attr("width", this.RECT_WIDTH)
      .attr("class", function(d) { if (htmlContent) { return `has-html-content`; } })
      .attr("data-html", function(d) { if (htmlContent) { return encodeURI(htmlContent); } })
      .attr("height", this.RECT_HEIGHT);
    
    this.X_CORD = (this.X_CORD + (this.RECT_WIDTH / 2)); 
    this.Y_CORD = (this.Y_CORD + (this.RECT_HEIGHT / 2)); 

    name = (name.length > 20) ? `${name.substring(0, 20)}...` : name;
    g.append("text")
      .attr("x", this.X_CORD)
      .attr("y", this.Y_CORD)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text(name);

    if (rectProps['data']) {
      let interalXStartsAt = -60;
      let interalXOffset = 60;
      let interalXCords = [];
      for (let index = 0; index < rectProps['data'].length; index++) {
        interalXCords.push( (interalXStartsAt + (interalXOffset * index)) );
      }
      
      let dataIdx = 0;
      rectProps['data'].forEach(data => {
        let interalXCord = interalXCords[dataIdx];
        g.append("text")
          .attr("x", this.X_CORD + interalXCord)
          .attr("y", this.Y_CORD + 25)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "10px")
          .text(`${data['title']} : ${data['value']}`);
        dataIdx++;
      });
    }
  
    this.X_CORD = this.X_CORD_OFFSET;
    this.Y_CORD = (this.Y_CORD + this.RECT_HEIGHT);

    endX = this.X_CORD;
    endY = (this.Y_CORD - (this.RECT_HEIGHT / 2)); 

    return {
      'startX': startX, 
      'startY': startY,
      'endX': endX,
      'endY': endY
    };
  }

  drawPolygon(g, cordProps, innerBlockCount=1) {
    g.append("line")
      .attr("x1", cordProps['x1'])
      .attr("y1", cordProps['y1'])
      .attr("x2", cordProps['x2'])
      .attr("y2", cordProps['y2'])
      .attr("stroke", "black");
  }
 
  makeD3Graph(svgElement) {
    let {startBlock, endBlock, blocks} = this.computeBlocks();
    var svg = 
      d3.select(svgElement)
        .html("")
        .append("svg")
        .attr("width", this.MAX_WIDTH)
        .attr("height", this.MAX_HEIGHT);
    var g = 
      svg.append("g")
        .attr("transform", function(d, i) {
          return "translate(0,0)";
        });
    
    let startBlockCords = this.makeReactangle(g, startBlock);

    let polyArray = [];
    let blockIdx = 0;
    let blocksAfterOrSteps = [];

    blocks.forEach(block => {
      let nextBlock = blocks[++blockIdx] ?? undefined;

      if (block['type'] === 'AND') {
        let blockCords = this.makeReactangle(g, block);

        if (blockIdx === 1) {
          polyArray.push({
            'x1': startBlockCords['endX'] + (this.RECT_WIDTH / 2),
            'y1': startBlockCords['endY'],
            'x2': blockCords['startX'] + (this.RECT_WIDTH / 2),
            'y2': blockCords['startY'],
          });
        }

        let beforeXCord = this.X_CORD;
        let beforeYCord = this.Y_CORD;
        let orStepsArray = [];

        if (block['orSteps'].length > 0) {
          this.X_CORD = 0;

          if (nextBlock) {
            blocksAfterOrSteps.push(nextBlock['name']);
          }
        }

        block['orSteps'].forEach(orStepBlock => {
          this.Y_CORD = beforeYCord;
          let orBlockCords = this.makeReactangle(g, orStepBlock);
          orStepsArray.push(orBlockCords);
          this.X_CORD = beforeXCord * 2;
        });

        this.X_CORD = beforeXCord;

        if (orStepsArray.length > 0) {
          for (let index = 0; index < orStepsArray.length; index++) {
            let orStepObject = orStepsArray[index];
            polyArray.push({
              'x1': blockCords['endX'] + (this.RECT_WIDTH / 2),
              'y1': blockCords['endY'],
              'x2': orStepObject['startX'] + (this.RECT_WIDTH / 2),
              'y2': orStepObject['startY'],
            });

            polyArray.push({
              'x1': blockCords['endX'] + (this.RECT_WIDTH / 2),
              'y1': blockCords['endY'] + (this.RECT_HEIGHT * 2),
              'x2': orStepObject['startX'] + (this.RECT_WIDTH / 2),
              'y2': orStepObject['startY'] + (this.RECT_HEIGHT),
            });
          }
        }

        else {
          if (!blocksAfterOrSteps.includes(block['name'])) {
            polyArray.push({
              'x1': startBlockCords['endX'] + (this.RECT_WIDTH / 2),
              'y1': startBlockCords['endY'] + (this.RECT_HEIGHT * 2),
              'x2': blockCords['startX'] + (this.RECT_WIDTH / 2),
              'y2': blockCords['startY'] + (this.RECT_HEIGHT),
            });
          } 
          
          else {
            polyArray.push({
              'x1': blockCords['endX'] + (this.RECT_WIDTH / 2),
              'y1': blockCords['endY'] + (this.RECT_HEIGHT / 2),
              'x2': blockCords['startX'] + (this.RECT_WIDTH / 2),
              'y2': blockCords['startY'] + (this.RECT_HEIGHT),
            });
          }
          startBlockCords = blockCords;
        }
      }
    });

    
    let endBlockCords = this.makeReactangle(g, endBlock);
    // If only START <--> END link exists
    if (true) {
      polyArray.push({
        'x1': startBlockCords['endX'] + (this.RECT_WIDTH / 2),
        'y1': startBlockCords['endY'],
        'x2': endBlockCords['startX'] + (this.RECT_WIDTH / 2),
        'y2': endBlockCords['startY'],
      });
    }

    polyArray.forEach(polyElem => {
      this.drawPolygon(g, polyElem);
    });
  }

};