$(document).ready(function () {
  loadItems();

  clearAll();

  addDollar();
  addQuarter();
  addDime();
  addNickel();

  returnChange();
  vendItem();
  let amount;
});

function loadItems() {
  clearVendingMachine();
  let itemTable = $("#itemTable");
  $("#errorMessages").empty();

  $.ajax({
    type: "GET",
    url: "http://vending.us-east-1.elasticbeanstalk.com/items",

    success: function (itemArray) {
      $.each(itemArray, function (index, item) {
        let id = item.id;
        let name = item.name;
        let price = item.price;
        let quantity = item.quantity;

        let row = "<div class='card'>";
        row += '<div class="card-title bg-light" ><h5>' + id + "</h5></div>";
        row += "<div class='card-text bg-light'> Item: " + name;
        row += "<br>";
        row += "Price:" + price;
        row += "<br>";
        row += "Quantity Left:" + quantity;
        row += "<br><br> </div>";
        row +=
         '<button type="button" id="addButton" class="btn btn-outline-dark" onclick="selectItem(' +id + ')">Add</button>';
        row += "</div>";
        itemTable.append(row);
      });
    },
    error: function () {
      $("#errorMessages").append(
        $("<li>")
          .attr({ class: "list-group-item list-group-item-danger" })
          .text("Error calling web service. Please try again later.")
      );
    },
  });
}

function selectItem(id) {
  $("#itemChoice").val(id);
}


function clearVendingMachine() {
  $("#itemTable").empty();
}

function addDollar() {
  $("#addDollar").click(function () {
    amount = +$("#moneyIn").val();
    amount = amount + 1.0;
    $("#moneyIn").val(amount.toFixed(2));
  });
}
function addQuarter() {
  $("#addQuarter").click(function () {
    amount = +$("#moneyIn").val();
    amount = amount + 0.25;
    $("#moneyIn").val(amount.toFixed(2));
  });
}
function addNickel() {
  $("#addNickel").click(function () {
    amount = +$("#moneyIn").val();
    amount = amount + 0.05;
    $("#moneyIn").val(amount.toFixed(2));
  });
}
function addDime() {
  $("#addDime").click(function () {
    amount = +$("#moneyIn").val();
    amount = amount + 0.1;
    $("#moneyIn").val(amount.toFixed(2));
  });
}

function returnChange() {
  $("#changeButton").click(function () {
    if ($("#moneyIn").val() == "") {
      $("#changeField").val("No Change, Please add Money");
      $("#itemChoice").val("");
      $("#message").val("");
      return false;
    }

    amount = +$("#moneyIn").val();
    amount = amount * 100;

    let numQuarters = Math.floor(amount / 25);
    amount = amount - numQuarters * 25;
    let numDimes = Math.floor(amount / 10);
    amount = amount - numDimes * 10;
    let numNickels = Math.floor(amount / 5);
    let numPennies = amount - numNickels * 5;
    numPennies = Math.floor(numPennies);

    changeMessage(numQuarters, numDimes, numNickels, numPennies);
    $("#message").val("");
  });
}

function vendItem() {
  $("#makePurchase").click(function (event) {
    $("#message").val("");
    if ($("#itemChoice").val() == "") {
      $("#message").val("Please make a selection");
      $("#changeField").val("");
      return false;
    }

    let id = $("#itemChoice").val();
    let amount = $("#moneyIn").val();
    $.ajax({
      type: "POST",
      url:
        "http://vending.us-east-1.elasticbeanstalk.com/money/" +
        amount +
        "/item/" +
        id,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      dataType: "json",

      success: function (change) {
        changeMessage(
          change.quarters,
          change.dimes,
          change.nickels,
          change.pennies
        );
        $("#message").val("Thank You!!");

        loadItems();
      },
      error: function (message) {
        let error = JSON.parse(message.responseText);
        $("#message").val(error.message);
        loadItems();

        $("#errorMessages").append(
          $("<li>")
            .attr({ class: "list-group-item list-group-item-danger" })
            .text("Error calling web service. Please try again later.")
        );
      },
    });
  });
}

function clearAll() {
  $("#message").val("");
  $("#changeField").val("");
  $("#moneyIn").val("");
  $("#itemChoice").val("");
}

function changeMessage(numQuarters, numDimes, numNickels, numPennies) {
  let returnedBalance = "";
  if (numQuarters > 0) {
    if (numQuarters == 1) {
      returnedBalance += numQuarters + " Quarter, ";
    } else {
      returnedBalance += numQuarters + " Quarters, ";
    }
  }
  if (numDimes > 0) {
    if (numDimes == 1) {
      returnedBalance += numDimes + " Dime, ";
    } else {
      returnedBalance += numDimes + " Dimes, ";
    }
  }
  if (numNickels > 0) {
    if (numNickels == 1) {
      returnedBalance += numNickels + " Nickel, ";
    } else {
      returnedBalance += numNickels + " Nickels, ";
    }
  }
  if (numPennies > 0) {
    if (numPennies == 1) {
      returnedBalance += numPennies + " Penny";
    } else {
      returnedBalance += numPennies + " Pennies";
    }
  }
  $("#changeField").val(returnedBalance);
  $("#moneyIn").val("");
  $("#itemChoice").val("");
}
