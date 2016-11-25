require("../css/styles.scss");
d3 = require("d3")
_ = require("underscore")

var city_average

// empty array for the intervals
var intervals = []

// cracker counter that maintains a total count of all our stuff
var crackerCounter = {
        'ladi':0,
        'chakri':0,
        'fuljhadi':0,
        'pulpul':0,
        'snake':0,
        'anar':0
    }

d3.json("js/data.json",(function(error, data ) {
  $('#city_selector').on('change',function(){
        var city = ($('#city_selector').val())
        delhi_list = _.chain(data.reports)
                    .filter(function(e){return (e.station.city == city) && 
                      (e.recent.pollutants.pm25)
                    })
                    .pluck('recent')
                    .pluck('pollutants')
                    .pluck('pm25')
                    .pluck('concentration')
                    .value()

        city_average = Math.round(d3.sum(delhi_list)/delhi_list.length)
        $('.current-level').html(city_average + current_exposure)
        d3.select('.current-level-line')
                   .transition()
                   .duration(1000)
                    .attr('x',xScale(city_average+current_exposure))
                   $('.current-level').html(city_average+Math.round(current_exposure));
        d3.select('.cal-arrow-label')
          .transition()
          .duration(1000)
          .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")
        updateShareText()

  })
  delhi_list = _.chain(data.reports)
                    .filter(function(e){return (e.station.city == "Delhi") && 
                      (e.recent.pollutants.pm25)
                    })
                    .pluck('recent')
                    .pluck('pollutants')
                    .pluck('pm25')
                    .pluck('concentration')
                    .value()

  city_average = Math.round(d3.sum(delhi_list)/delhi_list.length)
  updateShareText()
  var current_exposure = 0

  // name our categories
  var scales = [
     {
         'name':'good',
         'min':0,
         'max': 36,
         'color':'#76C2AC'
     },
     {
        'name':'moderate',
        'min':36.5,
        'max':66,
        'color': '#FAE290'
     },
     {
        'name':'severe',
        'min':105,
        'color': '#D67E7D'
     }
  ]

  // set the width and height of the meter
  var windowWidth = $(window).width()
  var bar = {width: (windowWidth<850)?(windowWidth*0.9):800, height: 30, max: 400}
  var margin = {top: 5, bottom: 5, left: 5, right: 10}
  // code for my scale
  var mobile_gap = (windowWidth<600)?60:0
  var xScale = d3.scaleLinear()
                 .domain([0,bar.max])
                 .range([0,bar.width])

  // x axis
  xAxis = d3.axisBottom(xScale)
           .ticks((windowWidth<850)?(5):8);

  // let's create a chart
  var chart = d3.select('.pollution-meter')
                .append('svg')
                .attr('height',bar.height*2)
                .attr('width',bar.width+margin.left+margin.right)
                .append('g')
                .attr('class','chart')
                .style('fill','#ccc')
                .attr('transform','translate('+margin.left+',0)')

  // append color ranges for the base
  chart.selectAll('.marker')
        .data(scales)
        .enter()
        .append('rect')
        .attr('class',function(d){return 'marker '+d.name})
        .attr('height',bar.height)
        .style('fill',function(d){return d.color})
        .attr('width',function(d,i){
              if (i>0){
                 if (i==(scales.length-1)){
                    return xScale(bar.max - scales[i-1].max)
                 } else {
                     return xScale(d.max - scales[i-1].max)
                 }
                
              } else {
                 return xScale(d.max)
              }
           })
        .attr('transform',function(d,i){
              if (i>0){
                  return 'translate('+xScale(scales[i-1].max)+',0)'
              }
           })


  // line for the current meter
  chart.append('rect')
        .attr('class','current-level-line')
        .attr('height',bar.height)
        .attr('width',6)
        .attr('x',xScale(city_average+current_exposure))
        .attr('y',0)
        .style('fill','#fff')
        .style('stroke-width','1.5')
        .style('stroke','#1a1a1a')


  // append the axis
  chart.append("g")
     .attr('class','axis')
     .attr("transform", "translate(0,30)")
     .call(xAxis);

  // append the marker
  d3.select('.cal-arrow-label')
    .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")

  // update the pm meter with the level
  $('.current-level').html(city_average+current_exposure)

  // our lovely crackers
  var cracker_data = [
      {
          'cracker': 'anar',
          'pol': 4860,
          'effect': 3,
          'burning': 0.2
      },
      {
          'cracker':'ladi',
          'pol':38540,
          'effect':6,
          'burning':0.8
      },
      {
          'cracker':'snake',
          'pol':38540,
          'effect':6,
          'burning':0.8
      },
      {
          'cracker':'pulpul',
          'pol':28950,
          'effect':3,
          'burning':0.5
      },
      {
          'cracker':'fuljhadi',
          'pol':10390,
          'effect':2,
          'burning':0.3
      },
      {
          'cracker':'chakri',
          'pol':9490,
          'effect':5,
          'burning':0.2
      }
  ]

  // what happens when you click on a cracker
  $('.cracker-con').on('click',function(){
    
    // find the cracker that you just clicked on
     var obj = _.findWhere(cracker_data,{cracker: ($(this).attr('data-which'))})
      
     crackerCounter[obj.cracker]++;

     current_exposure = current_exposure + obj.pol;
      
     bar.max = current_exposure+2000;
     
     xScale.domain([0,bar.max ])

     updateShareText(obj)
     d3.select('.axis')
     .transition()
     .duration(2000)
     .call(xAxis);

     d3.selectAll('.marker')
        .transition()
        .duration(2000)
        .attr('width',function(d,i){
           if (i>0){
              if (i==(scales.length-1)){
                 return xScale(bar.max - scales[i-1].max)
              } else {
                  return xScale(d.max - scales[i-1].max)
              }
           } else {
              return xScale(d.max)
           }
        })
        .attr('transform',function(d,i){
           if (i>0){
               return 'translate('+xScale(scales[i-1].max)+',0)'
           }
        })

      intervals[sum(crackerCounter)-1]={
        interval: setInterval(function(){
      
          current_exposure = current_exposure - ( obj.pol / ( obj.effect * 60 * (10) ) )

          d3.select('.current-level-line')
               .transition()
                .attr('x',xScale(city_average+current_exposure))
               .duration(100)
        
               $('.current-level').html(city_average+Math.round(current_exposure));

            $('.cal-arrow-label').css('left',xScale(city_average+current_exposure))

          }, 100)
      }
      cleartimer(intervals[sum(crackerCounter)-1].interval,obj)

     d3.select('.current-level-line')
        .transition()
        .duration(1500)
        .attr('x',xScale(city_average+current_exposure))

     d3.select('.cal-arrow-label')
        .transition()
        .duration(1500)
        .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")

      var back_pos = parseInt($(this).css('background-position').split(' ')[1].split('px')[0])
     var cracker = $(this).attr('data-which')
     var minus = parseInt($(this).attr('data-minus'))
     var myint = setInterval(function(){
        back_pos = back_pos-minus
        if (back_pos >= -(minus*5)){
           $('.cracker-con[data-which="'+cracker+'"]').addClass('playing')
           $('.cracker-con[data-which="'+cracker+'"]').css('background-position',('0 '+back_pos+'px'))
        } else {
           $('.cracker-con[data-which="'+cracker+'"]').removeClass('playing')
           $('.cracker-con[data-which="'+cracker+'"]').css('background-position',('0 0'))
           clearInterval(myint)
        }
     },500)

  })

  $('.cracker-con').on('mouseover',function(e){
     var minus = parseInt($(this).attr('data-minus'))
     $(this).css('background-position',('0 -'+minus+'px'))
  })

  $('.cracker-con').on('mouseout',function(e){
     $(this).css('background-position',('0 0'))
  })

  // functions go here

  function sum(obj) {
    var sum = 0;
    for( var el in obj ) {
      if( obj.hasOwnProperty( el ) ) {
        sum += parseFloat( obj[el] );
      }
    }
    return sum;
  }

  function cleartimer(e,obj){
    setTimeout(function(){
        clearInterval(e)
    },obj.effect * 60 * 1000)
  }

  $('.crackers-container').slick({
    dots: false,
    infinite: true,
    speed: 300,
    arrow: true,
    slidesToShow: 6,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 982,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

  function updateShareText(obj){
    var option

    if (!obj){
      if (city_average>200){
        option = "The level of pollution in your city is alarming. Do you still want to burn crackers?"
      } else if (city_average>100){
        option = "The air in your city is already polluted. Do you still want to burn crackers?"
      } else if (city_average>60){
        option = "Air quality in your city is way above what is deemed safe, even before you have burnt crackers."
      } else {
        option = "Your city might be less polluted than others but choose wisely."
      }
    } else{
      
      var times = Math.round((city_average+current_exposure)/(city_average+current_exposure-obj.pol)), time_text;

        if (times==1){
          time_text = ['even worse','much worse'][_.random(0,1)]
        } else if (times == 2){
          time_text = 'twice as bad'
        } else if (times == 3){
          time_text = 'thrice as bad'
        } else {
          time_text = times + ' times worse'
        }

      var first = 'You just made the air around you ' + time_text +'.'
      var second = 'You are breathing air that is ' + Math.round((city_average+current_exposure)/40) +' times worse than what is deemed safe.'
      var third = 'That '+obj.cracker+' releases dust that is '+Math.round(obj.pol/40)+' times more than the recommended level.'
      var fourth = 'A single '+obj.cracker+' makes the air around you '+Math.round(obj.pol/city_average)+' times worse.'
      var fifth = sum(crackerCounter)+' firecrackers later, the air around you is '+ Math.round((city_average+current_exposure)/40) +' times worse than what is deemed safe.'
      var tweet = fourth
      if (obj.cracker=="snake"){
        option = ["Snake tablets are atleast 300 times worse than Delhi's average air.","Snake tablets are the worst. Treat them like real snakes. Run away!",second][_.random(0, 2)];
        tweet = ["Snake tablets are 300 times worse than Delhi's average air.","Snake tablets are the worst. Treat them like real snakes. Run away!"][_.random(0, 1)];
      } else if (sum(crackerCounter)==1){
        option = fourth
      } else if (obj.cracker=="anar"){
        option = [('That pretty little flowerpot spews dust that is '+Math.round(obj.pol/40)+' times more than the recommended level.'),first,second,third][_.random(0, 3)];
      } else if (sum(crackerCounter)>5){
        option = ['How many crackers will you burn? You have already lighted up '+ sum(crackerCounter)+" of them.",second,third,fifth][_.random(0, 3)]
      } else {
        option = [first,second,third][_.random(0,2)]
      }
    }
    $('.share-text').html(option+'<a href="http://twitter.com/intent/tweet?url=http://www.hindustantimes.com/static/diwali-crackers-pollution&amp;text='+(tweet?tweet:'How toxic are your favorite firecrackers?')+ '&amp;via=httweets" target="_blank"><i class="fa fa-twitter social-button" aria-hidden="true"></i></a>')
  }
  $('.clean-air').on('click',function(){
    var oldexposure = current_exposure
    
    intervals.forEach(function(e){
      clearInterval(e.interval)
    })

    $.each(crackerCounter, function(key, value) {
      crackerCounter[key]=0
    });

    current_exposure=0

    bar.max = current_exposure+400;
     
     xScale.domain([0,bar.max ])

     d3.select('.axis')
     .transition()
     .duration(2000)
     .call(xAxis);

     d3.selectAll('.marker')
        .transition()
        .duration(2000)
        .attr('width',function(d,i){
           if (i>0){
              if (i==(scales.length-1)){
                 return xScale(bar.max - scales[i-1].max)
              } else {
                  return xScale(d.max - scales[i-1].max)
              }
           } else {
              return xScale(d.max)
           }
        })
        .attr('transform',function(d,i){
           if (i>0){
               return 'translate('+xScale(scales[i-1].max)+',0)'
           }
        })

    $('.current-level').html(city_average)
    d3.select('.current-level-line')
               .transition()
               .duration(1000)
               .attr('x',xScale(city_average))
               $('.current-level').html(city_average);
    
    d3.select('.cal-arrow-label')
      .transition()
      .duration(1000)
      .attr('style', "left:"+xScale(city_average)+"px;")
      
      updateShareText()
      
  })

}))