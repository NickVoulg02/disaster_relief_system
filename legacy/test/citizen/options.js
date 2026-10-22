fetch("./data.json", {cache: 'no-store'})
.then(function(response){
  return response.json();
})

.then(function(data){
     let placeholder = document.getElementById("categories");
     let out1 = "<option selected disabled hidden>Choose here</option>";      //the first option was disabled
     let cat = [];
     for(let category of data){
          if(!cat.includes(category.cat_name)){
            cat.push(category.cat_name);
            out1 += `
            <option>${category.cat_name}</option>
            `
          }
      
     }
    placeholder.innerHTML = out1;
    var activities = document.getElementById("categories");

    activities.addEventListener("change", function() {
        var option = activities.value;
        console.log(option);
        const arr = []
        for(let product of data){
          if(product.cat_name==option)
          {
              arr.push(product.pr_name);
          }
        }
        console.log(arr);
        var products = document.getElementById("products");

        products.addEventListener("input", function() {
          var val = products.value;
          //create a DIV element that will contain the items (values):
          a = document.createElement("DIV");
          a.setAttribute("id", this.id + "autocomplete-list");
          a.setAttribute("class", "autocomplete-items");
          //append the DIV element as a child of the autocomplete container:
          this.parentNode.appendChild(a);
          for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
              /*create a DIV element for each matching element:*/
              b = document.createElement("div");
              /*make the matching letters bold:*/
              b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
              b.innerHTML += arr[i].substr(val.length);
              /*insert a input field that will hold the current array item's value:*/
              b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
              /*execute a function when someone clicks on the item value (DIV element):*/
                  b.addEventListener("click", function(e) {
                  /*insert the value for the autocomplete text field:*/
                  products.value = this.getElementsByTagName("input")[0].value;
                  var x = document.getElementsByClassName("autocomplete-items");
                  for (var i = 0; i < x.length; i++) {
                      x[i].parentNode.removeChild(x[i]);
                  }
                  /*close the list of autocompleted values,
                  (or any other open lists of autocompleted values:*/
                  })
              a.appendChild(b);
            }
          }
          });
      
        
    });
})
