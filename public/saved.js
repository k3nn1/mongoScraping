$.getJSON("/saved", function (data) {
    for (var i = 0; i < data.length; i++) {

        // This will create the format of the cards and data that will populate on the doc
        $("#articles").append(
            "<div class='col-sm-4' ><div class='card'><div class='card-body'><a class='title-link' href='" + data[i].link + "'><h5>" + data[i].title + "</h5></a><hr><p class='card-text'>" + data[i].snippet + "</p><button data-id='" + data[i]._id + "'class='btnNote btn btn-primary btn-sm' data-toggle='modal' data-target='#myModal'>Note</button><button data-id='" + data[i]._id + "'class = 'btnDelete btn btn-primary btn-sm'>Delete Article</button></div></div></div>"
        );
    }
    console.log("articles: " + data);
});

// When you click the Note  button
$(document).on("click", ".btnNote", function () {
    // empty the notes from the modal area
    $(".modal-title").empty();
    $(".input").empty();

    // save the id from the .btnNote
    var thisId = $(this).attr("data-id");
    console.log("btnNote thisId: " + thisId);

    // Ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .done(function (data) {
            console.log("data:" + data);
            //Title of article, a textarea to add note, and save button with id of the article saved to it.
            $(".modal-title").append("<h5>" + data.title + "</h5>");
            $(".input").append("<textarea id='bodyinput' name='body'></textarea>");
            $(".input").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary' data-dismiss='modal'>Save Note</button>");

            // if there's a note in the article
            if (data.note) {
                $("#bodyinput").val(data.note.body);
            }
        });
});

// When you click savenote button
$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");
    console.log(" savenote thisid: " + thisId);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        .done(function (data) {
            console.log("data: " + data)
            //empty notes section
            $(".input").empty();
        });

    // Also removes the values entered in the input and textarea for note area
    $("#bodyinput").val("");
});

// When delete button is clicked
$(document).on("click", ".btnDelete", function() {
    var thisId = $(this).attr("data-id");
    console.log("btnDelete: " + thisId);

    $.ajax({
        method: "PUT",
        url: "/delete/" + thisId
    })
        .done(function(data) {
            console.log(data);
            location.reload();
        });
});