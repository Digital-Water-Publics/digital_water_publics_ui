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

        vis.enter().append("image")
          .attr("xlink:href", function(d) {

            return d.url;
          })
          .attr("width", function(d) {
            return d.r;
          })
          .attr("height", function(d) {
            return d.r;
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




      //Show sentiment score
      // document.getElementById('Anger').innerHTML = +states[0].properties.anger;
      // document.getElementById('Anticipation').innerHTML = +states[0].properties.antcptn;
      // document.getElementById('Disgust').innerHTML = +states[0].properties.disgust;
      // document.getElementById('Fear').innerHTML = +states[0].properties.fear;
      // document.getElementById('Joy').innerHTML = +states[0].properties.joy;
      // document.getElementById('Negative').innerHTML = +states[0].properties.negativ;
      // document.getElementById('Positive').innerHTML = +states[0].properties.positiv;
      // document.getElementById('Sadness').innerHTML = +states[0].properties.sadness;
      // document.getElementById('Surprise').innerHTML = +states[0].properties.surpris;
      // document.getElementById('Trust').innerHTML = +states[0].properties.trust;


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
      // document.getElementById('Anger').innerHTML = '';
      // document.getElementById('Anticipation').innerHTML = '';
      // document.getElementById('Disgust').innerHTML = '';
      // document.getElementById('Fear').innerHTML = '';
      // document.getElementById('Joy').innerHTML = '';
      // document.getElementById('Negative').innerHTML = '';
      // document.getElementById('Positive').innerHTML = '';
      // document.getElementById('Sadness').innerHTML = '';
      // document.getElementById('Surprise').innerHTML = '';
      // document.getElementById('Trust').innerHTML = '';
    }
  });
});


// document.getElementById('AgricultureAndRural').innerHTML = '<p>' + states[0].properties.Agrarlm;
// document.getElementById('DomesticGeneralPublic').innerHTML = '<p>' + states[0].properties.DmstcGP;
// document.getElementById('Industry').innerHTML = '<p>' + states[0].properties.Indstry;
// document.getElementById('LocalandCentralGovernment').innerHTML = '<p>' + states[0].properties.LclanCG;
// document.getElementById('MiningAndQuarrying').innerHTML = '<p>' + states[0].properties.Mnnganq;
// document.getElementById('Navigation').innerHTML = '<p>' + states[0].properties.Navigtn;
// document.getElementById('NoSectorResponsible').innerHTML = '<p>' + states[0].properties.Nsctrrs;
// document.getElementById('SectorUnderInvestigation').innerHTML = '<p>' + states[0].properties.Sctruni;
// document.getElementById('Recreation').innerHTML = '<p>' + states[0].properties.Recretn;
// document.getElementById('Urbanandtransport').innerHTML = '<p>' + states[0].properties.Urbnant;
// document.getElementById('WasteTreatmentAndDisposal').innerHTML = '<p>' + states[0].properties.Wsttrad;
// document.getElementById('WaterIndustry').innerHTML = '<p>' + states[0].properties.Wtrinds;
// document.getElementById('Other').innerHTML = '<p>' + states[0].properties.Other;

// var width = 250
// var height = 250
// var margin = 20
//
// // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
// var radius = Math.min(width, height) / 2 - margin
//
// // append the svg object to the div called 'my_dataviz'
// var svg = d3.select("#my_dataviz")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height)
//   .append("g")
//   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
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
//
// // set the color scale
// var color = d3.scaleOrdinal()
//   .domain(data)
//   .range(["#9CAFB7", "#ADB993", "#D0D38F", "#F6CA83", "#949D6A", "#523A34", "#393E41", "#1A5E63", "#3D0B37", "#63264A", "#14264d"]);
//
// // Compute the position of each group on the pie:
// var pie = d3.pie()
//   .value(function(d) {
//     return d.value;
//   })
// var data_ready = pie(d3.entries(data))
// // Now I know that group A goes from 0 degrees to x degrees and so on.
//
// // shape helper to build arcs:
// var arcGenerator = d3.arc()
//   .innerRadius(0)
//   .outerRadius(radius)
//
// // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
// svg
//   .selectAll('mySlices')
//   .data(data_ready)
//   .enter()
//   .append('path')
//   .attr('d', arcGenerator)
//   .attr('fill', function(d) {
//     return (color(d.data.key))
//   })
//   .attr("stroke", "black")
//   .style("stroke-width", "2px")
//   .style("opacity", 0.7)
//
// // Now add the annotation. Use the centroid method to get the best coordinates
// svg
//   .selectAll('mySlices')
//   .data(data_ready)
//   .enter()
//   .append('text')
//   .text(function(d) {
//     if (d.value > 0) {
//       return d.data.key
//     }
//   })
//   .attr("transform", function(d) {
//     return "translate(" + arcGenerator.centroid(d) + ")";
//   })
//   .style("text-anchor", "middle")
//   .style("font-size", 8)
//   .on("mouseover", function(d) {
//     d3.select("#tooltip")
//       .style("left", d3.event.pageX + "px")
//       .style("top", d3.event.pageY + "px")
//       .style("opacity", 1)
//       .select("#sector")
//       .text(d.data.key)
//       .select("#value")
//       .text(d.value);
//   })
//   .on("mouseout", function() {
//     // Hide the tooltip
//     d3.select("#tooltip")
//       .style("opacity", 0);;
//   });
//
//
// //
// // append the svg object to the div called 'my_dataviz'
// var svg1 = d3.select("#my_dataviz1")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height)
//   .append("g")
//   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
//
// // Add data
// var data1 = {
//   "Changes to the natural flow and levels of water": states[0].properties.Cttnfalow,
//   //"Non-native invasive species": states[0].properties.Nn-ntis,
//   "Physical modifications": states[0].properties.Physclm,
//   "Pollution from abandoned mines": states[0].properties.Plltfam,
//   "Pollution from rural areas": states[0].properties.Plltfra,
//   "Pollution from towns, cities and transport": states[0].properties.pft,
//   "Pollution from waste water": states[0].properties.Plltfww,
// }
//
// // set the color scale
// var color1 = d3.scaleOrdinal()
//   .domain(data1)
//   .range(["#D1C6AD", "#BBADA0", "#A1869E", "#797596", "#0B1D51", "#2660A4", "#56351E", "#3A606E", "#4B543B", "#232020"]);
//
// // Compute the position of each group on the pie:
// var pie1 = d3.pie()
//   .value(function(d) {
//     return d.value;
//   })
// var data_ready1 = pie(d3.entries(data1))
// // Now I know that group A goes from 0 degrees to x degrees and so on.
//
// // shape helper to build arcs:
// var arcGenerator1 = d3.arc()
//   .innerRadius(0)
//   .outerRadius(radius)
//
// // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
// svg1
//   .selectAll('mySlices')
//   .data(data_ready1)
//   .enter()
//   .append('path')
//   .attr('d', arcGenerator1)
//   .attr('fill', function(d) {
//     return (color(d.data.key))
//   })
//   .attr("stroke", "black")
//   .style("stroke-width", "2px")
//   .style("opacity", 0.7)
//
// // Now add the annotation. Use the centroid method to get the best coordinates
// svg1
//   .selectAll('mySlices')
//   .data(data_ready1)
//   .enter()
//   .append('text')
//   .text(function(d) {
//     if (d.value > 0) {
//       return d.data.key
//     }
//   })
//   .attr("transform", function(d) {
//     return "translate(" + arcGenerator1.centroid(d) + ")";
//   })
//   .style("text-anchor", "middle")
//   .style("font-size", 8)
//   .on("mouseover", function(d) {
//     d3.select("#tooltip")
//       .style("left", d3.event.pageX + "px")
//       .style("top", d3.event.pageY + "px")
//       .style("opacity", 1)
//       .select("#sector")
//       .text(d.data.key)
//   })
//   .on("mouseout", function() {
//     // Hide the tooltip
//     d3.select("#tooltip")
//       .style("opacity", 0);;
//   });
