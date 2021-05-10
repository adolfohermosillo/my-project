function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
    exp.startT = Date.now();
    }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  


  slides.one_slider = slide({
    name : "one_slider",
    present: exp.stims, //every element in exp.stims is passed to present_handle one by one as 'stim'
    
    present_handle : function(stim) {
      $(".err").hide();
    
      this.stim = stim; // store this information in the slide so you can record it later
      $(".prompt").html(stim.sentence);

      var objimagehtml = '<img src="img/stimuli/'+stim.item+ '_'+ '0.png" style="height:250px; width:250px; ">';
      $(".food1").html(objimagehtml);

      var objimagehtml = '<img src="img/stimuli/'+stim.item+'_'+stim.state+'.png" style="height:250px; width:250px; ">';
      $(".food2").html(objimagehtml);


     
      $('input[name="natural"]').prop("checked", false);

      // this.init_sliders();
      // exp.sliderPost = null; //erase current slider value
    },

    button : function() {
      exp.response = $('input[name="natural"]:checked').val();
      if (exp.response == null) {
        $(".err").show();
      } else {
        this.log_responses();

      /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
      _stream.apply(this);
      }
    },

    // init_sliders : function() {
    //   utils.make_slider("#single_slider", function(event, ui) {
    //     exp.sliderPost = ui.value;
    //   });
    // },

    log_responses : function() {
    exp.data_trials.push({
        "slide_number" : exp.phase,
        "item" : this.stim.item,
        //"condition" : this.stim.condition,
        "progress" : this.stim.state,
        "maximal" : this.stim.maximality,
        "stim" : this.stim.sentence,
        "response" : exp.response
    });

    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

  //exp.conditions = _.sample(items, 7);
  console.log(exp.conditions);



  // items to choose from
  var eat_maximal = ['cookie','banana'];
  var eat_non_maximal = ['apple','wing'];
  var drink_maximal = ['beer','water']; 
  var drink_non_maximal = ['tea','coke'];

  var sentences = {"tea" : "Andy drank the tea",
          "water" : "Andy drank the water",
          "coke" : "Andy drank the coke",
          "beer" : "Andy drank the beer",
          "apple" : "Andy ate the apple",
          "banana" : "Andy ate the banana",
          "wing" : "Andy ate the wing",
          "cookie" : "Andy ate the cookie"}

  var maximality = {"tea" : "partial",
          "water" : "maximal",
          "coke" : "partial",
          "beer" : "maximal",
          "apple" : "partial",
          "banana" : "maximal",
          "wing" : "partial",
          "cookie" : "maximal"}

  var healthy = {"tea" : "healthy",
          "water" : "healthy",
          "coke" : "unhealthy",
          "beer" : "unhealthy",
          "apple" : "healthy",
          "banana" : "healthy",
          "wing" : "unhealthy",
          "cookie" : "unhealthy"}

  //states: event progressions
  var critical_states = ['1','2','3','4'];
  var filler_states = ['1','2','3','4'];

  //randomize
  shuffle(eat_maximal);
  shuffle(eat_non_maximal);
  shuffle(drink_maximal);
  shuffle(drink_non_maximal);
  shuffle(critical_states);
  shuffle(filler_states);

  //chose critical items and filler items
  var critical_items = [eat_maximal[0], eat_non_maximal[0], drink_maximal[0], drink_non_maximal[0]];
  var filler_items = [eat_maximal[1], eat_non_maximal[1], drink_maximal[1], drink_non_maximal[1]]


  //filler starting state
  var initial_state = ['0', '0', '0', '0'];

  //basline state
  var end_state= ['5', '5', '5', '5'];

  //critical trials
  var critical = critical_items.map(function(element, i) {
    return { item: element , state: critical_states[i], maximality: maximality[element], sentence: sentences[element] }; 
  });

  var complete = critical_items.map(function(element, i) {
    return { item: element , state: end_state[i], maximality: maximality[element], sentence: sentences[element] }
    //return [[ element , end_state[i], maximality[element], sentences[element]]]; 
  });

  // filler trials
  var incompletes = filler_items.map(function(element, i) {
    return  { item: element , state: filler_states[i], maximality: maximality[element], sentence: sentences[element] }

    //return [[ element , filler_states[i],   maximality[element], sentences[element]]]; 
  });
  var fillers = filler_items.map(function(element, i) {
    return { item: element , state: initial_state[i], maximality: maximality[element], sentence: sentences[element] }

    //return [[ element , initial_state[i],  maximality[element], sentences[element]]]; 
  });

  // trials per participant
  var trials = critical //+ complete + incompletes + fillers;




  exp.stims = _.sample(_.shuffle(items), 16);

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };

  //blocks of the experiment:
  exp.structure=["i0", "instructions", "one_slider", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
