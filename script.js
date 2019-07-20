const uiVariables = (() => {
  return {
    // ALL THE DOM VARIABLES
    domVariables: {
      budget_month: document.querySelector(".budget_month"),
      budget_calculator__global: document.querySelector(".budget_calculator"),
      income__global: document.getElementById("global__income"),
      expense__global: document.getElementById("global__expense"),
      percentage__global: document.getElementById("percent__global"),
      items__percentage: document.querySelectorAll(".percentage-expense"),
      inc__exp__type: document.querySelector(".add_type"),
      description__task: document.querySelector(".task"),
      number__value: document.querySelector(".Value"),
      btn__tick: document.querySelector(".btn-tick"),
      btn__remove__inc: document.getElementById("btn-remove__income"),
      btn__remove__exp: document.getElementById("btn-remove__expense"),
      incomeContainer: document.querySelector(".heading"),
      expenseContainer: document.querySelector(".headingRed"),
      container: document.querySelector(".bottomPart")
    },

    // INPUT VALUE
    domVar__Value: function() {
      return {
        type: uiVariables.domVariables.inc__exp__type.value,
        description: uiVariables.domVariables.description__task.value,
        budget: parseFloat(uiVariables.domVariables.number__value.value)
      };
    },
    updatingUi: function(obj, type) {
      let html, newHtml, elemet;

      // Create a HTML String with PlaceHolder text
      if (type === "inc") {
        element = uiVariables.domVariables.incomeContainer;
        html =
          '<div class="list" id = "inc-%id%"><p class="text-field">%description%</p><button class="btn-remove" id="btn-remove__income"><i class="far fa-times-circle remove"></i></button><span class="right"><p>%value%</p></span></div>';
      } else if (type === "exp") {
        element = uiVariables.domVariables.expenseContainer;
        html =
          '<div class="list" id = "exp-%id%"><p class="text-field">%description%</p><button class="btn-remove exp" id="btn-remove__expense"><i class="far fa-times-circle remove"></i></button><span class="percentage-expenses">23%</span><span class="right exp">%value%</span></div>';
      }
      // Replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      // Insert the HTML into DOM
      element.insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields: function() {
      //   this.domVariables.inc__exp__type.textContent = "";
      uiVariables.domVariables.description__task.value = " ";
      uiVariables.domVariables.number__value.value = "";
      uiVariables.domVariables.description__task.focus();
    },
    displayBudget: function(data) {
      const variables = uiVariables.domVariables;
      variables.budget_calculator__global.textContent = data.budget;
      variables.income__global.textContent = data.totalsInc;
      variables.expense__global.textContent = data.totalsExp;
      if (data.percent > 0) {
        variables.percentage__global.textContent = data.percent + "%";
      } else {
        variables.percentage__global.textContent = "---";
      }
    },
    deletelistItem: function(selectorId) {
      let selectedItem;
      selectedItem = document.getElementById(selectorId);
      selectedItem.remove();
    },
    displayPercentages: function(percentages) {
      let field = document.querySelectorAll(".percentage-expenses");
      console.log(field);

      let nodeforList = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeforList(field, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    }
  };
})();

const budgetCalculation = (uiVar => {
  function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  function Expense(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  function calculateTotal(type) {
    sum = 0;
    data.allItems[type].forEach(cur => {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  }

  let data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItems: function(type, des, val) {
      let newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expense(ID, des, val);
      }
      data.allItems[type].push(newItem);
      console.log(newItem);
      return newItem;
    },
    calculateBudget: function() {
      // Total Income and Expense
      calculateTotal("inc");
      calculateTotal("exp");
      // Total Budget (Income - Expense)
      data.budget = data.totals.inc - data.totals.exp;
      // Total Percent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    deleteItem: function(type, id) {
      let ids, index;
      ids = data.allItems[type].map(current => {
        return current.id;
      });
      console.log(ids);

      index = ids.indexOf(id);
      console.log(index);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculatePercentage: function() {
      data.allItems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      let allPerc = data.allItems.exp.map(cur => {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        percent: data.percentage,
        totalsExp: data.totals.exp,
        totalsInc: data.totals.inc
      };
    }
  };
})(uiVariables);

const controller = ((uiCtrl, bgtCtrl) => {
  function updateBudget() {
    // Calculate the Budget
    bgtCtrl.calculateBudget();
    // Return the Budget
    let budget = bgtCtrl.getBudget();

    // Display the Budget on the UI
    uiCtrl.displayBudget(budget);
  }

  function calculatePercentage() {
    // Calculate the Percentage
    bgtCtrl.calculatePercentage();

    // Read Percentage from the Budget Controll
    let percentage = bgtCtrl.getPercentages();

    // Update the UI with Percentage
    uiCtrl.displayPercentages(percentage);
  }

  function ctrladdItems() {
    let input, newItems;

    // Take the Input Value
    input = uiCtrl.domVar__Value();

    if (input.description !== "" && !isNaN(input.budget) && input.budget > 0) {
      // Add the Item to the budget controller
      newItems = bgtCtrl.addItems(input.type, input.description, input.budget);

      // Add the Item to the UI
      uiCtrl.updatingUi(newItems, input.type);

      //Clear the Fields
      uiCtrl.clearFields();

      // Calculate the Budget And Display into the UI
      updateBudget();

      // Calculate the Percentage
      calculatePercentage();
    }
  }

  function ctrldeleteItems(e) {
    let itemsId, splitId, id;
    itemsId = e.target.parentNode.parentNode.id;
    if (itemsId) {
      splitId = itemsId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      // Delete the Item from the Data Structure
      bgtCtrl.deleteItem(type, id);

      // Delete the Item from the UI
      uiCtrl.deletelistItem(itemsId);
      console.log(itemsId);

      // Recalculate and Show the New Budget
      updateBudget();

      // Calculate the Percentage
      calculatePercentage();
    }
  }

  return {
    initialization: function() {
      const array__month = [
        "January",
        "Febuary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "October",
        "November",
        "December"
      ];
      const date = new Date();
      const year = date.getFullYear();
      const month = array__month[date.getMonth()];
      const variables = uiCtrl.domVariables;

      variables.budget_month.textContent = `${month} ${year}`;
      variables.budget_calculator__global.textContent = 0;
      variables.income__global.textContent = 0;
      variables.expense__global.textContent = 0;
      variables.percentage__global.textContent = 0;

      variables.btn__tick.addEventListener("click", ctrladdItems);

      document.addEventListener("keypress", e => {
        if (e.keypress === 13 || e.which === 13) {
          ctrladdItems();
        }
      });
      variables.container.addEventListener("click", function(e) {
        ctrldeleteItems(e);
      });
    }
  };
})(uiVariables, budgetCalculation);

controller.initialization();
