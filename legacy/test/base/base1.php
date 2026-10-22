<?php
    session_start();
    if ($_SESSION["usertype"] != 'admin' || $_SESSION["usertype"] == NULL){ 
      header("Location: /test/signup/form.php");
    }
    require_once "json_creator.php";

?>


<!DOCTYPE html> 
<html>
<link rel="stylesheet" href="style.css">
<title>Base</title>
<script src = "base_options.js"></script>

<script>
  
    showTables();
    function openForm(str1, str2) {
      document.getElementById("editProdForm").style.display = "block";
      document.getElementById("id").value = str1;
      console.log(str1);
      document.getElementById("prname").value = str2;
      console.log(str2);
    }

    function openForm2() {
      document.getElementById("newProdForm").style.display = "block";
    }

    function openAnnForm(str) {
      document.getElementById("annForm").style.display = "block";
      document.getElementById("annid").value = str;
      console.log(str);
    }

    function openBaseForm(str, str2) {
      if(str2==1)
        document.getElementById("addbaseForm").style.display = "block";
        document.getElementById("baseid").value = str;
      if(str2==2)
        document.getElementById("removebaseForm").style.display = "block";
        document.getElementById("removeid").value = str;
      if(str2==3)
        document.getElementById("removeentireForm").style.display = "block";
        document.getElementById("removeentireid").value = str;
      console.log(str);
    }

    function closeForm(str) {
      document.getElementById(str).style.display = "none";
    }

    function editProduct() {
      let pr_name = document.getElementById("prname").value;
      console.log(pr_name)
      let det_name = document.getElementById("detname").value;
      let det_val = document.getElementById("detval").value;
      let cat_name = document.getElementById("catname").value;
      let id = document.getElementById("id").value;
      const str = "pr_name="+pr_name+"&det_name="+det_name+"&det_val="+det_val+
      "&cat_name="+cat_name+"&id="+id;
  
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint").innerHTML = this.responseText;
          showTables();
        }
      }
      xmlhttp.open("GET","update_prod.php?"+str,true);
      xmlhttp.send();
    }

    function addProduct() {
      let pr_name = document.getElementById("prnamenew").value;
      let det_name = document.getElementById("detnamenew").value;
      let det_val = document.getElementById("detvalnew").value;
      let cat_name = document.getElementById("catnamenew").value;
      const str = "pr_name="+pr_name+"&det_name="+det_name+"&det_val="+det_val+
      "&cat_name="+cat_name;
      
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint2").innerHTML = this.responseText;
          showTables();
        }
      }
      xmlhttp.open("GET","add_prod.php?"+str,true);
      xmlhttp.send();
    }

    function viewBase() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("base").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "viewBase.php", true);     // add button select number
      xhttp.send();
    }

    function addToBase() {
      let id = document.getElementById("baseid").value;
      let basequantiy = document.getElementById("basequantity").value;
      const str = "id="+id+"&basequantiy="+basequantiy;
      
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint6").innerHTML = this.responseText;
          viewBase();
          showTables();
          closeForm("addbaseForm");
        }
      }
      xmlhttp.open("GET","addToBase.php?"+str,true);
      xmlhttp.send();
    }

    function removeBase() {
      let id = document.getElementById("removeid").value;
      let basequantiy = document.getElementById("removequantity").value;
      const str = "id="+id+"&basequantiy="+basequantiy;
      
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint6").innerHTML = this.responseText;
          viewBase();
          showTables();
          closeForm("removebaseForm");
       
        }
      }
      xmlhttp.open("GET","removeBase.php?"+str,true);
      xmlhttp.send();
    }

    function removeEntire() {
      let id = document.getElementById("removeentireid").value;
      let basequantiy = document.getElementById("removeentirequantity").value;
      const str = "id="+id+"&basequantiy="+basequantiy;
      
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint6").innerHTML = this.responseText;
          viewBase();
          closeForm("removeentireForm");
        }
      }
      xmlhttp.open("GET","removeEntire.php?"+str,true);
      xmlhttp.send();
    }

    function addCategory() {
      let catname = document.getElementById("catnameadd").value;
      const str = "category="+catname;
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint3").innerHTML = this.responseText;
        }
      }
      xmlhttp.open("GET","addcategory.php?"+str,true);
      xmlhttp.send();
    }

    function addAnnouncement() {
      let ann_id = document.getElementById("annid").value;
      let ann_num = document.getElementById("annnum").value;
      const str = "ann_id="+ann_id+"&ann_num="+ann_num;
      
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint5").innerHTML = this.responseText;
          showAnnouncements();
        }
      }
      xmlhttp.open("GET","add_ann.php?"+str,true);
      xmlhttp.send();
    }

    function showAnnouncements(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("ann_table").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "announcement_table.php", true);     // add button select number
      xhttp.send();
    }

    function deleteAnnouncement(str){
      console.log(str)
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("announceHint").innerHTML = this.responseText;
        showAnnouncements();
        }
      };
      xhttp.open("GET", "deleteAnnouncement.php?id="+str, true);     // add button select number
      xhttp.send();
    }

    function base1() {
      window.open("base1.php",true);
    }
    function base2() {
      window.open("base2.php",true);
    }
    function base3() {
      window.open("base3.php",true);
    }
</script>


  <body>

  <br>
  <div class="btn-group">
      <button onclick="base1()">Base Items and Announcements</button>
      <button onclick="base2()">Map and Item Overview</button>
      <button onclick="base3()">Volunteer Account Management</button>
  </div>

  <?php 
      echo "<h3 style='color: white; font-size:16px; margin-left: 440px;'>Welcome, ".$_SESSION['user_username']."!</h3>";
  ?>

    <div class = "main">
      <h3>Product Storage Management</h3>
      <h4>Edit any details concerning the stored products.
        From here you can also load items to the base, making them available for pickup to any volunteer.
      </h4>
      <div class="block">
      <table>
          <thead><tr><th>Product Name</th><th style='display:none;'>ID</th>
          <th>Detail</th><th>Value</th><th>Category</th><th></th><th></th></tr></thead>
      <tbody id ="product"></tbody>
      </table>

    <script src = "base_options.js"></script>

      <div class="form-popup" id="editProdForm"> 
          <br>
          <input type='hidden' id='id' value="">
          <label>Product name:</label>
          <input type='text' id='prname' value="">
          <label> Detail Name:</label>
          <input type='text' id='detname'><br>
          <br>
          <label>Detail Value:</label>
          <input type='text' id='detval'>
          <label> Category Name:</label>
          <input type='text' id='catname'><br><br>
          <button type="reset" onclick='editProduct()'>Update Product Catalogue</button>
          <button onclick="closeForm('editProdForm');">Close</button>
          <br><div id="txtHint"><b></b></div> 
      </div>
    </div>
    
    <div class="block">
      <button name="newProd" onclick="openForm2()">Add New Product to Storage</button> 
      <br>
      <div class="form-popup" id="newProdForm"> 
          <br>
          <label>Product name:</label>
          <input type='text' id='prnamenew'>
          <label> Detail Name:</label>
          <input type='text' id='detnamenew'><br>
          <br>
          <label>Detail Value:</label>
          <input type='text' id='detvalnew'>
          <label> Category Name:</label>
          <input type='text' id='catnamenew'><br><br>
          <button type="reset" onclick='addProduct()'>Update Product Catalogue</button>
          <button name="close" onclick="closeForm('newProdForm');">Close</button>
        <div id="txtHint2"><b></b></div> 
      </div>
    </div>
  </div>

  <div class="main">
    <div class="block">
      <h3>Base Management</h3>
      <h4>Remove items from the base by loading them back to the base or remove them entirely</h4> 
      <table>
      <thead><tr><th>Product Name</th><th style='display:none;'>base_pr_id</th><th>Category</th><th>Quantity available in Base</th><th></th><th></th></tr></thead>
      <tbody id ="base">
      <script>viewBase()</script>
      </tbody>
      </table>
      <div class="form-popup" id="addbaseForm">
        <input type='hidden' id='baseid' value="">
        <label>Select quantity to be added:</label>
        <input type='number' id='basequantity' value="">
        <button style ="margin-left:20px" type="reset" onclick = "addToBase()">Submit</button> 
        <button style ="margin-left:10px" name="close" onclick="closeForm('addbaseForm');">Close</button>
      </div>
  </div>

  <div class="block">
    <div><b>Remove Items from Base and Return them to Storage</b></div>
    <div class="form-popup" id="removebaseForm">
        <input type='hidden' id='removeid' value="">
        <label>Select quantity to be removed:</label>
        <input type='number' id='removequantity' value="">
        <button style ="margin-left:20px" type="reset" onclick = "removeBase()">Submit</button>   
        <button style ="margin-left:10px" name="close" onclick="closeForm('removebaseForm');">Close</button>
    </div>
  </div>
    
  <div class="block">
    <div><b>Remove Items Entirely from Storage</b></div>
    <div class="form-popup" id="removeentireForm">
        <input type='hidden' id='removeentireid' value="">
        <label>Select quantity to be removed entirely:</label>
        <input type='number' id='removeentirequantity' value="">
        <button style ="margin-left:20px" type="reset" onclick = "removeEntire()">Submit</button>
        <button style ="margin-left:10px" name="close" onclick="closeForm('removeentireForm');">Close</button>
    </div> 
  </div>

    <div id="txtHint6"><b></b></div> 
  </div>
    
  <div class="main">
    <h4>Add New Categories for the Products</h4>
    <div class="block">
        <label>Category Name:</label>
        <input type='text' id="catnameadd">
        <button type="reset" style ="margin-left:20px" onclick = "addCategory()">Add Category</button>
        <div id="txtHint3"><b></b></div>  
    </div>
  </div>
      

  <div class="main">
    <div><b>Create new Announcements, visible to users who want to Donate.</b></div><br>
    <div class="block">
      <table style="width:80%">
      <thead><tr><th>Product Name</th><th>Quantity</th><th></th></tr></thead>
      <tbody id="announcement"></tbody>
      </table>
      <br>
    <div class="form-popup" id="annForm">
        <input type='hidden' id='annid' value="">
        <label>Select number of items requested:</label>
        <input type='number' id='annnum' value="">
        <button style="margin-left:5px" type="reset" onclick = "addAnnouncement()">Submit</button>
        <button style ="margin-left:10px" name="close" onclick="closeForm('annForm');">Close</button>
        <div id="txtHint5"><b></b></div>
    </div>
  </div>
  </div>


  <div class="main">
    <div><b>Announcements Posted</b></div><br>
    <div class="block">
          <table style="width:65%">
          <thead>
            <tr><th>Product Name</th><th>Requested Quantity</th><th></th></tr>
          </thead>
          <tbody id="ann_table">
            <script>showAnnouncements()</script>
          </tbody>
          </table>
      <br>
      <div id="announceHint"><b></b></div> 
    </div>
  </div>

    <form style="text-align:center" action="logout_handler.php" method="post"> 
      <button class="logout"> Log Out</button>
    </form>

    
    </body>
</html>