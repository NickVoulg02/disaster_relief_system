async function showTables(){
  return fetch("./data.json", {cache: 'no-store'})
  .then(function(response){
    return response.json();
  })

.then(function(data){
    console.log("ok");
     let placeholder = document.getElementById("product");
     let out1 = "<tr><td>pr_name</td><td>pr_id</td><td>pr_cat_id</td><td>detail_name</td><td>detail_value</td><td>cat_name</td><td></td></tr>";

     for(let product of data){
            out1 += `
            <tr><td>${product.pr_name}</td><td>
            ${product.pr_id}</td><td>${product.pr_cat_id}</td><td>${product.detail_name}</td><td>
            ${product.detail_value}</td><td>${product.cat_name}</td>
            <td onclick='openForm(${product.pr_id},"${product.pr_name}")'>Edit</td>
            <td onclick='openBaseForm(${product.pr_id},1)'>Add to Base</td></tr>
            `
    }
    placeholder.innerHTML = out1;

    let placeholder2 = document.getElementById("announcement");
    let out2 = "<tr><td>pr_name</td><td>detail_name</td><td>detail_value</td></tr>";

     for(let product of data){
            out2 += `
            <tr><td>${product.pr_name}</td><td>${product.detail_name}</td><td>
            ${product.detail_value}</td><td onclick='openAnnForm(${product.pr_id})'>Add</td></tr>
            `
    }
    placeholder2.innerHTML = out2;


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