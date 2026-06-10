export const pop_graph = (...data) => s => {
  const MAX_LIVING_TIME = 820;
  const pop_data = [];
  let colors;

  let elapsed, startTime = 0;
  s.setup = () =>{
    s.createCanvas(600,600);
    startTime = s.millis();
    colors = [s.color(46,139,87), s.color(139, 46, 87)];
  };

  s.draw = () => {
    s.background(240);

    elapsed = s.millis() - startTime;

    if(elapsed <= MAX_LIVING_TIME) return;
    else{
      const temp = [];
      for(let i = 0; i<data.length; i++){
        temp.push({
          time: elapsed,
          value: data[i]()
        });
      }
      pop_data.push(temp);
    }

    s.drawAxes();
    s.drawChartLine();

  };

  s.drawChartLine = () =>{
    s.noFill();
    s.strokeWeight(2.5);

    for(let j = 0; j < pop_data[0].length; j++){
      s.beginShape();
      for(let i = 0; i < pop_data.length; i++){
        s.stroke(colors[j]);
        let x = s.map(pop_data[i][j].time,0, elapsed, 50, s.width - 20);
        let y = s.map(pop_data[i][j].value, 0, 1e+8, s.height - 40, 20);
        s.vertex(x, y);
      }
      s.endShape();
    }
  }

  s.drawAxes = () =>{
    s.stroke(150);
    s.strokeWeight(1);
    // X Axis
    s.line(50, s.height - 40, s.width - 20, s.height - 40);
    // Y Axis
    s.line(50, 20, 50, s.height - 40);

    // Simple labels
    s.fill(50);
    s.noStroke();
    s.textAlign(s.CENTER);
    s.text("Time", s.width / 2, s.height - 10);
    s.textAlign(s.RIGHT);
    s.text("Pop", 40, 25);
  }

}
