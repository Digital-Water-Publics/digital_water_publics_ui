//import { drawChart } from './mapBoxChart.js';

mapboxgl.accessToken = 'pk.eyJ1IjoibmF0aGFuYWVsaXNhbWFwcGVyIiwiYSI6ImNrODNiZzdoZTA4Y2gzZ281YmJiMHNwOWIifQ.d2ntY86sJ7DR7011dUJ2cw';
var map = new mapboxgl.Map({
  container: 'map_container',
  style: 'mapbox://styles/nathanaelisamapper/ckj940a5yh16f19rpyz321oa7',
  center: [0.1278, 51.5074],
  zoom: 11,
  pitch: 60, // pitch in degrees
  bearing: -60, // bearing in degrees
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: 'gb'
  })
);

// Disable zoom on double click
map.doubleClickZoom.disable();

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.getCanvas().style.cursor = 'default';
map.on('load', function() {


  map.on('click', function(e) {
    var states = map.queryRenderedFeatures(e.point, {
      layers: ['sentiment_shp']
    });
    d3.selectAll("svg", "svg1").remove();

    if (states.length > 0) {
      //Add River name
      document.getElementById('riverName').innerHTML = '<h3><strong>' + states[0].properties.wb_name;
      //Add River status
      if (states[0].properties.Status == "Moderate") {
        document.getElementById('riverStatus').innerHTML = '<h3><strong>' + states[0].properties.Status + '<img src="assets/images/moderate_emoji.png" style="height:28px;width:28px;margin-left:5%;padding:2px;">'
      } else if (states[0].properties.Status == "Fail") {
        document.getElementById('riverStatus').innerHTML = '<h3><strong>' + states[0].properties.Status + '<img src="assets/images/fail_bad_emoji.png" style="height:28px;width:28px;margin-left:5%;padding:2px;;">'
      } else if (states[0].properties.Status == "Bad") {
        document.getElementById('riverStatus').innerHTML = '<h3><strong>' + states[0].properties.Status + '<img src="assets/images/fail_bad_emoji.png" style="height:28px;width:28px;margin-left:5%;padding:2px;;">'
      } else if (states[0].properties.Status == "Poor") {
        document.getElementById('riverStatus').innerHTML = '<h3><strong>' + states[0].properties.Status + '<img src="assets/images/fail_bad_emoji.png" style="height:28px;width:28px;margin-left:5%;padding:2px;">'
      }
      // Show issues for water quality TODO add native species
      if (states[0].properties.Cttnfalow > 0) {
        document.getElementById('riverIssue1').innerHTML = '<img src="assets/images/water_droplet.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue1').innerHTML = ''
      }
      if (states[0].properties.Plltfam > 0) {
        document.getElementById('riverIssue2').innerHTML = '<img src="assets/images/pick.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue2').innerHTML = ''
      }
      if (states[0].properties.Physclm > 0) {
        document.getElementById('riverIssue3').innerHTML = '<img src="assets/images/construction.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue3').innerHTML = ''
      }
      if (states[0].properties.Plltfra > 0) {
        document.getElementById('riverIssue4').innerHTML = '<img src="assets/images/tractor.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue4').innerHTML = ''
      }
      if (states[0].properties.pft > 0) {
        document.getElementById('riverIssue5').innerHTML = '<img src="assets/images/car.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue5').innerHTML = ''
      }

      if (states[0].properties.Plltfww > 0) {
        document.getElementById('riverIssue6').innerHTML = '<img src="assets/images/poo.png" style="height:28px;width:28px;">'
      } else {
        document.getElementById('riverIssue6').innerHTML = ''
      }

      var json = {
        "countries_msg_vol": [{
            "url": "../../assets/images/anger.png",
            "hits": states[0].properties.anger
          },
          {
            "url": "../../assets/images/anticipation.png",
            "hits": states[0].properties.antcptn
          },
          {
            "url": "../../assets/images/disgust.png",
            "hits": states[0].properties.disgust
          },
          {
            "url": "../../assets/images/fear.png",
            "hits": states[0].properties.fear
          },
          {
            "url": "../../assets/images/joy.png",
            "hits": states[0].properties.joy
          },
          {
            "url": "../../assets/images/negative.png",
            "hits": states[0].properties.negativ
          },
          {
            "url": "../../assets/images/positive.png",
            "hits": states[0].properties.positiv
          },
          {
            "url": "../../assets/images/sadness.png",
            "hits": states[0].properties.sadness
          },
          {
            "url": "../../assets/images/surprise.png",
            "hits": states[0].properties.surpris
          },
          {
            "url": "../../assets/images/trust.png",
            "hits": states[0].properties.trust
          }

        ]
      };

      // D3 Bubble Chart

      if (states[0].properties.anger > 0) {

        document.getElementById('error').innerHTML = ''
        var diameter = 200;

        var svg = d3.select('#graph').append('svg')
          .attr('width', diameter)
          .attr('height', diameter);

        var tooltip = d3.select("#graph")
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "10px")

        var bubble = d3.layout.pack()
          .size([diameter, diameter])
          .value(function(d) {
            return d.size;
          })
          .padding(3);

        // generate data with calculated layout values
        var nodes = bubble.nodes(processData(json)); // filter out the outer bubble

        var vis = svg.selectAll('circle')
          .data(nodes);

        var mouseover = function(d) {
          tooltip
            .style("opacity", 1)
        }

        var mousemove = function(d) {
          tooltip
            .html("Sentiment %: " + Math.round(d.size))
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = function(d) {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
        }

        vis.enter().append("image")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          .attr("xlink:href", function(d) {

            return d.url;
          })
          .attr("width", function(d) {
            return d.r * 1.3;
          })
          .attr("height", function(d) {
            return d.r * 1.3;
          })
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .attr('class', function(d) {
            return d.className;
          });

      } else {
        document.getElementById('error').innerHTML = 'Opps! There is not enough tweets <br>about this waterbody.'
      }

      function processData(data) {
        var objs = data.countries_msg_vol;

        var newDataSet = [];

        for (var i = 0; i < objs.length; i++) {
          var obj = objs[i];
          newDataSet.push({
            url: obj.url,
            className: obj.url,
            size: obj.hits
          });
        }
        return {
          children: newDataSet
        };
      }

    } else {
      d3.selectAll("svg", "svg1").remove();
      document.getElementById('riverName').innerHTML = '<p>Click on a River</p>';
      document.getElementById('riverStatus').innerHTML = '<p></p>';
      document.getElementById('riverIssue1').innerHTML = '';
      document.getElementById('riverIssue2').innerHTML = '';
      document.getElementById('riverIssue3').innerHTML = '';
      document.getElementById('riverIssue4').innerHTML = '';
      document.getElementById('riverIssue5').innerHTML = '';
      document.getElementById('riverIssue6').innerHTML = '';
    }
  });
});

//
// // Add data
// var data = {
//   "Agriculture And Rural": states[0].properties.Agrarlm,
//   "Domestic General Public": states[0].properties.DmstcGP,
//   "Industry": states[0].properties.Indstry,
//   "Local and Central Government": states[0].properties.LclanCG,
//   "Mining And Quarrying": states[0].properties.Mnnganq,
//   "Navigation": states[0].properties.Navigtn,
//   "No Sector Responsible": states[0].properties.Nsctrrs,
//   "Sector Under Investigation": states[0].properties.Sctruni,
//   "Recreation": states[0].properties.Recretn,
//   "Urban and transport": states[0].properties.Urbnant,
//   "Waste Treatment And Disposal": states[0].properties.Wsttrad,
//   "Water Industry": states[0].properties.WtrInds,
//   "Other": states[0].properties.Other
// }
