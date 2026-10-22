async function showTables(){
  return fetch("./data.json", {cache: 'no-store'})
  .then(function(response){
    return response.json();
  })

.then(function(data){
    console.log("ok");
     let placeholder = document.getElementById("product");
     let out1 = "";

     for(let product of data){
            out1 += `
            <tr><td>${product.pr_name}</td><td style='display:none;'>
            ${product.pr_id}</td><td>${product.detail_name}</td><td>
            ${product.detail_value}</td><td>${product.cat_name}</td>
            <td class='clickable'onclick='openForm(${product.pr_id},"${product.pr_name}")'>Edit</td>
            <td class='clickable'onclick='openBaseForm(${product.pr_id},1)'>Add to Base</td></tr>
            `
    }
    placeholder.innerHTML = out1;

    let placeholder2 = document.getElementById("announcement");
    let out2 = "";

     for(let product of data){
            out2 += `
            <tr><td>${product.pr_name}</td><td>${product.detail_value}</td>
            <td class = "clickable" onclick='openAnnForm(${product.pr_id})'>Add</td></tr>
            `
    }
    placeholder2.innerHTML = out2;

})
}