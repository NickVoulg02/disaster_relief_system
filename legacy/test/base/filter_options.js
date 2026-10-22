async function showFilters(){
  return fetch("./data.json", {cache: 'no-store'})
  .then(function(response){
    return response.json();
  })

.then(function(data){
    console.log("ok");
    let placeholder3 = document.getElementById("filter_buttons")
    let out3 = "";
    let cat = [];

    for(let category of data){
      if(!cat.includes(category.cat_name)){
        cat.push(category.cat_name);
        out3 += `
        <input type="checkbox" id="${category.cat_name}" onclick="filter(this.id)">${category.cat_name}
        `
      }
      //<label for="checkbox_id">${category.cat_name}</label>
    }
    out3 += `
        <input type="checkbox" id="ALL" onclick="filter(this.id)">ALL
        `

    placeholder3.innerHTML = out3;

})
}