///////////////////////////////////////////
//****** INITIALIZING VARIABLES ******/////
///////////////////////////////////////////
// sections[key=section_name, value=section_times]
var sections = new Map();
// sections[key=room_name, value=room_times]
var rooms = new Map();
// professors[key=last_name, value=section_names]
var professors = new Map();
var possibilities = new Map();
var assignments = new Map();
var filePath = "";

var professor_sections = new Map();

// array to push the sections that do have possibilities
var section_no_poss = [];
// array to push the sections that have professor conflicts
var section_no_prof = [];

//////////////////////////////////////
//****** READ IN THE CSV *******/////
////////////////////////////////////

function readCSV(csv_data) {
  var allTextLines = csv_data.split(/\r?\n|\n/);
  // console.log(allTextLines);
  // headers = ["Section", "Room", "Professor"]
  var headers = allTextLines[0].split(',');
  // console.log(headers);
  var lines = [];
  for (var i = 1; i < allTextLines.length; i++) {
    // data = ["CA_Mon115-235.Wed115-235.Tue250-410.Thu250-410.Mon830-950.Fri830-950", "1023_Mon115-235.Mon250-410.Mon425-545.Mon600-720.T…20.Fri830-950.Fri1005-1125.Fri1140-100.Fri600-720", "Dutro_AB.DA.FC.GC"]
    var data = allTextLines[i].split(',');
    // console.log(data);
    if (data.length == headers.length) {
      var organized_data = [];
      for (var j = 0; j < headers.length; j++) {
        // Section:BB_Mon1005-1125.Wed1005-1125.Tue250-410.Thu250-410.Mon115-235.Fri1005-1125
        // Room:0042_.Tue830-950.Tue1005-1125.Thu830-950.Thu1005-1125
        // Professor:Alexander_AA.BA.DC.EB.IA
        organized_data.push(headers[j] + ":" + data[j]);
      }
      lines.push(organized_data);
      // console.log(lines);
    }
  }
  for (var a = 0; a < lines.length; a++) {
    // FORMAT OF AN ITEM IN LINES
    // Array(2)
    // 0 : "Section:AA_Mon830-950.Wed830-950"
    // 1 : "Room:0020_Mon830-950.Wed830-950"
    // 2 : "Professor:Alexander_AA.BA.DC.EB.IA
    // length : 3
    var column = lines[a];
    // each column [] is a header
    var section_avail = column[0];
    var room_avail = column[1];
    var prof_avail = column[2];
    // parse section availability in column[0]
    // section = AA
    var section = section_avail.substr(section_avail.indexOf(":") + 1, 2);
    // section_times = Mon830-950.Wed830-950.Tue1005-1125.Thu1005-1125.Mon600-720.Fri830-950
    var section_times = section_avail.substr(section_avail.indexOf("_") + 1, section_avail.length);
    var temp1 = [];
    // temp1 = ["Mon830-950", "Wed830-950", "Tue1005-1125", "Thu1005-1125", "Mon600-720", "Fri830-950"]
    temp1 = section_times.split('.');
    sections.set(section, temp1);
    // parse room availability in column[1]
    // room = Room:
    var room = room_avail.substr(room_avail.indexOf(":") + 1, 4);
    var room_times = room_avail.substr(room_avail.indexOf("_") + 1, room_avail.length);
    var temp2 = [];
    // temp2 = ["Tue830-950", "Tue1005-1125", "Thu830-950", "Thu1005-1125"]
    temp2 = room_times.split('.');
    rooms.set(room, temp2);
    // parse professor availability in column[2]
    // last name = Alexander:
    var last_name_start = prof_avail.indexOf(":")+1;
    var last_name_end = prof_avail.indexOf("_");
    var last_name_full = prof_avail.substring(last_name_start,last_name_end);
    var p_sections = prof_avail.substr(prof_avail.indexOf("_") + 1, prof_avail.length);
    var temp3 = [];
    // temp3 = ["AA", "AC", "BA", "BB", "BC", "CA", "CB", "CC"]
    temp3 = p_sections.split('.');
    professors.set(last_name_full, temp3);
  }
  list_rooms();
  list_professors();
  find_matches();
  generate_accordian();
  // FOR THE RESULTS ACCORDIAN
  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}

////////////////////////////
//****** MATCH *******/////
///////////////////////////
// this method iterates through the section and room
// maps and finds the matches in the times and pushes
// the matches to a new map called possibilities
function find_matches() {
  for (var section of sections.keys()) {
    var section_times = sections.get(section);
    var match = [];
    for (room of rooms.keys()) {
      var room_times = rooms.get(room);
      for (var i = 0; i < section_times.length; i++) {
        for (var j = 0; j < room_times.length; j++) {
          if (section_times[i] == room_times[j]) {
            match.push("ROOM" + [room] + "@" + room_times[j]);
          }
        }
      }
    }
    var match2 = [];
    $.each(match, function(i, el) {
      if ($.inArray(el, match2) === -1) match2.push(el);
    });
    possibilities.set(section, match2);
  }
}

//////////////////////////////////////////
//****** LIST ROOMS FOR REFERENCE *****//
////////////////////////////////////////
// this is a function that writes the room into the html
function list_rooms() {
  var room_nums = [];
  for (room of rooms.keys()) {
    room_nums.push(room);
  }
  var output = "<ul class=\"collection\">";
  for (r of room_nums) {
    output += "<li class=\"collection-item\">" + r + "</li>";
  }
  output += "</ul>";
  $("#room").append(output);
}

//////////////////////////////////////////
//** LIST Professors FOR REFERENCE ****//
////////////////////////////////////////
// this is a function that writes the room into the html
function list_professors() {
  var professors_names = [];
  for (name of professors.keys()) {
    professors_names.push(name);
  }
  var output = "<ul class=\"collection\">";
  for (sec of sections.keys()) {
    var temp = [];
    for (prof_name of professors_names) {
      var prof_secs = professors.get(prof_name);
      for (prof_sec of prof_secs) {
        if (sec == prof_sec) {
          temp.push(prof_name);
        }
      }
    }
    professor_sections.set(sec, temp);
  }
  var professors_names2 = [];
  for (professor_section2 of professor_sections.keys()) {
    professors_names2.push(professor_section2);
  }
  var output = "<ul class=\"collection\">";
  for (ps of professors_names2) {
    var names = professor_sections.get(ps);
    output += "<li class=\"collection-item\">" + ps + " = " + names + "</li>";
  }
  output += "</ul>";
  $("#professors").append(output);
}



//////////////////////////////////////////
//****** OUTPUT FOR POSSIBILITIES *****//
////////////////////////////////////////
function generate_accordian() {
  var all_keys = [];
  for (section of possibilities.keys()) {
    all_keys.push(section);
  }
  var string_out = "";
  for (var i = 0; i < all_keys.length; i++) {
    var p = possibilities.get(all_keys[i]);
    string_out += "<button class=\"accordion\">" + all_keys[i] + "<i style='float:right'class='material-icons'>expand_more</i></button><div class=\"panel\"><p>" + p + "</p></div>";
  }
  var string_out2 = string_out.replace(/,/g, '<br>');
  $("#accord").append(string_out2);
}

function check_for_professor_availability() {
  var all_sections = [];
  for (section of assignments.keys()) {
    all_sections.push(section);
  }
  for (var i = 0; i < all_sections.length; i++) {
    var rt1 = assignments.get(all_sections[i]);
    if (rt1 == "no possibilities") {
      section_no_poss.push(all_sections[i]);
    }
    for (var j = 1; j < all_sections.length; j++) {
      var rt2 = assignments.get(all_sections[j]);
      if (rt1.substring(9, rt1.length) == rt2.substring(9, rt2.length)) {
        for (p of professors.keys()) {
          var p_section = professors.get(p);
          if ((p_section.includes(all_sections[i]) && p_section.includes(all_sections[j])) && (all_sections[i] != all_sections[j])) {
            section_no_prof.push(all_sections[i]);
            $('.collection li').each(function() {
              var item = $(this);
              var text = item.text();
              if (text.includes(rt1.substring(9, rt1.length))) {
                // assign();
                $(this).css({
                  'color': 'blue'
                });
              }
            });
          }
        }
      }
    }
  }
}

////////////////////////////////////////
//****** ASSIGN POSSIBILITIES*****/////
//////////////////////////////////////
function assign() {
  // empty the arrays for no possibilities and professor conflicts
  // for when it is called again in the fix conflicts method.
  section_no_poss = [];
  section_no_prof = [];

  $("#assignments").html('');
  var already_assigned = [];
  var i = 0;
  for (section of possibilities.keys()) {
    var p = possibilities.get(section);
    i = Math.floor(Math.random() * p.length);
    if (!already_assigned.includes(p[i])) {
      assignments.set(section, p[i]);
      already_assigned.push(p[i]);
    } else {
      assignments.set(section, "no possibilities");
    }
  }
  var output2 = "";
  var output3 = "<ul id=mmm class=\"collection\">";
  for (assignment of assignments.keys()) {
    var room_and_time = assignments.get(assignment);
    output2 = assignment + "=" + room_and_time + "<br/>";
    output3 += "<li class=\"collection-item\">" + output2 + "</li>";
  };
  output3 += "</ul>";
  $("#assignments").append(output3);

  $('.collection li').each(function() {
    var item = $(this);
    var text = item.text();
    if (text.includes("no possibilities")) {
      $(this).css({
        'color': 'red',
        'font-size': '150%'
      });
    }
  });
  check_for_professor_availability();
  fix_professors();
}

/////////////////////////////////
//****** FIX CONFLICTS *******//
///////////////////////////////
function fix_professors() {
  // if there are elements in the no possibilities array OR
  // if there are elements in the professor conflicts array
  if (section_no_poss.length > 0 || section_no_prof.length > 0) {
    // then call the assign function until the arrays are empty
    do {
      assign();
    } while (section_no_poss.length > 0 || section_no_prof.length > 0);
  }
}


/////////////////////////////////////////////////////
//****** Convert data into proper 2D array *******//
///////////////////////////////////////////////////
function download_CSV() {

  var newkeys = Array.from(assignments.keys());
  var newvalues = Array.from(assignments.values());

  var newroom = []
  var newtime = []

  newvalues.forEach(name => {
    let splat = name.split('@')

    newroom.push(splat[0])
    newtime.push(splat[1])
  });

  var newresults = zip(newkeys, newroom, newtime);

  arrayToCSV(newresults);
}


/////////////////////////////////
//****** zip N arrays *******///
///////////////////////////////

function zip(a, b, c) {
  var arr = [];
  for (var key in a) arr.push([a[key], b[key], c[key]]);
  return arr;
}


///////////////////////////////////////
//****** Array to CSV format *******//
/////////////////////////////////////

function arrayToCSV(twoDiArray) {
  //  Modified from: http://stackoverflow.com/questions/17836273/
  //  export-javascript-data-to-csv-file-without-server-interaction
  var csvRows = [];
  for (var i = 0; i < twoDiArray.length; ++i) {
    for (var j = 0; j < twoDiArray[i].length; ++j) {
      twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"'; // Handle elements that contain commas
    }
    csvRows.push(twoDiArray[i].join(','));
  }

  var csvString = csvRows.join('\r\n');
  var a = document.createElement('a');
  a.href = 'data:attachment/csv,' + csvString;
  a.target = '_blank';
  a.download = 'myFile.csv';

  document.body.appendChild(a);
  a.click();
  // Optional: Remove <a> from <body> after done
}

/////////////////////////
//****** BEGIN *******//
///////////////////////
window.onload = function() {
  // this is a function for uploading the csv
  $("#filename").change(function(e) {
    var ext = $("#filename").val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["csv"]) == -1) {
      alert('Upload CSV');
      return false;
    }
    if (e.target.files != undefined) {
      var reader = new FileReader();
      reader.onload = function(e) {
        readCSV(e.target.result);
      }
      reader.readAsText(e.target.files.item(0));
    }
  });
};
